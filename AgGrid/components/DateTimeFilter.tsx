import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { DatetimePicker } from './DatetimePicker';

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

    const onChangeFrom = (date: Date | undefined) => {
        setFrom(date ?? null);
        props.filterChangedCallback();
    };

    const onChangeTo = (date: Date | undefined) => {
        setTo(date ?? null);
        props.filterChangedCallback();
    };

    return (
        <div className="ag-filter-body date-time-filter" style={{ padding: '4px' }}>
            <DatetimePicker selected={from ?? undefined} setDate={d => onChangeFrom(d)} />
            <DatetimePicker selected={to ?? undefined} setDate={d => onChangeTo(d)} />
        </div>
    );
});

export default DateTimeFilter;
