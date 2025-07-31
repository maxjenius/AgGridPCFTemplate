# Guidelines for PowerApps PCF Development

This repository demonstrates how to build a PowerApps Canvas PCF using React and the AG Grid community library. Follow these steps when creating new components.

## Project Requirements

1. **Install prerequisites**
   - Node.js and npm
   - Microsoft Power Platform CLI (`pac`)
   - .NET SDK / build tools
   - A text editor such as VS Code
2. **Dependencies**
   - `react` and `react-dom` (React 17 is currently supported in PowerApps)
   - `ag-grid-community` and `ag-grid-react` for grid features
   - `pcf-scripts` for building and bundling
   - Include ESLint configuration for `@microsoft/eslint-plugin-power-apps`
3. **Scripts**
   - Provide npm scripts for build, clean and lint as shown below:
     ```json
     "scripts": {
       "build": "pcf-scripts build",
       "clean": "pcf-scripts clean",
       "lint": "pcf-scripts lint"
     }
     ```
4. **Configuration**
   - Create `tsconfig.json` targeting ES5 modules and include React JSX support.
   - `pcfconfig.json` should define namespace, control name and the location of your manifest.
5. **Manifest**
   - Define input/output properties in `ControlManifest.Input.xml`.
   - Include a dataset to bind grid data from the Canvas app.
   - Reference bundled JavaScript and CSS files under `<resources>`.

## Implementing the Control

1. **Initialization**
   - Implement `init`, `updateView`, `getOutputs` and `destroy` in your control class.
   - Use a container div that fills 100% width and height.
2. **Using AG Grid**
   - Import AG Grid styles and modules at the top of the control file.
   - Register community modules with `ModuleRegistry.registerModules([AllCommunityModule])`.
   - Render `AgGridReact` from `ag-grid-react` inside the container.
   - Pass dataset records as row data and column definitions as props.
   - Use built‑in AG Grid features (sorting, filtering, editing, theming) before implementing custom logic. Refer to the [AG Grid documentation](https://www.ag-grid.com/react-data-grid) for available APIs.
3. **Inputs and Outputs**
   - Add input properties for grid appearance, column definitions, selection mode and other settings.
   - Provide outputs for edited cells or rows to communicate changes back to the Canvas app.
4. **Typing and Schema**
   - Generate TypeScript typings for manifest inputs/outputs using `pcf-scripts refreshTypes`.
   - If you emit arrays or objects, include JSON schemas so Canvas apps can parse outputs.

## Development Workflow

1. Run `npm install` to restore dependencies.
2. Lint the project with `npm run lint`.
3. Build the control with `npm run build`. This compiles TypeScript, bundles resources and produces control artifacts under `out/`.
4. Use `pac pcf push` to test the control in a Canvas app.

Ensure any AI tool that modifies this project keeps these requirements in mind and leverages AG Grid community features rather than recreating similar functionality from scratch.
