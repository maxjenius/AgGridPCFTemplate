import { IInputs, IOutputs } from "./generated/ManifestTypes";
import MyAgGrid from './components/AgGrid'
import React from "react";
import ReactDOM from "react-dom";

interface EditedCell {
    rowId: string;
    field: string;
    oldValue: unknown;
    newValue: unknown;
}

interface RowPatch {
    rowId: string;
    changes: Record<string, unknown>;
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
                newValue: { type: "string" }
            }
        }
    };
    private _rowsSchemaObj: Record<string, unknown> = {
        $schema: "http://json-schema.org/draft-04/schema#",
        type: "array",
        items: {
            type: "object",
            additionalProperties: true
        }
    };
    private _context?: ComponentFramework.Context<IInputs>;
    private _rowSelectionMode: 'single' | 'multiple' = 'multiple';

    private buildRowSchema(columns: Array<{ name: string }>): Record<string, unknown> {
        const properties: Record<string, unknown> = {};
        columns.forEach(col => {
            properties[col.name] = { type: "string" };
        });
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
        const dataset = context.parameters.gridData;
        this._rowSelectionMode = (context.parameters.RowSelectionMode.raw as any) === 'single' ? 'single' : 'multiple';
        this._columnDefs = dataset.columns.map(col => ({
            field: col.name,
            headerName: col.displayName
        }));
        this._rowsSchemaObj = this.buildRowSchema(dataset.columns as any);
        const rowData = dataset.sortedRecordIds.map(id => {
            const record = dataset.records[id];
            const row: any = { __id: id };
            dataset.columns.forEach(col => {
                let value: any = record.getFormattedValue?.(col.name);
                if (value === undefined || value === null || value === "") {
                    value = record.getValue(col.name);
                }
                if (value instanceof Date) {
                    value = value.toISOString();
                }
                row[col.name] = value;
            });
            this._originalRowData[id] = { ...row };
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
        this._rowData = rowData;
        this._selectedRowIds = dataset.getSelectedRecordIds();
        ReactDOM.render(
            React.createElement(MyAgGrid, {
                rowData,
                columnDefs: this._columnDefs,
                selectedRowIds: this._selectedRowIds,
                onSelectionChanged: this.onRowsSelected.bind(this),
                onCellValueChanged: this.onCellEdited.bind(this),
                headerColor: context.parameters.HeaderColor.raw || undefined,
                paginationColor: context.parameters.PaginationColor.raw || undefined,
                rowSelectionMode: this._rowSelectionMode
            }),
            this.gridContainer
        );
    }

    private onRowsSelected(rows: any[]): void {
        this._selectedRowIds = rows.map(r => r.__id);
        if (this._context) {
            this._context.parameters.gridData.setSelectedRecordIds(this._selectedRowIds);
        }
    }

    private valuesAreEqual(a: unknown, b: unknown): boolean {
        // simple equality check for primitives and dates represented as strings
        return a === b;
    }

    private onCellEdited(change: EditedCell): void {
        const key = `${change.rowId}_${change.field}`;
        const originalRow = this._originalRowData[change.rowId];
        const originalValue = originalRow ? originalRow[change.field] : change.oldValue;

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
                this._editedMap.set(key, { rowId: change.rowId, field: change.field, oldValue: originalValue, newValue: change.newValue });
            }

            const rowPatch = this._rowPatchesMap.get(change.rowId) || { rowId: change.rowId, changes: {} };
            rowPatch.changes[change.field] = change.newValue;
            this._rowPatchesMap.set(change.rowId, rowPatch);
        }

        this._editedCells = Array.from(this._editedMap.values());
        this._editedRows = Array.from(this._rowPatchesMap.values());
        this._editedRowRecords = this._editedRows.map(patch => ({
            ...this._originalRowData[patch.rowId],
            ...patch.changes
        }));

        if (this._notifyOutputChanged) {
            this._notifyOutputChanged();
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
        // Add code to cleanup control if necessary
        ReactDOM.unmountComponentAtNode(this.container);
    }
}
