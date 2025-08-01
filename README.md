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
* `ShowSelectionToggle` - display a toggle that lets users switch between single and multi-select modes at runtime.
* `ShowEdited` - when true, only display rows that have been modified during the session.
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
* `minWidth` – minimum column width in pixels
* `maxWidth` – maximum column width in pixels
* `valueGetter` – function invoked to derive the value for a cell
* `valueParser` – convert edited input before saving
* `valueSetter` – custom save logic for edits
* `cellRendererParams` – parameters passed to your cell renderer
* `cellEditor` – name of a built-in editor like `agTextCellEditor`. For
  date values returned as strings, use `agDateStringCellEditor` so users can
  edit date and time.
* `cellEditorParams` – editor configuration object
* `filterParams` – additional filtering options
* `cellClass` – CSS class applied to cell
* `cellStyle` – inline style object for cell

Example formula in a Canvas app:

```PowerApps
JSON([
  {field: "name", headerName: "Name", sortable: true, editable: false},
  {field: "age", width: 80, filter: "agNumberColumnFilter", valueFormatter: "ageFormatter"},
  {field: "country", pinned: "left", cellRenderer: "agGroupCellRenderer"}
])
```

If the property is left blank, the grid generates columns automatically based on the dataset.

#### Filter Options
Set the `filter` key to one of AG Grid's built‑in filter names:

* `agTextColumnFilter` – text search with contains, equals and more
* `agNumberColumnFilter` – numeric comparison operators
* `agDateColumnFilter` – supports date pickers and ranges; combine with
  `cellDataType: 'dateTimeString'` for ISO strings or `cellDataType: 'date'` for
  `Date` objects.
* `agSetColumnFilter` – choose from a list of unique values
* `agMultiColumnFilter` – combine multiple filter types
* `true` – use the default filter for the data type

Extra configuration can be supplied using `filterParams`.
When editing or filtering date/time values you can remove the seconds by setting `step: 60`.
Be sure to also set `inputType: 'datetime-local'` and `includeTime: true` so the time picker remains visible.
Seconds are ignored by the custom picker, so no field for them is displayed.

Any changed date or date/time values in **EditedRows** use a local ISO format (`YYYY-MM-DDTHH:mm:ss`). This lets you write updates back to Dataverse without additional conversion.
Strings missing the seconds component are padded with `:00` so all edits share the same format.

To edit both date and time values, use `agDateStringCellEditor` and set
`cellDataType: 'dateTimeString'` in your column definition. Enable the browser
date picker and ensure the time picker is shown by including `includeTime: true`:

```PowerApps
cellEditorParams: {
  useBrowserDatePicker: true,
  inputType: 'datetime-local',
  includeTime: true,
  step: 60
}
```

To show a time picker in the filter, set the same `inputType` on the
`agDateColumnFilter`:

```PowerApps
filterParams: {
  browserDatePicker: false,
  dateComponent: 'fluentDateInput',
  inputType: 'datetime-local',
  includeTime: true,
  step: 60
}
```

When column definitions are omitted, the component automatically applies this
`agDateColumnFilter` setup for any detected date fields so the filter's picker
matches the built-in `FluentDateTimeCellEditor`.

The editor uses a custom Fluent UI picker that starts out displaying
`5/4/2025 9:35 PM`. Click the field to open a popup where you can quickly choose
the month, year, day and time (hour, minute and AM/PM).
Seconds are omitted in the popup because values are saved to the nearest minute.

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

A column definition can combine these features before being serialized with `JSON()`. For example:

```PowerApps
JSON([
  {field: "website", cellRenderer: "linkRenderer"},
  {field: "status", valueFormatter: "statusFormatter"}
])
```

Another example uses advanced options:

```PowerApps
JSON([
  {
    field: "amount",
    valueGetter: "getAmount",
    valueFormatter: "currencyFormatter",
    filter: "agNumberColumnFilter"
  },
  {
    field: "state",
    cellRenderer: "stateRenderer",
    cellRendererParams: { showIcon: true },
    filter: "agSetColumnFilter"
  }
])
```

Functions like `getAmount` or `currencyFormatter` must be available globally in your Canvas app. `stateRenderer` is a custom React component registered with the grid.

The `linkRenderer` component would output an anchor element using the row's `website` value, while `statusFormatter` converts numeric codes into friendly text.

### prerequisites:
* node js.
* Microsoft Power Platform CLI.
* VS Code as a text editor.
* dotnet build tools or dotnet sdk.
* API as a data source.

### Using the latest AG Grid version
This component has been tested with AG Grid Community **34.0.2**. When upgrading
the dependency run `npm install` to ensure the new version is bundled correctly.
All community modules are registered automatically via `ModuleRegistry` so the
grid works with modern AG Grid releases.

### React version
Power Apps currently does not support React 18 for PCF controls. This project
targets **React 17** to ensure the control can be added to a Canvas app without
issues.

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

### Theme styling
All built-in AG Grid themes are imported directly by the React component:

```ts
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
```

Select the theme at runtime using the `ThemeClass` input. Provide the theme name only (for example `balham` or `material`) and the control will apply the corresponding `ag-theme-*` class. The value is case-insensitive and leading/trailing spaces are ignored.

You can also choose a built-in theme object via the `ThemeBase` input. When set to one of `alpine`, `balham`, `material` or `quartz` the corresponding theme is passed to `AgGridReact` through the `theme` prop. This enables dynamic theming with the new AG Grid style API.

### Custom themes with the AG Grid Theme Builder

You can further customize the appearance using CSS from the [AG Grid Theme Builder](https://www.ag-grid.com/theme-builder/).
Paste the generated CSS into the new `CustomThemeCss` input property. The styles are injected at runtime so you can tweak variables without modifying the manifest.

### Full input reference

Each input is configured as a control property within your canvas app. The table below lists every option and shows an example formula.

| Property | Options | Canvas example |
| --- | --- | --- |
| `HeaderColor` | CSS color string | `"#0078D4"` |
| `PaginationColor` | CSS color string | `"#F3F2F1"` |
| `GridBackgroundColor` | CSS color string | `"white"` |
| `FontSize` | numeric size in pixels | `14` |
| `ThemeClass` | `alpine`, `balham`, `material`, `quartz` or full `ag-theme-*` class | `"balham"` |
| `ThemeBase` | built-in theme object: `alpine`, `balham`, `material`, `quartz` | `"material"` |
| `CustomThemeCss` | CSS text for theme overrides | `"--ag-odd-row-background-color:pink;"` |
| `EnableBlur` | `true` or `false` | `true` |
| `MultiSelect` | `true` for multi-select, `false` for single | `true` |
| `RowKey` | dataset column providing unique key | `"accountid"` |
| `SelectedRowKeys` | JSON array of keys to preselect | `"[1,2]"` |
| `ReadOnly` | `true` or `false` | `false` |
| `ColumnDefinitions` | JSON array of column definitions | `JSON([{field:"name"}])` |
| `ShowEdited` | `true` or `false` | `false` |
| `ShowPagination` | `true` or `false` | `true` |
| `ShowSelectionToggle` | `true` or `false` | `true` |
| `ResetChanges` | toggle to `true` to discard edits | `ResetBtn.Pressed` |
| `ResetSelection` | toggle to `true` to clear selection | `ClearBtn.Pressed` |
