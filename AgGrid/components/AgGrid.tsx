/*
 * MyAgGridComponent.tsx
 * Description: React component for displaying data using Ag Grid in TypeScript
 * Author: Dixit Joshi
 * Version: 1.2.0
 * License: MIT
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-balham.css';
import DateTimeEditor from './DateTimeEditor';
import DateTimeFilter from './DateTimeFilter';

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
    enableBlur?: boolean;
    multiSelect?: boolean;
    readOnly?: boolean;
    showPagination?: boolean;
    resetVersion?: number;
}
    
const AgGrid: React.FC<MyAgGridProps> = React.memo(({ rowData, columnDefs, selectedRowIds, onSelectionChanged, onCellValueChanged, headerColor, paginationColor, gridBackgroundColor, fontSize, enableBlur = false, multiSelect = true, readOnly = false, showPagination = true, resetVersion }) => {
    console.log('AG Grid')
    const divClass = 'ag-theme-balham';
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
                const field = params.column.getId();
                const original = originalDataRef.current[id]?.[field];
                return !valuesAreEqual(params.value, original);
            }
        }
    }), [readOnly]);

    const frameworkComponents = useMemo(() => ({
        dateTimeEditor: DateTimeEditor,
        dateTimeFilter: DateTimeFilter
    }), []);

    const gridOptions = useMemo(() => ({
        columnDefs: finalColumnDefs,
        suppressAggFuncInHeader: true,
        enableRangeSelection: false,
        suppressRowClickSelection: multiSelect,
        popupParent: typeof document !== 'undefined' ? document.body : undefined
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
        if (onCellValueChanged) {
            onCellValueChanged({
                rowId: params.node.id,
                field: params.column.getId(),
                oldValue: params.oldValue,
                newValue: params.newValue
            });
        }
        const key = `${params.node.id}_${params.column.getId()}`;
        const originalValue = originalDataRef.current[params.node.id]?.[params.column.getId()];
        if (valuesAreEqual(params.newValue, originalValue)) {
            editedCellsRef.current.delete(key);
        } else {
            editedCellsRef.current.add(key);
        }
        params.api.refreshCells({ rowNodes: [params.node], columns: [params.column.getId()], force: true });
    }, [onCellValueChanged]);

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
            height: '100%',
            backgroundColor: 'transparent',
            '--ag-header-background-color': 'transparent',
            '--ag-control-panel-background-color': 'transparent',
            '--ag-background-color': 'transparent',
            '--ag-row-hover-color': 'transparent',
            '--ag-odd-row-background-color': 'transparent',
            '--ag-border-color': 'transparent',
            '--ag-borders': 'none',
            '--ag-row-border-color': 'transparent'
        } as React.CSSProperties;
        if (headerColor) {
            (style as any)['--ag-header-background-color'] = headerColor;
        }
        if (paginationColor) {
            (style as any)['--ag-control-panel-background-color'] = paginationColor;
        }
        if (gridBackgroundColor) {
            // Only apply the color to rows and not the entire grid container
            (style as any)['--ag-background-color'] = gridBackgroundColor; // even rows
            (style as any)['--ag-odd-row-background-color'] = gridBackgroundColor; // odd rows
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
                components={frameworkComponents as any}
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
            />
        </div>
    );
});

export default AgGrid;
