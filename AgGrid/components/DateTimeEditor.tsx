import React, { forwardRef, useImperativeHandle, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateTimeEditorProps {
    value?: string;
}

const DateTimeEditor = forwardRef<any, DateTimeEditorProps>((props, ref) => {
    const [value, setValue] = useState<Date | null>(props.value ? new Date(props.value) : new Date());

    useImperativeHandle(ref, () => ({
        getValue(): string | null {
            return value ? value.toISOString() : null;
        }
    }));

    return (
        <DatePicker
            selected={value}
            onChange={(date: Date | null) => setValue(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="yyyy-MM-dd HH:mm"
            className="ag-input-field-input ag-text-field-input"
            autoFocus
        />
    );
});

export default DateTimeEditor;
