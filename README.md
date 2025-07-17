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
* `SelectedRowKeys` - JSON array of row key values used to programmatically select rows. When empty or null, the input is ignored. Provide a valid JSON array (e.g. `[1,2,3]`) to clear any existing selection and select rows with matching keys.
* `ShowPagination` - show or hide the pagination bar (default is show).
* `ResetSelection` - when toggled to true, clears any selected rows.

### Column Definitions
Use the `ColumnDefinitions` input to override the automatically generated columns. The value should be a JSON string containing an array of [AG Grid column definition](https://www.ag-grid.com/react-data-grid/column-definitions/) objects. Each object must specify a `field` matching a column in your dataset. Common keys include:

* `field` – the dataset column name (required)
* `headerName` – display name for the column
* `width` – numeric width of the column
* `sortable` – enable sorting
* `filter` – enable filtering or specify a filter type
* `pinned` – pin the column to `'left'` or `'right'`
* `cellRenderer` – registered cell renderer
* `valueFormatter` – custom formatting for values

Example value for the property:

```json
[
  { "field": "name", "headerName": "Name", "sortable": true },
  { "field": "age", "width": 80, "filter": "agNumberColumnFilter" },
  { "field": "country", "pinned": "left" }
]
```

If the property is left blank, the grid generates columns automatically based on the dataset.

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

