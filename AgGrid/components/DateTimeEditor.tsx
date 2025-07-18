import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { DatetimePopover } from './DatetimePopover';

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
            const btn = containerRef.current?.querySelector('button');
            (btn as HTMLElement | null)?.focus();
        }
    }));

    return (
        <div ref={containerRef} className="date-time-editor">
            <DatetimePopover value={value} onChange={setValue} />
        </div>
    );
});

export default DateTimeEditor;
