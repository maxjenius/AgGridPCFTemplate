import React, { forwardRef, useImperativeHandle, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateTimeFilter = forwardRef<any, any>((props, ref) => {
    const [from, setFrom] = useState<Date | null>(null);
    const [to, setTo] = useState<Date | null>(null);

    useImperativeHandle(ref, () => ({
        isFilterActive(): boolean {
            return from !== null || to !== null;
        },
        doesFilterPass(params: any): boolean {
            const value = params.data ? params.data[props.colDef.field] : null;
            if (!value) {
                return false;
            }
            const date = new Date(value);
            if (from && date < from) {
                return false;
            }
            if (to && date > to) {
                return false;
            }
            return true;
        },
        getModel(): any {
            if (!from && !to) {
                return null;
            }
            return {
                from: from ? from.toISOString() : null,
                to: to ? to.toISOString() : null
            };
        },
        setModel(model: any): void {
            setFrom(model && model.from ? new Date(model.from) : null);
            setTo(model && model.to ? new Date(model.to) : null);
        }
    }));

    const onChangeFrom = (date: Date | null) => {
        setFrom(date);
        props.filterChangedCallback();
    };

    const onChangeTo = (date: Date | null) => {
        setTo(date);
        props.filterChangedCallback();
    };

    return (
        <div className="ag-filter-body date-time-filter" style={{ padding: '4px' }}>
            <DatePicker
                selected={from}
                onChange={onChangeFrom}
                showTimeSelect
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="From..."
                className="ag-input-field-input ag-text-field-input"
                portalId="ag-date-time-filter-portal"
            />
            <DatePicker
                selected={to}
                onChange={onChangeTo}
                showTimeSelect
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="To..."
                className="ag-input-field-input ag-text-field-input"
                portalId="ag-date-time-filter-portal"
            />
        </div>
    );
});

export default DateTimeFilter;
