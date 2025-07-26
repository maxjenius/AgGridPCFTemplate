import React, { useState, useRef, useEffect } from 'react';
import { TextField, Callout, DatePicker, Dropdown, IDropdownOption, PrimaryButton, Stack } from '@fluentui/react';
import { toLocalIsoMinutes } from '../utils/date';

interface Props {
  value?: string | null;
  onChange?: (val: string | null) => void;
}

const hours: IDropdownOption[] = Array.from({ length: 12 }, (_, i) => ({ key: i + 1, text: String(i + 1) }));
const minutes: IDropdownOption[] = Array.from({ length: 60 }, (_, i) => ({ key: i, text: i.toString().padStart(2, '0') }));
const ampm: IDropdownOption[] = [ { key: 'AM', text: 'AM' }, { key: 'PM', text: 'PM' } ];

export const FluentDateTimePicker: React.FC<Props> = ({ value, onChange }) => {
  const initial = value ? new Date(value) : new Date('2025-05-04T21:35:00');
  const [date, setDate] = useState<Date>(initial);
  const [hour, setHour] = useState<number>((initial.getHours() % 12) || 12);
  const [minute, setMinute] = useState<number>(initial.getMinutes());
  const [ampmVal, setAmPmVal] = useState<string>(initial.getHours() >= 12 ? 'PM' : 'AM');
  const [open, setOpen] = useState(false);
  const target = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open && target.current) {
      target.current.focus();
    }
  }, [open]);

  const formatted = () => {
    const h = hour === 12 ? 0 : hour;
    const fullHour = ampmVal === 'PM' ? h + 12 : h;
    const d = new Date(date);
    d.setHours(fullHour);
    d.setMinutes(minute);
    d.setSeconds(0);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const apply = () => {
    const h = hour === 12 ? 0 : hour;
    const fullHour = ampmVal === 'PM' ? h + 12 : h;
    const d = new Date(date);
    d.setHours(fullHour);
    d.setMinutes(minute);
    d.setSeconds(0);
    setOpen(false);
    onChange?.(toLocalIsoMinutes(d));
  };

  return (
    <div ref={target} className="fluent-date-time-editor">
      <TextField
        readOnly
        value={formatted()}
        onClick={() => setOpen(true)}
        styles={{
          root: { height: '100%' },
          fieldGroup: { height: '100%' },
          field: { padding: '0 4px', lineHeight: '24px' }
        }}
      />
      {open && target.current && (
        <Callout
          target={target.current}
          onDismiss={() => setOpen(false)}
        >
          <Stack tokens={{ childrenGap: 8, padding: 8 }}>
            <DatePicker value={date} onSelectDate={(d) => d && setDate(d)} />
            <Stack horizontal tokens={{ childrenGap: 8 }}>
              <Dropdown options={hours} selectedKey={hour} onChange={(_, o) => setHour(Number(o?.key))} />
              <Dropdown options={minutes} selectedKey={minute} onChange={(_, o) => setMinute(Number(o?.key))} />
              <Dropdown options={ampm} selectedKey={ampmVal} onChange={(_, o) => setAmPmVal(String(o?.key))} />
            </Stack>
            <PrimaryButton text="OK" onClick={apply} />
          </Stack>
        </Callout>
      )}
    </div>
  );
};

export default FluentDateTimePicker;
