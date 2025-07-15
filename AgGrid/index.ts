import { IInputs, IOutputs } from "./generated/ManifestTypes";
import MyAgGrid from './components/AgGrid'
import React from "react";
import ReactDOM from "react-dom";

export class AgGrid implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private gridContainer: HTMLDivElement;
    private _notifyOutputChanged?: () => void;
    private _selectedRows: any[] = [];
    private _selectedRowIds: string[] = [];
    private _rowData: any[] = [];
    private _columnDefs: any[] = [];
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
        this.container = container;
        this.container.style.width = "100%";
        this.container.style.height = "100%";
        this.container.style.overflow = "hidden";

        this.gridContainer = document.createElement("div");
        this.gridContainer.style.width = "100%";
        this.gridContainer.style.height = "100%";

        this.container.appendChild(this.gridContainer);
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        const dataset = context.parameters.gridData;
        this._columnDefs = dataset.columns.map(col => ({
            field: col.name,
            headerName: col.displayName
        }));
        const rowData = dataset.sortedRecordIds.map(id => {
            const record = dataset.records[id];
            const row: any = { __id: id };
            dataset.columns.forEach(col => {
                row[col.name] = record.getValue(col.name);
            });
            return row;
        });
        this._rowData = rowData;
        ReactDOM.render(
            React.createElement(MyAgGrid, {
                rowData,
                columnDefs: this._columnDefs,
                selectedRowIds: this._selectedRowIds,
                onSelectionChanged: this.onRowsSelected.bind(this)
            }),
            this.gridContainer
        );
    }

    private onRowsSelected(rows: any[]): void {
        this._selectedRows = rows;
        this._selectedRowIds = rows.map(r => r.__id);
        if (this._notifyOutputChanged) {
            this._notifyOutputChanged();
        }
    }


    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return { selectedRows: this._selectedRows };
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
