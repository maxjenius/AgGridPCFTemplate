import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateTimeEditorProps {
    value?: string;
}

const DateTimeEditor = forwardRef<any, DateTimeEditorProps>((props, ref) => {
    const [value, setValue] = useState<Date | null>(props.value ? new Date(props.value) : new Date());
    const dpRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
        getValue(): string | null {
            return value ? value.toISOString() : null;
        },
        isPopup(): boolean {
            return true;
        },
        afterGuiAttached(): void {
            setTimeout(() => dpRef.current?.setFocus?.());
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
            wrapperClassName="date-time-editor"
            withPortal
            ref={dpRef}
            autoFocus
        />
    );
});

export default DateTimeEditor;
