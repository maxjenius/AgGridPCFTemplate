import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { DatetimePicker } from './DatetimePicker';
import { format } from 'date-fns';

interface DateTimeEditorProps {
    value?: string;
}

const DateTimeEditor = forwardRef<any, DateTimeEditorProps>((props, ref) => {
    const [value, setValue] = useState<Date>(props.value ? new Date(props.value) : new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        getValue(): string | null {
            return value ? value.toISOString() : null;
        },
        isPopup(): boolean {
            return true;
        },
        afterGuiAttached(): void {
            const first = containerRef.current?.querySelector('input');
            (first as HTMLElement | null)?.focus();
        }
    }));

    return (
        <div ref={containerRef} className="date-time-editor">
            <DatetimePicker selected={value} setDate={setValue} />
        </div>
    );
});

export default DateTimeEditor;
