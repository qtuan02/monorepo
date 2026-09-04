"use client";

import type { DateRange, Matcher } from "react-day-picker";
import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "#components/button";
import { Calendar } from "#components/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "#components/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "#components/popover";
import { cn } from "#utils/cn";

// The defaults are a matched dd/MM/yyyy pair so the input round-trips without
// any date library. Apps normally inject their own pair built on @monorepo/dayjs
// (formatDate + a strict parse) so display formats stay in one table.
function defaultFormatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function defaultParseDate(text: string): Date | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (match) {
    const [, dayText, monthText, yearText] = match;
    if (!dayText || !monthText || !yearText) return null;
    const day = Number(dayText);
    const month = Number(monthText);
    const year = Number(yearText);
    const date = new Date(year, month - 1, day);
    // new Date() silently rolls 31/02 into March — reject anything that rolled.
    const isRealDay =
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
    return isRealDay ? date : null;
  }
  const date = new Date(text.trim());
  return Number.isNaN(date.getTime()) ? null : date;
}

// Rebuilds the masked dd/MM/yyyy text from whatever sits in the input. Digits
// fill day → month → year and the "/" separators appear on their own; a digit
// that would make an impossible segment zero-pads and shifts forward instead
// (typing "35" reads as day 03, month 5 — day can never exceed 31, month never
// 12). A manually typed "/" completes a 1-digit segment by zero-padding. The
// output never ends in a separator, so backspace always removes something real.
function maskDateText(input: string): string {
  let day = "";
  let month = "";
  let year = "";

  const pushDigit = (char: string) => {
    const digit = Number(char);
    if (day.length < 2) {
      if (day === "") {
        day = digit > 3 ? `0${char}` : char;
      } else if (day === "0" && digit === 0) {
        // "00" is no day — swallow the digit
      } else if (day === "3" && digit > 1) {
        day = "03";
        pushDigit(char);
      } else {
        day += char;
      }
      return;
    }
    if (month.length < 2) {
      if (month === "") {
        month = digit > 1 ? `0${char}` : char;
      } else if (month === "0" && digit === 0) {
        // "00" is no month — swallow the digit
      } else if (month === "1" && digit > 2) {
        month = "01";
        pushDigit(char);
      } else {
        month += char;
      }
      return;
    }
    if (year.length < 4) year += char;
  };

  for (const char of input) {
    if (char === "/") {
      if (month === "" && day.length === 1 && day !== "0") {
        day = `0${day}`;
      } else if (year === "" && month.length === 1 && month !== "0") {
        month = `0${month}`;
      }
      continue;
    }
    if (char >= "0" && char <= "9") pushDigit(char);
  }

  if (year !== "") return `${day}/${month}/${year}`;
  if (month !== "") return `${day}/${month}`;
  return day;
}

function isCompleteDateText(text: string): boolean {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(text);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type DatePickerCalendarProps = {
  captionLayout?: React.ComponentProps<typeof Calendar>["captionLayout"];
  locale?: React.ComponentProps<typeof Calendar>["locale"];
  startMonth?: Date;
  endMonth?: Date;
  defaultMonth?: Date;
  disabled?: Matcher | Matcher[];
  numberOfMonths?: number;
  showOutsideDays?: boolean;
};

type DatePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "onChange"
> & {
  value?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  formatDate?: (date: Date) => string;
  calendar?: DatePickerCalendarProps;
  ref?: React.Ref<HTMLButtonElement>;
};

function DatePicker({
  value,
  onValueChange,
  placeholder = "Chọn ngày",
  formatDate = defaultFormatDate,
  calendar,
  className,
  ref,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            ref={ref}
            type="button"
            variant="outline"
            data-empty={!value}
            className={cn(
              "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
              className,
            )}
            {...props}
          />
        }
      >
        <CalendarIcon />
        {value ? formatDate(value) : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          defaultMonth={value}
          {...calendar}
          mode="single"
          selected={value}
          onSelect={(date) => {
            onValueChange?.(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

type DateRangePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "onChange"
> & {
  value?: DateRange;
  onValueChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  formatDate?: (date: Date) => string;
  calendar?: DatePickerCalendarProps;
  ref?: React.Ref<HTMLButtonElement>;
};

function DateRangePicker({
  value,
  onValueChange,
  placeholder = "Chọn khoảng ngày",
  formatDate = defaultFormatDate,
  calendar,
  className,
  ref,
  ...props
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const label = value?.from
    ? value.to
      ? `${formatDate(value.from)} – ${formatDate(value.to)}`
      : formatDate(value.from)
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            ref={ref}
            type="button"
            variant="outline"
            data-empty={!label}
            className={cn(
              "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
              className,
            )}
            {...props}
          />
        }
      >
        <CalendarIcon />
        {label ?? <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          defaultMonth={value?.from}
          numberOfMonths={2}
          {...calendar}
          mode="range"
          selected={value}
          onSelect={(range) => onValueChange?.(range)}
        />
      </PopoverContent>
    </Popover>
  );
}

type DatePickerInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "type"
> & {
  value?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  formatDate?: (date: Date) => string;
  parseDate?: (text: string) => Date | null;
  calendar?: DatePickerCalendarProps;
  ref?: React.Ref<HTMLInputElement>;
};

// A controlled field: the parent owns `value` (an RHF Controller, a useState)
// and echoes every onValueChange back in. Typing goes through the dd/MM/yyyy
// mask above — digits only, separators auto-filled — and only a COMPLETE text
// is parsed; anything less reports `undefined` upward (so a required-date
// schema catches it) and self-heals on blur.
function DatePickerInput({
  value,
  onValueChange,
  placeholder = "dd/mm/yyyy",
  formatDate = defaultFormatDate,
  parseDate = defaultParseDate,
  calendar,
  className,
  disabled,
  ref,
  ...props
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(value ? formatDate(value) : "");
  const [month, setMonth] = React.useState<Date>(() => value ?? new Date());
  // The value as this component last knew it — from the prop or its own report.
  // Comparing against it tells an external change (calendar pick echoed back,
  // form reset) apart from the echo of the user's own keystrokes, which must
  // not rewrite the text they are still editing.
  const [lastValue, setLastValue] = React.useState(value);

  if (value?.getTime() !== lastValue?.getTime()) {
    setLastValue(value);
    if (value) {
      setMonth(value);
      const parsed = isCompleteDateText(text) ? parseDate(text) : null;
      if (!(parsed && isSameDay(parsed, value))) {
        setText(formatDate(value));
      }
    } else {
      setText("");
    }
  }

  const applyText = (next: string) => {
    const masked = maskDateText(next);
    setText(masked);
    const parsed = isCompleteDateText(masked) ? parseDate(masked) : null;
    setLastValue(parsed ?? undefined);
    if (parsed) setMonth(parsed);
    onValueChange?.(parsed ?? undefined);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    setLastValue(date);
    setText(date ? formatDate(date) : "");
    if (date) setMonth(date);
    setOpen(false);
    onValueChange?.(date);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    props.onBlur?.(event);
    if (text === "") return;
    const parsed = isCompleteDateText(text) ? parseDate(text) : null;
    if (parsed) {
      setText(formatDate(parsed));
    } else {
      setText(value ? formatDate(value) : "");
    }
  };

  return (
    <InputGroup className={className}>
      <InputGroupInput
        ref={ref}
        type="text"
        inputMode="numeric"
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
        onChange={(event) => applyText(event.target.value)}
        onBlur={handleBlur}
      />
      <InputGroupAddon align="inline-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <InputGroupButton
                size="icon-xs"
                disabled={disabled}
                aria-label="Mở lịch"
              />
            }
          >
            <CalendarIcon />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              {...calendar}
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              month={month}
              onMonthChange={setMonth}
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { DatePicker, DatePickerInput, DateRangePicker };
