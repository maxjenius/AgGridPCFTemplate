/*
 * MyAgGridComponent.tsx
 * Description: React component for displaying data using Ag Grid in TypeScript
 * Author: Dixit Joshi
 * Version: 1.2.0
 * License: MIT
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import FluentDateTimeCellEditor from './FluentDateTimeCellEditor';
import FluentDateInput from './FluentDateInput';
import type { CellEditingStoppedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-balham.css';

interface EditedCell {
    rowId: string;
    field: string;
    oldValue: unknown;
    newValue: unknown;
}

interface MyAgGridProps {
    rowData: any[];
    columnDefs: any[];
    selectedRowIds?: string[];
    onSelectionChanged?: (rows: any[]) => void;
    onCellValueChanged?: (change: EditedCell) => void;
    headerColor?: string;
    paginationColor?: string;
    gridBackgroundColor?: string;
    fontSize?: number | string;
    themeClass?: string;
    enableBlur?: boolean;
    multiSelect?: boolean;
    readOnly?: boolean;
    showPagination?: boolean;
    resetVersion?: number;
}
    
const AgGrid: React.FC<MyAgGridProps> = React.memo(({ rowData, columnDefs, selectedRowIds, onSelectionChanged, onCellValueChanged, headerColor, paginationColor, gridBackgroundColor, fontSize, themeClass = 'ag-theme-balham', enableBlur = false, multiSelect = true, readOnly = false, showPagination = true, resetVersion }) => {
    console.log('AG Grid')
    const divClass = themeClass;
    const [autoDefName, setAutoDefName] = useState('');
    // Always use 'multiple' selection to keep checkbox column visible
    // When multiSelect is false we will enforce single selection manually
    const rowSelectionMode = 'multiple';
    const editedCellsRef = useRef<Set<string>>(new Set());
    const originalDataRef = useRef<Record<string, any>>({});

    const valuesAreEqual = (a: unknown, b: unknown): boolean => {
        if (a === b) return true;
        if (a == null && b == null) return true;
        return String(a) === String(b);
    };

    // Prior implementation removed the seconds portion from ISO strings, which
    // caused AG Grid's `dateTimeString` type validation to fail. Now we simply
    // return the value unchanged but keep the function for backward
    // compatibility.
    const stripSeconds = (val: unknown): unknown => {
        if (typeof val === 'string') {
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val)) {
                return `${val}:00`;
            }
            const m = val.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
            if (m) {
                return m[1];
            }
        }
        return val;
    };

    const refreshEditedCells = useCallback(() => {
        if (!gridRef.current?.api) {
            return;
        }
        const refreshMap: Record<string, { node: any; cols: Set<string> }> = {};
        editedCellsRef.current.forEach(key => {
            const [rowId, field] = key.split('_');
            const node = gridRef.current!.api.getRowNode(rowId);
            if (node) {
                if (!refreshMap[rowId]) {
                    refreshMap[rowId] = { node, cols: new Set() };
                }
                refreshMap[rowId].cols.add(field);
            }
        });
        Object.values(refreshMap).forEach(val => {
            gridRef.current!.api.refreshCells({
                rowNodes: [val.node],
                columns: Array.from(val.cols),
                force: true
            });
        });
    }, []);

    useEffect(() => {
        rowData.forEach(row => {
            const id = row.__id;
            if (originalDataRef.current[id] === undefined) {
                originalDataRef.current[id] = { ...row };
            }
        });
        const removedKeys: Array<{ rowId: string; field: string }> = [];
        editedCellsRef.current.forEach(key => {
            const [rowId, field] = key.split('_');
            const currentRow = rowData.find(r => r.__id === rowId);
            if (currentRow) {
                const originalValue = originalDataRef.current[rowId]?.[field];
                if (valuesAreEqual(currentRow[field], originalValue)) {
                    editedCellsRef.current.delete(key);
                    removedKeys.push({ rowId, field });
                }
            }
        });
        if (removedKeys.length && gridRef.current?.api) {
            removedKeys.forEach(k => {
                const node = gridRef.current?.api?.getRowNode(k.rowId);
                if (node) {
                    gridRef.current?.api?.refreshCells({ rowNodes: [node], columns: [k.field], force: true });
                }
            });
        }
        refreshEditedCells();
    }, [rowData, refreshEditedCells]);

    useEffect(() => {
        if (resetVersion !== undefined) {
            editedCellsRef.current.clear();
            originalDataRef.current = {};
            rowData.forEach(r => {
                originalDataRef.current[r.__id] = { ...r };
            });
            gridRef.current?.api?.refreshCells({ force: true });
        }
    }, [resetVersion]);

    useEffect(() => {
        if (columnDefs && columnDefs.length > 0) {
            setAutoDefName(columnDefs[0].field);
        }
    }, [columnDefs]);
    const autoGroupColumnDef = useMemo(() => {
        return {
            minWidth: 270,
            field: autoDefName,
            headerCheckboxSelection: multiSelect,
            cellRendererParams: {
                checkbox: true,
            },
        };
    }, [autoDefName, multiSelect]);

    const finalColumnDefs = useMemo(() => {
        const selectionCol = {
            headerName: '',
            colId: 'selection',
            checkboxSelection: true,
            headerCheckboxSelection: multiSelect,
            width: 40,
            minWidth: 40,
            maxWidth: 40,
            cellClass: 'selection-checkbox-cell',
            headerClass: 'selection-checkbox-header',
            suppressSizeToFit: true,
            filter: false,
            suppressHeaderMenuButton: true
        };
        return [selectionCol, ...columnDefs];
    }, [columnDefs, multiSelect]);

    const defaultColDef = useMemo(() => ({
        flex: 1,
        minWidth: 150,
        filter: true,
        resizable: true,
        editable: !readOnly,
        cellClassRules: {
            'edited-cell': (params: any) => {
                const id = params.node.id;
                const field = params.column.getColDef().field ?? params.column.getId();
                const original = originalDataRef.current[id]?.[field];
                return !valuesAreEqual(params.value, original);
            }
        }
    }), [readOnly]);


    const gridOptions = useMemo(() => ({
        columnDefs: finalColumnDefs,
        suppressAggFuncInHeader: true,
        enableRangeSelection: false,
        suppressRowClickSelection: multiSelect,
        popupParent: typeof document !== 'undefined' ? document.body : undefined,
        frameworkComponents: {
            fluentDateTimeCellEditor: FluentDateTimeCellEditor,
            fluentDateInput: FluentDateInput,
            agDateInput: FluentDateInput
        }
    }), [finalColumnDefs, multiSelect]);

    const gridRef = useRef<AgGridReact<any>>(null);
    const getRowId = useCallback((params: any) => params.data.__id, []);

    const applySelection = useCallback(() => {
        if (gridRef.current?.api && selectedRowIds) {
            gridRef.current.api.forEachNode(node => {
                node.setSelected(selectedRowIds.includes(node.id as any));
            });
        }
    }, [selectedRowIds]);
    const onSelectionChangedHandler = useCallback(() => {
        if (!gridRef.current?.api) {
            return;
        }
        if (!multiSelect) {
            const nodes = gridRef.current.api.getSelectedNodes();
            if (nodes.length > 1) {
                const last = nodes[nodes.length - 1];
                gridRef.current.api.deselectAll();
                last.setSelected(true);
            }
        }
        if (onSelectionChanged) {
            const selected = gridRef.current.api.getSelectedRows();
            onSelectionChanged(selected ?? []);
        }
    }, [onSelectionChanged, multiSelect]);

    const onCellValueChangedHandler = useCallback((params: any) => {
        const newVal = stripSeconds(params.newValue);
        const field = params.column.getColDef().field ?? params.column.getId();
        if (onCellValueChanged) {
            onCellValueChanged({
                rowId: params.node.id,
                field,
                oldValue: params.oldValue,
                newValue: newVal
            });
        }
        const key = `${params.node.id}_${field}`;
        const originalValue = originalDataRef.current[params.node.id]?.[field];
        if (valuesAreEqual(newVal, originalValue)) {
            editedCellsRef.current.delete(key);
        } else {
            editedCellsRef.current.add(key);
        }
        if (newVal !== params.newValue) {
            params.node.setDataValue(field, newVal);
        }
        params.api.refreshCells({ rowNodes: [params.node], columns: [params.column.getId()], force: true });
    }, [onCellValueChanged]);

    const onCellEditingStoppedHandler = useCallback((params: CellEditingStoppedEvent) => {
        const field = params.column.getColDef().field ?? params.column.getId();
        const rowId = params.node.id as string;
        if (!params.valueChanged) {
            const originalValue = originalDataRef.current[rowId]?.[field];
            params.node.setDataValue(field, originalValue);
            editedCellsRef.current.delete(`${rowId}_${field}`);
            params.api.refreshCells({ rowNodes: [params.node], columns: [params.column.getId()], force: true });
        } else {
            const currentVal = params.node.data[field];
            const fixed = stripSeconds(currentVal);
            if (fixed !== currentVal) {
                params.node.setDataValue(field, fixed);
            }
        }
    }, []);

    const onGridReady = useCallback(() => {
        applySelection();
    }, [applySelection]);

    useEffect(() => {
        if (gridRef.current?.api && selectedRowIds) {
            gridRef.current?.api?.forEachNode(node => {
                node.setSelected(selectedRowIds.includes(node.id as any));
            });
        }
        refreshEditedCells();
    }, [rowData, selectedRowIds, refreshEditedCells]);

    const containerStyle: React.CSSProperties = useMemo(() => {
        const style: React.CSSProperties = {
            width: '100%',
            height: '100%'
        } as React.CSSProperties;
        if (headerColor) {
            (style as any)['--ag-header-background-color'] = headerColor;
        }
        if (paginationColor) {
            (style as any)['--ag-control-panel-background-color'] = paginationColor;
        }
        if (gridBackgroundColor) {
            (style as any)['--ag-background-color'] = gridBackgroundColor;
            (style as any)['--ag-odd-row-background-color'] = gridBackgroundColor;
        }
        if (fontSize !== undefined && fontSize !== null) {
            let sizeStr: string;
            if (typeof fontSize === 'number') {
                sizeStr = `${fontSize}px`;
            } else {
                sizeStr = fontSize;
                if (/^\d+$/.test(sizeStr)) {
                    sizeStr = `${sizeStr}px`;
                }
            }
            (style as any)['--ag-font-size'] = sizeStr;
            style.fontSize = sizeStr;
        }
        if (enableBlur) {
            style.backdropFilter = 'blur(8px)';
            style.backgroundColor = 'rgba(255,255,255,0.2)';
        }
        return style;
    }, [headerColor, paginationColor, gridBackgroundColor, fontSize, enableBlur]);

    return (
        <div className={divClass} style={containerStyle}>
            <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={finalColumnDefs}
                autoGroupColumnDef={autoGroupColumnDef}
                gridOptions={gridOptions}
                defaultColDef={defaultColDef}
                getRowId={getRowId}
                pagination={showPagination}
                rowSelection={rowSelectionMode}
                rowMultiSelectWithClick={false}
                tooltipShowDelay={500}
                onGridReady={onGridReady}
                onSelectionChanged={onSelectionChangedHandler}
                onCellValueChanged={onCellValueChangedHandler}
                onCellEditingStopped={onCellEditingStoppedHandler}
            />
        </div>
    );
});

export default AgGrid;
