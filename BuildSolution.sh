#!/bin/sh
# Script to initialize a new PCF solution using Ag-Grid
# Usage: ./scripts/setup-aggrid-pcf.sh
set -e

# automatically determine the absolute path to the repository root
ROOT_DIR="$(pwd)"

# create and enter project directory
if [ ! -d AgGridPCF ]; then
  mkdir AgGridPCF
else
  rm -rf "$ROOT_DIR/AgGridPCF"/*
fi
cd AgGridPCF

# install node dependencies
npm install
npm audit fix

# initialize power platform solution
pac solution init --publisher-name ARA --publisher-prefix ARA

# add reference to the PCF project
pac solution add-reference --path "$ROOT_DIR"

# ensure out directory is accessible from the solution project
if [ -e out ]; then
  rm -rf out
fi
ln -s "$ROOT_DIR/out" out

# build the dotnet project
dotnet build

cd ..
