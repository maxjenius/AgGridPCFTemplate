import React from 'react';
import { DayPicker, DayPickerProps, useDayPicker } from 'react-day-picker';
import 'react-day-picker/src/style.css';
import { Clock, CalendarCheck, CalendarPlus, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { TimePickerInput } from './TimePickerInput';
import { Period } from './timePickerUtils';

export type DatetimePickerProps = Omit<DayPickerProps, 'mode' | 'onSelect'> & {
  setDate: (date: Date) => void;
  selected?: Date;
  onDone?: () => void;
  onCancel?: () => void;
};

function DatetimePicker({ className, showOutsideDays = true, setDate: setGlobalDate, onDone, onCancel, ...props }: DatetimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const { selected: selectedDate } = props as { selected: Date };
  const [period, setPeriod] = React.useState<Period>(
    selectedDate.getHours() >= 12 ? 'PM' : 'AM'
  );

  React.useEffect(() => {
    setPeriod(selectedDate.getHours() >= 12 ? 'PM' : 'AM');
  }, [selectedDate]);

  const setDate = (dateInput: Date) => {
    const date = new Date(selectedDate);
    date.setDate(dateInput.getDate());
    date.setMonth(dateInput.getMonth());
    date.setFullYear(dateInput.getFullYear());
    setGlobalDate(date);
  };

  const setTime = (dateInput: Date | undefined) => {
    if (!dateInput) return;
    setPeriod(dateInput.getHours() >= 12 ? 'PM' : 'AM');
    setGlobalDate(dateInput);
  };

  const togglePeriod = () => {
    const newPeriod: Period = period === 'AM' ? 'PM' : 'AM';
    const temp = new Date(selectedDate);
    if (newPeriod === 'PM' && temp.getHours() < 12) temp.setHours(temp.getHours() + 12);
    if (newPeriod === 'AM' && temp.getHours() >= 12) temp.setHours(temp.getHours() - 12);
    setPeriod(newPeriod);
    setGlobalDate(temp);
  };

  return (
    <div className={`datetime-picker ${className ?? ''}`.trim()}>
      <DayPicker
        mode="single"
        captionLayout="dropdown"
        selected={selectedDate as any}
        onSelect={setDate as any}
        showOutsideDays={showOutsideDays}
        className="rdp"
        components={{
          Footer: () => {
            const { goToMonth } = useDayPicker();
            return (
              <div>
                <hr className="mt-2" />
                <div className="mt-2">
                  <button
                    className="w-full flex justify-between"
                    type="button"
                    onClick={() => {
                      const chosenDate = new Date();
                      goToMonth(chosenDate);
                      setDate(chosenDate);
                    }}
                  >
                    <span className="flex"><CalendarCheck className="h-4 w-4 mr-1" />Today</span>
                    <span className="text-sm text-gray-400">{format(new Date(), 'PPP')}</span>
                  </button>
                  <button
                    className="w-full flex justify-between"
                    type="button"
                    onClick={() => {
                      const chosenDate = new Date();
                      chosenDate.setDate(chosenDate.getDate() + 1);
                      goToMonth(chosenDate);
                      setDate(chosenDate);
                    }}
                  >
                    <span className="flex"><CalendarPlus className="h-4 w-4 mr-1" />Tomorrow</span>
                    <span className="text-sm text-gray-400">{format(new Date(Date.now() + 24*60*60*1000), 'PPP')}</span>
                  </button>
                  <button
                    className="w-full flex justify-between"
                    type="button"
                    onClick={() => {
                      const chosenDate = new Date();
                      chosenDate.setDate(chosenDate.getDate() + 7);
                      goToMonth(chosenDate);
                      setDate(chosenDate);
                    }}
                  >
                    <span className="flex"><CalendarClock className="h-4 w-4 mr-1" />Next week</span>
                    <span className="text-sm text-gray-400">{format(new Date(Date.now() + 7*24*60*60*1000), 'PPP')}</span>
                  </button>
                </div>
              </div>
            );
          },
        }}
        {...props}
      />
      <hr className="my-2" />
      <div className="time-header">
        <div className="time-label">
          <Clock className="icon" />
          <span>Time</span>
        </div>
        <div className="time-inputs">
          <TimePickerInput
            className="time-input"
            picker="12hours"
            period={period}
            date={selectedDate}
            setDate={setTime}
            ref={hourRef}
            onRightFocus={() => minuteRef.current?.focus()}
          />
          <span>:</span>
          <TimePickerInput
            className="time-input"
            picker="minutes"
            date={selectedDate}
            setDate={setTime}
            ref={minuteRef}
            onLeftFocus={() => hourRef.current?.focus()}
          />
          <button type="button" className="period-toggle" onClick={togglePeriod}>
            {period}
          </button>
        </div>
      </div>
      <div className="picker-actions">
        <button
          type="button"
          className="cancel-button"
          onClick={() => onCancel?.()}
        >
          Cancel
        </button>
        <button
          type="button"
          className="done-button"
          onClick={() => onDone?.()}
        >
          Done
        </button>
      </div>
    </div>
  );
}

DatetimePicker.displayName = 'DatetimePicker';

export { DatetimePicker };
