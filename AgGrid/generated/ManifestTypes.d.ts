/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    EditedCellsSchema: ComponentFramework.PropertyTypes.StringProperty;
    EditedRowsSchema: ComponentFramework.PropertyTypes.StringProperty;
    gridData: ComponentFramework.PropertyTypes.DataSet;
}
export interface IOutputs {
    EditedCells?: any;
    EditedRows?: any;
    EditedCellsSchema?: string;
    EditedRowsSchema?: string;
}
