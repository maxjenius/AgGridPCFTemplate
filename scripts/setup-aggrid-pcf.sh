#!/bin/sh
# Script to initialize a new PCF solution using Ag-Grid
# Usage: ./scripts/setup-aggrid-pcf.sh
set -e

# create and enter project directory
mkdir -p AgGridPCF
cd AgGridPCF

# install node dependencies
npm install

# initialize power platform solution
pac solution init --publisher-name ARA --publisher-prefix ARA

# automatically determine the absolute path to the repository root
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# add reference to the AgGridPCFTemplate project
pac solution add-reference --path "$ROOT_DIR"

# build the dotnet project
DotNetCmd="dotnet"
$DotNetCmd build

