# PowerShell script to initialize a PCF solution using Ag-Grid
# Usage: ./scripts/setup-aggrid-pcf.ps1

# stop on errors
$ErrorActionPreference = 'Stop'

# create and enter project directory
if(-not (Test-Path 'AgGridPCF')){
    New-Item -ItemType Directory -Path 'AgGridPCF' | Out-Null
}
Set-Location 'AgGridPCF'

# install node dependencies
npm install

# initialize power platform solution
pac solution init --publisher-name 'ARA' --publisher-prefix 'ARA'

# automatically determine the absolute path to the repository root
$rootDir = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

# add reference to the PCF project
pac solution add-reference --path $rootDir

# build the dotnet project
dotnet build

