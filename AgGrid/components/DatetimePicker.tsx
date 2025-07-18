import React from 'react';
import { DayPicker, DayPickerSingleProps, useNavigation } from 'react-day-picker';
import { ChevronLeft, ChevronRight, Clock, CalendarCheck, CalendarCog, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { TimePickerInput } from './TimePickerInput';

export type DatetimePickerProps = Omit<DayPickerSingleProps, 'mode' | 'onSelect'> & {
  setDate: (date: Date) => void;
};

function DatetimePicker({ className, showOutsideDays = true, setDate: setGlobalDate, ...props }: DatetimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const { selected: selectedDate } = props as { selected: Date };

  const setDate = (dateInput: Date) => {
    const date = new Date(selectedDate);
    date.setDate(dateInput.getDate());
    date.setMonth(dateInput.getMonth());
    date.setFullYear(dateInput.getFullYear());
    setGlobalDate(date);
  };

  const setTime = (dateInput: Date | undefined) => {
    if (!dateInput) return;
    const time = new Date(selectedDate);
    time.setHours(dateInput.getHours());
    time.setMinutes(dateInput.getMinutes());
    setGlobalDate(time);
  };

  return (
    <>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={setDate as any}
        showOutsideDays={showOutsideDays}
        className={className}
        components={{
          Footer: () => {
            const { goToDate } = useNavigation();
            return (
              <div>
                <hr className="mt-2" />
                <div className="mt-2">
                  <button
                    className="w-full flex justify-between"
                    type="button"
                    onClick={() => {
                      const chosenDate = new Date();
                      goToDate(chosenDate);
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
                      goToDate(chosenDate);
                      setDate(chosenDate);
                    }}
                  >
                    <span className="flex"><CalendarCog className="h-4 w-4 mr-1" />Tomorrow</span>
                    <span className="text-sm text-gray-400">{format(new Date(Date.now() + 24*60*60*1000), 'PPP')}</span>
                  </button>
                  <button
                    className="w-full flex justify-between"
                    type="button"
                    onClick={() => {
                      const chosenDate = new Date();
                      chosenDate.setDate(chosenDate.getDate() + 7);
                      goToDate(chosenDate);
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
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
      <hr className="my-2" />
      <div className="flex justify-between px-2">
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Time</span>
        </div>
        <div className="flex items-center gap-2">
          <TimePickerInput
            picker="hours"
            date={selectedDate}
            setDate={setTime}
            ref={hourRef}
            onRightFocus={() => minuteRef.current?.focus()}
          />
          <span>:</span>
          <TimePickerInput
            picker="minutes"
            date={selectedDate}
            setDate={setTime}
            ref={minuteRef}
            onLeftFocus={() => hourRef.current?.focus()}
          />
        </div>
      </div>
    </>
  );
}

DatetimePicker.displayName = 'DatetimePicker';

export { DatetimePicker };
