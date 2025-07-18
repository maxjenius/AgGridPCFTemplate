# AG Grid PCF

### Features:
AG Grid offers a wide range of features for building powerful and customizable data grids, including sorting, filtering, grouping, column pinning, row selection, row virtualization, cell editing, and many more.

### Color Inputs
You can customize the appearance of the grid using the following input properties:
* `HeaderColor` - background color for the column header area.
* `PaginationColor` - background color for the pagination panel.
* `GridBackgroundColor` - background color for the main grid body.
* `FontSize` - numeric font size applied to all text in the grid (pixels). Default is `13`.
* `EnableBlur` - apply a glass blur effect behind the entire grid when true.
* `ReadOnly` - disables cell editing when set to true.
* `SelectedRowKeys` - JSON array of values compared against each row's `rowKey` field. When set, any rows whose `rowKey` value matches one of the entries will be selected. Provide a valid JSON array (e.g. `["value1","value2"]`) to clear the existing selection and select rows with matching keys.
* `ShowPagination` - show or hide the pagination bar (default is show).
* `ResetSelection` - when toggled to true, clears any selected rows.

### Column Definitions
Use the `ColumnDefinitions` input to override the automatically generated columns. The value should be a JSON string containing an array of [AG Grid column definition](https://www.ag-grid.com/react-data-grid/column-definitions/) objects. Each object must specify a `field` matching a column in your dataset. Common keys include:

* `field` – the dataset column name (required)
* `headerName` – display name for the column
* `width` – numeric width of the column
* `sortable` – enable sorting
* `filter` – enable filtering or specify a filter type (e.g. `agTextColumnFilter`, `agNumberColumnFilter`, `agDateColumnFilter`)
* `pinned` – pin the column to `'left'` or `'right'`
* `editable` – set to `false` to make the column read only
* `cellRenderer` – registered cell renderer such as `agGroupCellRenderer` or `agCheckboxCellRenderer`
* `valueFormatter` – custom function to format displayed values

Example value for the property:

```json
[
  { "field": "name", "headerName": "Name", "sortable": true, "editable": false },
  { "field": "age", "width": 80, "filter": "agNumberColumnFilter", "valueFormatter": "ageFormatter" },
  { "field": "country", "pinned": "left", "cellRenderer": "agGroupCellRenderer" }
]
```

If the property is left blank, the grid generates columns automatically based on the dataset.

### Cell Content
The grid provides several options for controlling how values are displayed inside each cell:

* **Value Getter** (`colDef.valueGetter`)
  * Supply a JavaScript function to derive a value when it can't be taken directly from the data field.
* **Value Formatter** (`colDef.valueFormatter`)
  * Format raw values for display, for example converting numbers into currency strings.
* **Cell Components** (`colDef.cellRenderer`)
  * Render React components within a cell to show rich content such as icons, links or buttons.
* **Reference Data**
  * Display alternative values mapped from your dataset, e.g. show `"America"` when the underlying data contains `"USA"`.

These options follow the behaviour documented in the [AG Grid Cell Content guide](https://www.ag-grid.com/react-data-grid/cell-content/).

### prerequisites:
* node js.
* Microsoft Power Platform CLI.
* VS Code as a text editor.
* dotnet build tools or dotnet sdk.
* API as a data source.

### Automated setup
The root folder contains helper scripts that create a new Power Platform solution and build the PCF project. The scripts automatically detect the absolute path to this repository so no manual path editing is required.
Run the shell script on Linux/macOS:
```bash
./BuildSolution.sh
```
On Windows, run the PowerShell script:
```powershell
./BuildSolution.ps1
```

