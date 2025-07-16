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
    rowSelectionMode?: 'single' | 'multiple';
}

const AgGrid: React.FC<MyAgGridProps> = React.memo(({ rowData, columnDefs, selectedRowIds, onSelectionChanged, onCellValueChanged, headerColor, paginationColor, gridBackgroundColor, rowSelectionMode = 'multiple' }) => {
    console.log('AG Grid')
    const divClass = 'ag-theme-balham';
    const [autoDefName, setAutoDefName] = useState('');

    useEffect(() => {
        if (columnDefs && columnDefs.length > 0) {
            setAutoDefName(columnDefs[0].field);
        }
    }, [columnDefs]);
    const autoGroupColumnDef = useMemo(() => {
        return {
            minWidth: 270,
            field: autoDefName,
            headerCheckboxSelection: rowSelectionMode === 'multiple',
            cellRendererParams: {
                checkbox: rowSelectionMode === 'multiple',
            },
        };
    }, [autoDefName, rowSelectionMode]);

    const finalColumnDefs = useMemo(() => {
        if (rowSelectionMode === 'multiple') {
            const selectionCol = {
                headerName: '',
                checkboxSelection: true,
                headerCheckboxSelection: true,
                width: 30,
                minWidth: 30,
                maxWidth: 30,
                suppressSizeToFit: true,
            };
            return [selectionCol, ...columnDefs];
        }
        return columnDefs;
    }, [columnDefs, rowSelectionMode]);

    const gridOptions = {
        columnDefs: finalColumnDefs,
        suppressAggFuncInHeader: true,
        defaultColDef: {
            flex: 1,
            minWidth: 150,
            filter: true,
            resizable: true,
            editable: true,
        },
        enableRangeSelection: true,
    };

    const gridRef = useRef<AgGridReact<any>>(null);
    const getRowId = useCallback((params: any) => params.data.__id, []);
    const onSelectionChangedHandler = useCallback(() => {
        if (onSelectionChanged && gridRef.current?.api) {
            const selected = gridRef.current.api.getSelectedRows();
            onSelectionChanged(selected);
        }
    }, [onSelectionChanged]);

    const onCellValueChangedHandler = useCallback((params: any) => {
        if (onCellValueChanged) {
            onCellValueChanged({
                rowId: params.node.id,
                field: params.column.getId(),
                oldValue: params.oldValue,
                newValue: params.newValue
            });
        }
    }, [onCellValueChanged]);

    useEffect(() => {
        if (gridRef.current?.api && selectedRowIds) {
            gridRef.current.api.forEachNode(node => {
                node.setSelected(selectedRowIds.includes(node.id as any));
            });
        }
    }, [rowData, selectedRowIds]);

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
            style.backgroundColor = gridBackgroundColor;
            (style as any)['--ag-background-color'] = gridBackgroundColor;
        }
        return style;
    }, [headerColor, paginationColor, gridBackgroundColor]);

    return (
        <div className={divClass} style={containerStyle}>
            <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={finalColumnDefs}
                autoGroupColumnDef={autoGroupColumnDef}
                gridOptions={gridOptions}
                getRowId={getRowId}
                pagination={true}
                rowSelection={rowSelectionMode}
                rowMultiSelectWithClick={rowSelectionMode === 'multiple'}
                tooltipShowDelay={500}
                onSelectionChanged={onSelectionChangedHandler}
                onCellValueChanged={onCellValueChangedHandler}
            />
        </div>
    );
});

export default AgGrid;
