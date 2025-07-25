import { IInputs, IOutputs } from "./generated/ManifestTypes";
import MyAgGrid from './components/AgGrid'
import React from "react";
import ReactDOM from "react-dom";
import '@fluentui/react/dist/css/fabric.css';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { toLocalIsoMinutes } from './utils/date';

// Ensure all community grid modules are registered for compatibility with
// the latest AG Grid versions.
ModuleRegistry.registerModules([AllCommunityModule]);

interface EditedCell {
    rowId: string;
    field: string;
    oldValue: unknown;
    newValue: unknown;
    rowKey?: unknown;
}

interface RowPatch {
    rowId: string;
    changes: Record<string, unknown>;
    rowKey?: unknown;
}

export class AgGrid implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private gridContainer: HTMLDivElement;
    private _notifyOutputChanged?: () => void;
    private _selectedRowIds: string[] = [];
    private _rowData: any[] = [];
    private _columnDefs: any[] = [];
    private _editedCells: EditedCell[] = [];
    private _editedMap: Map<string, EditedCell> = new Map();
    private _rowPatchesMap: Map<string, RowPatch> = new Map();
    private _editedRows: RowPatch[] = [];
    private _editedRowRecords: any[] = [];
    private _originalRowData: Record<string, any> = {};
    private readonly _cellsSchemaObj = {
        $schema: "http://json-schema.org/draft-04/schema#",
        type: "array",
        items: {
            type: "object",
            properties: {
                rowId: { type: "string" },
                field: { type: "string" },
                oldValue: { type: "string" },
                newValue: { type: "string" },
                rowKey: { type: "string" }
            }
        }
    };
    private _rowsSchemaObj: Record<string, unknown> = {
        $schema: "http://json-schema.org/draft-04/schema#",
        type: "array",
        items: {
            type: "object",
            properties: {
                rowKey: { type: "string" }
            },
            additionalProperties: true
        }
    };
    private _context?: ComponentFramework.Context<IInputs>;
    private _multiSelect: boolean = true;
    private _rowKeyField?: string;
    private _readOnly: boolean = false;
    private _showEdited: boolean = false;
    private _lastResetFlag: boolean = false;
    private _lastResetSelectionFlag: boolean = false;
    private _resetVersion: number = 0;
    private _fontSize?: number;

    private formatToMinutes(val: unknown): unknown {
        if (val instanceof Date) {
            return toLocalIsoMinutes(val);
        }
        if (typeof val === 'string') {
            const m = val.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
            if (m) {
                return m[1];
            }
        }
        return val;
    }

    private formatDisplay(val: unknown): string {
        if (val === null || val === undefined || val === '') {
            return '';
        }
        let parsed: string | Date | undefined = undefined;
        if (val instanceof Date) {
            parsed = val;
        } else if (typeof val === 'string') {
            const iso = this.formatToMinutes(val);
            parsed = typeof iso === 'string' ? new Date(iso) : undefined;
        }
        if (parsed instanceof Date && !isNaN(parsed.getTime())) {
            const dateStr = parsed.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            });
            const timeStr = parsed.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            return `${dateStr} ${timeStr}`;
        }
        return String(val);
    }


    private buildRowSchema(columns: Array<{ name: string }>): Record<string, unknown> {
        const properties: Record<string, unknown> = {};
        columns.forEach(col => {
            properties[col.name] = { type: "string" };
        });
        properties["rowKey"] = { type: "string" };
        return {
            $schema: "http://json-schema.org/draft-04/schema#",
            type: "array",
            items: {
                type: "object",
                properties,
                additionalProperties: true
            }
        };
    }

    /**
     * Empty constructor.
     */
    constructor() {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this._notifyOutputChanged = notifyOutputChanged;
        this._context = context;
        this.container = container;
        this.container.style.width = "100%";
        this.container.style.height = "100%";
        this.container.style.overflow = "hidden";
        this.container.style.backgroundColor = "transparent";

        this.gridContainer = document.createElement("div");
        this.gridContainer.style.width = "100%";
        this.gridContainer.style.height = "100%";
        this.gridContainer.style.backgroundColor = "transparent";

        this.container.appendChild(this.gridContainer);
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;
        const resetFlag = context.parameters.ResetChanges.raw === true;
        if (resetFlag && resetFlag !== this._lastResetFlag) {
            this.resetChanges();
        }
        this._lastResetFlag = resetFlag;
        const resetSelectionFlag = context.parameters.ResetSelection.raw === true;
        if (resetSelectionFlag && resetSelectionFlag !== this._lastResetSelectionFlag) {
            this.clearSelection();
        }
        this._lastResetSelectionFlag = resetSelectionFlag;
        const dataset = context.parameters.gridData;
        this._multiSelect = context.parameters.MultiSelect.raw !== false;
        this._rowKeyField = context.parameters.RowKey.raw || undefined;
        this._readOnly = context.parameters.ReadOnly.raw === true;
        this._fontSize = context.parameters.FontSize.raw !== null ? context.parameters.FontSize.raw : undefined;
        this._showEdited = context.parameters.ShowEdited.raw === true;
        let selectedKeys: string[] | undefined;
        const selectedKeysInput = context.parameters.SelectedRowKeys.raw;
        let selectedKeysValid = false;
        if (selectedKeysInput !== undefined && selectedKeysInput !== null && selectedKeysInput !== "") {
            try {
                const temp = JSON.parse(selectedKeysInput as any);
                if (Array.isArray(temp)) {
                    selectedKeys = temp.map(v => String(v));
                    selectedKeysValid = true;
                } else {
                    console.warn('SelectedRowKeys value is not an array');
                }
            } catch (e) {
                console.error('Failed to parse SelectedRowKeys', e);
            }
        }
        const columnDefsInput = context.parameters.ColumnDefinitions.raw;
        let parsedDefs: any[] | undefined;
        if (columnDefsInput) {
            try {
                const temp = JSON.parse(columnDefsInput as any);
                if (Array.isArray(temp)) {
                    temp.forEach(def => {
                        if (def && def.cellDataType && !def.dataType) {
                            def.dataType = def.cellDataType;
                        }
                        if (def?.cellEditor === 'agDateStringCellEditor') {
                            def.cellEditor = 'fluentDateTimeCellEditor';
                            if (!def.valueFormatter) {
                                def.valueFormatter = (p: any) => this.formatDisplay(p.value);
                            }
                            if (!def.filter) {
                                def.filter = 'agDateColumnFilter';
                            }
                        }
                        if (def?.filter === 'agDateColumnFilter') {
                            def.cellEditorPopup = true;
                            def.filterParams = {
                                browserDatePicker: true,
                                inputType: 'datetime-local',
                                includeTime: true,
                                step: 60,
                                ...(def.filterParams || {})
                            };
                        }
                    });
                    parsedDefs = temp;
                }
            } catch (e) {
                console.error('Failed to parse ColumnDefinitions', e);
            }
        }
        const columnsArray = dataset.columns as any[];
        this._columnDefs = parsedDefs ?? columnsArray.map(col => {
            const def: any = {
                field: col.name,
                headerName: col.displayName
            };
            const dt = (col.dataType || '').toLowerCase();
            if (dt.includes('dateandtime')) {
                def.filter = 'agDateColumnFilter';
                def.cellEditor = 'fluentDateTimeCellEditor';
                def.cellEditorPopup = true;
                def.dataType = 'dateTimeString';
                def.filterParams = {
                    browserDatePicker: true,
                    inputType: 'datetime-local',
                    includeTime: true,
                    step: 60
                };
                def.valueFormatter = (p: any) => this.formatDisplay(p.value);
            } else if (dt.includes('date')) {
                def.filter = 'agDateColumnFilter';
                def.cellEditor = 'fluentDateTimeCellEditor';
                def.cellEditorPopup = true;
                def.dataType = 'dateString';
                def.filterParams = {
                    browserDatePicker: true,
                    inputType: 'datetime-local',
                    includeTime: true,
                    step: 60
                };
            }
            return def;
        });
        this._rowsSchemaObj = this.buildRowSchema(dataset.columns as any);
        const rowData = dataset.sortedRecordIds.map(id => {
            const record = dataset.records[id];
            const row: any = { __id: id };
            dataset.columns.forEach(col => {
                let value: any;
                const dt = (col.dataType || '').toLowerCase();
                if (dt.includes('date')) {
                    value = record.getValue(col.name);
                } else {
                    value = record.getFormattedValue?.(col.name);
                    if (value === undefined || value === null || value === '') {
                        value = record.getValue(col.name);
                    }
                }
                if (value instanceof Date) {
                    value = toLocalIsoMinutes(value);
                }
                if (dt.includes('dateandtime')) {
                    value = this.formatToMinutes(value);
                }
                row[col.name] = value;
            });
            const rowKeyValue = this._rowKeyField ? row[this._rowKeyField] : id;
            row["rowKey"] = rowKeyValue;
            this._originalRowData[id] = { ...row, rowKey: rowKeyValue };
            return row;
        });
        // Apply pending edits so changes persist across re-renders
        rowData.forEach(row => {
            const rowId = row.__id;
            this._editedMap.forEach(change => {
                if (change.rowId === rowId) {
                    (row as any)[change.field] = change.newValue;
                }
            });
        });
        let finalRowData = rowData;
        if (this._showEdited) {
            const editedIds = new Set(Array.from(this._rowPatchesMap.keys()));
            finalRowData = rowData.filter(r => editedIds.has(r.__id));
        }
        this._rowData = finalRowData;
        if (selectedKeysValid) {
            const keyMap = new Map<string, string>();
            finalRowData.forEach(r => keyMap.set(String(r.rowKey), r.__id));
            const ids = (selectedKeys ?? [])
                .map(k => keyMap.get(String(k)))
                .filter((id): id is string => id !== undefined);
            this._selectedRowIds = ids;
            dataset.setSelectedRecordIds(ids);
        } else {
            this._selectedRowIds = dataset.getSelectedRecordIds();
        }
        ReactDOM.render(
            React.createElement(MyAgGrid, {
                rowData: finalRowData,
                columnDefs: this._columnDefs,
                selectedRowIds: this._selectedRowIds,
                onSelectionChanged: this.onRowsSelected.bind(this),
                onCellValueChanged: this.onCellEdited.bind(this),
                headerColor: context.parameters.HeaderColor.raw || undefined,
                paginationColor: context.parameters.PaginationColor.raw || undefined,
                gridBackgroundColor: context.parameters.GridBackgroundColor.raw || undefined,
                fontSize: this._fontSize,
                enableBlur: context.parameters.EnableBlur.raw === true,
                multiSelect: this._multiSelect,
                readOnly: this._readOnly,
                showPagination: context.parameters.ShowPagination.raw !== false,
                resetVersion: this._resetVersion
            }),
            this.gridContainer
        );

    }

    private onRowsSelected(rows: any[]): void {
        this._selectedRowIds = rows.map(r => r.__id);
        if (this._context) {
            this._context.parameters.gridData.setSelectedRecordIds(this._selectedRowIds);
        }
        if (this._notifyOutputChanged) {
            this._notifyOutputChanged();
        }
    }

    private valuesAreEqual(a: unknown, b: unknown): boolean {
        if (a === b) {
            return true;
        }
        if (a == null && b == null) {
            return true;
        }
        return String(a) === String(b);
    }

    private onCellEdited(change: EditedCell): void {
        const key = `${change.rowId}_${change.field}`;
        const originalRow = this._originalRowData[change.rowId];
        const originalValue = originalRow ? originalRow[change.field] : change.oldValue;
        const rowKeyValue = originalRow ? originalRow.rowKey : change.rowId;

        if (this.valuesAreEqual(change.newValue, originalValue)) {
            // Reverted to original value - remove tracking
            this._editedMap.delete(key);
            const rowPatch = this._rowPatchesMap.get(change.rowId);
            if (rowPatch) {
                delete rowPatch.changes[change.field];
                if (Object.keys(rowPatch.changes).length === 0) {
                    this._rowPatchesMap.delete(change.rowId);
                } else {
                    this._rowPatchesMap.set(change.rowId, rowPatch);
                }
            }
        } else {
            const existing = this._editedMap.get(key);
            if (existing) {
                existing.newValue = change.newValue;
            } else {
                this._editedMap.set(key, { rowId: change.rowId, field: change.field, oldValue: originalValue, newValue: change.newValue, rowKey: rowKeyValue });
            }

            const rowPatch = this._rowPatchesMap.get(change.rowId) || { rowId: change.rowId, changes: {}, rowKey: rowKeyValue };
            rowPatch.changes[change.field] = change.newValue;
            rowPatch.rowKey = rowKeyValue;
            this._rowPatchesMap.set(change.rowId, rowPatch);
        }

        this._editedCells = Array.from(this._editedMap.values());
        this._editedRows = Array.from(this._rowPatchesMap.values());
        this._editedRowRecords = this._editedRows.map(patch => ({
            rowKey: patch.rowKey !== undefined
                ? patch.rowKey
                : this._originalRowData[patch.rowId]?.rowKey,
            ...patch.changes
        }));

        if (this._notifyOutputChanged) {
            this._notifyOutputChanged();
        }
    }

    private resetChanges(): void {
        this._editedMap.clear();
        this._rowPatchesMap.clear();
        this._editedCells = [];
        this._editedRows = [];
        this._editedRowRecords = [];
        this._resetVersion++;
    }

    private clearSelection(): void {
        this._selectedRowIds = [];
        if (this._context) {
            this._context.parameters.gridData.setSelectedRecordIds([]);
        }
    }


    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return {
            EditedCells: this._editedCells,
            EditedRows: this._editedRowRecords,
            EditedCellsSchema: JSON.stringify(this._cellsSchemaObj),
            EditedRowsSchema: JSON.stringify(this._rowsSchemaObj)
        };
    }

    public async getOutputSchema(context: ComponentFramework.Context<IInputs>): Promise<Record<string, unknown>> {
        return Promise.resolve({
            EditedCells: this._cellsSchemaObj,
            EditedRows: this._rowsSchemaObj
        });
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this.gridContainer);
    }
}
