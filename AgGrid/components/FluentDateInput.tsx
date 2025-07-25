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

  return <FluentDateTimePicker value={val ?? undefined} onChange={setVal} />;
});

export default FluentDateInput;
