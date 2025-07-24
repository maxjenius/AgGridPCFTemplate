import React, { forwardRef, useImperativeHandle, useState } from 'react';
import type { ICellEditorParams } from 'ag-grid-community';
import FluentDateTimePicker from './FluentDateTimePicker';

const FluentDateTimeCellEditor = forwardRef((props: ICellEditorParams, ref) => {
  const [val, setVal] = useState<string>(props.value ?? '2025-05-04T21:35');

  useImperativeHandle(ref, () => ({
    getValue: () => val,
    isPopup: () => true,
  }));

  return <FluentDateTimePicker value={val} onChange={(v) => v && setVal(v)} />;
});

export default FluentDateTimeCellEditor;
