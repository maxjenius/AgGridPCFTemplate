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
  const closedByAction = React.useRef(false);

  React.useEffect(() => {
    setTemp(value);
  }, [value]);

  const handleDone = () => {
    closedByAction.current = true;
    onChange(temp);
    setOpen(false);
  };

  const handleCancel = () => {
    closedByAction.current = true;
    setTemp(value);
    setOpen(false);
  };

  const handleOpenChange = (o: boolean) => {
    if (!o && !closedByAction.current) {
      setTemp(value);
    }
    if (!o) {
      closedByAction.current = false;
    }
    setOpen(o);
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button type="button" className="dt-trigger">
          <span>{format(value, 'Pp')}</span>
          <Calendar className="ml-1" size={16} />
        </button>
      </Popover.Trigger>
      <Popover.Content
        side="right"
        align="start"
        sideOffset={4}
        collisionPadding={8}
        className="dt-popover"
      >
        <DatetimePicker
          selected={temp}
          setDate={setTemp}
          onDone={handleDone}
          onCancel={handleCancel}
        />
      </Popover.Content>
    </Popover.Root>
  );
}
