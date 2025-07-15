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

interface MyAgGridProps {
    rowData: any[];
    columnDefs: any[];
    onSelectionChanged?: (rows: any[]) => void;
}

const AgGrid: React.FC<MyAgGridProps> = React.memo(({ rowData, columnDefs, onSelectionChanged }) => {
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
            headerCheckboxSelection: true,
            cellRendererParams: {
                checkbox: true,
            },
        };
    }, [autoDefName]);

    const gridOptions = {
        columnDefs: columnDefs,
        suppressAggFuncInHeader: true,
        defaultColDef: {
            flex: 1,
            minWidth: 150,
            filter: true,
            resizable: true,
            editable: true,
        },
        enableRangeSelection: true,
        getRowId: (params: any) => params.data.id,
    };

    const gridRef = useRef<AgGridReact<any>>(null);
    const onSelectionChangedHandler = useCallback(() => {
        if (onSelectionChanged && gridRef.current?.api) {
            const selected = gridRef.current.api.getSelectedRows();
            onSelectionChanged(selected);
        }
    }, [onSelectionChanged]);

    return (
        <div className={divClass} style={{ width: '100%', height: '100%' }}>
            <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={columnDefs}
                autoGroupColumnDef={autoGroupColumnDef}
                gridOptions={gridOptions}
                pagination={true}
                rowSelection={'multiple'}
                tooltipShowDelay={500}
                onSelectionChanged={onSelectionChangedHandler}
            />
        </div>
    );
});

export default AgGrid;
