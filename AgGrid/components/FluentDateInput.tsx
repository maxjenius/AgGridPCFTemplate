import React, { forwardRef, useImperativeHandle, useState } from 'react';
import type { IDateParams } from 'ag-grid-community';
import FluentDateTimePicker from './FluentDateTimePicker';
import { toLocalIsoMinutes } from '../utils/date';

const FluentDateInput = forwardRef((props: IDateParams, ref) => {
  const [val, setVal] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    getDate: () => (val ? new Date(val) : null),
    setDate: (d: Date | null) => { setVal(d ? toLocalIsoMinutes(d) : null); },
    setInputPlaceholder: () => {},
    setInputAriaLabel: () => {},
    setDisabled: () => {},
    afterGuiAttached: () => {},
    refresh: () => {}
  }));

  const handleChange = (v: string | null) => {
    setVal(v);
    props.onDateChanged();
  };

  return <FluentDateTimePicker value={val ?? undefined} onChange={handleChange} />;
});

export default FluentDateInput;
