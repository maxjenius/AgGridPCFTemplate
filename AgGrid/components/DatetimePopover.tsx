import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { DatetimePicker } from './DatetimePicker';

interface DatetimePopoverProps {
  value?: Date;
  onChange: (date: Date) => void;
}

export function DatetimePopover({ value = new Date(), onChange }: DatetimePopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [temp, setTemp] = React.useState<Date>(value);

  React.useEffect(() => {
    setTemp(value);
  }, [value]);

  const handleDone = () => {
    onChange(temp);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className="dt-trigger">
          <span>{format(value, 'Pp')}</span>
          <Calendar className="ml-1" size={16} />
        </button>
      </Popover.Trigger>
      <Popover.Content side="right" align="start" sideOffset={4} className="dt-popover">
        <DatetimePicker selected={temp} setDate={setTemp} onDone={handleDone} />
      </Popover.Content>
    </Popover.Root>
  );
}
