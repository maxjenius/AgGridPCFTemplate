import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from 'react';
import type { ICellEditorParams } from 'ag-grid-community';
import FluentDateTimePicker from './FluentDateTimePicker';

const FluentDateTimeCellEditor = forwardRef((props: ICellEditorParams, ref) => {
  const [val, setVal] = useState<string>(props.value ?? '2025-05-04T21:35');
  const valRef = useRef(val);
  useEffect(() => {
    valRef.current = val;
  }, [val]);

  useImperativeHandle(ref, () => ({
    getValue: () => valRef.current,
    isPopup: () => true,
  }));

  return (
    <FluentDateTimePicker
      autoOpen
      value={val}
      onChange={(v) => {
        if (v) {
          valRef.current = v;
          setVal(v);
        }
      }}
    />
  );
});

export default FluentDateTimeCellEditor;
