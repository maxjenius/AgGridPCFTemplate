# PowerShell script to initialize a PCF solution using Ag-Grid
# Usage: ./scripts/setup-aggrid-pcf.ps1

# stop on errors
$ErrorActionPreference = 'Stop'

# automatically determine the absolute path to the repository root
$rootDir = (Get-Location).Path

# create and enter project directory
if(-not (Test-Path 'AgGridPCF')){
    New-Item -ItemType Directory -Path 'AgGridPCF' | Out-Null
}
else {
    Remove-Item -Path "$rootDir\AgGridPCF\*" -Recurse -Force
}
Set-Location 'AgGridPCF'

# install node dependencies
npm install
npm audit fix

# initialize power platform solution
pac solution init --publisher-name 'ARA' --publisher-prefix 'ARA'

# add reference to the PCF project
pac solution add-reference --path $rootDir

# ensure out directory is accessible from the solution project
if(Test-Path 'out'){
    Remove-Item -Path 'out' -Recurse -Force
}
New-Item -ItemType SymbolicLink -Path 'out' -Target "$rootDir/out" | Out-Null

# build the dotnet project
dotnet build

cd ..
