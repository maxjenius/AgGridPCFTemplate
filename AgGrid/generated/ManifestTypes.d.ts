/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    EditedCellsSchema: ComponentFramework.PropertyTypes.StringProperty;
    EditedRowsSchema: ComponentFramework.PropertyTypes.StringProperty;
    HeaderColor: ComponentFramework.PropertyTypes.StringProperty;
    PaginationColor: ComponentFramework.PropertyTypes.StringProperty;
    GridBackgroundColor: ComponentFramework.PropertyTypes.StringProperty;
    FontSize: ComponentFramework.PropertyTypes.DecimalNumberProperty;
    ThemeClass: ComponentFramework.PropertyTypes.StringProperty;
    ThemeBase: ComponentFramework.PropertyTypes.StringProperty;
    CustomThemeCss: ComponentFramework.PropertyTypes.StringProperty;
    EnableBlur: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    MultiSelect: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    RowKey: ComponentFramework.PropertyTypes.StringProperty;
    SelectedRowKeys: ComponentFramework.PropertyTypes.StringProperty;
    ReadOnly: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    ColumnDefinitions: ComponentFramework.PropertyTypes.StringProperty;
    ShowEdited: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    ShowPagination: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    ShowSelectionToggle: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    ResetChanges: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    ResetSelection: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    gridData: ComponentFramework.PropertyTypes.DataSet;
}
export interface IOutputs {
    EditedCells?: any;
    EditedRows?: any;
    EditedCellsSchema?: string;
    EditedRowsSchema?: string;
}
