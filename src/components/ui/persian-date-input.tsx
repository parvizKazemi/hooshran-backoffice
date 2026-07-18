import { forwardRef, useState, useMemo } from "react";
import { toJalaali, toGregorian, jalaaliMonthLength } from "jalaali-js";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { IconCalendar } from "@tabler/icons-react";

type PersianDateInputProps = {
  value?: string; // ISO date string (YYYY-MM-DD) - Gregorian
  onChange?: (value: string | undefined) => void; // Returns ISO date string (Gregorian)
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
};

const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const PERSIAN_WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function formatPersianDate(jy: number, jm: number, jd: number): string {
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

function parseGregorianDate(
  dateString: string
): { year: number; month: number; day: number } | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function getDaysInMonth(jy: number, jm: number): number {
  return jalaaliMonthLength(jy, jm);
}

export const PersianDateInput = forwardRef<
  HTMLButtonElement,
  PersianDateInputProps
>(
  (
    {
      value,
      onChange,
      placeholder = "تاریخ را انتخاب کنید",
      disabled,
      className,
      id,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
      if (value) {
        const greg = parseGregorianDate(value);
        if (greg) {
          const jalaali = toJalaali(greg.year, greg.month, greg.day);
          return { year: jalaali.jy, month: jalaali.jm };
        }
      }
      const today = new Date();
      const jalaali = toJalaali(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate()
      );
      return { year: jalaali.jy, month: jalaali.jm };
    });

    const selectedDate = useMemo(() => {
      if (!value) return null;
      const greg = parseGregorianDate(value);
      if (!greg) return null;
      const jalaali = toJalaali(greg.year, greg.month, greg.day);
      return { year: jalaali.jy, month: jalaali.jm, day: jalaali.jd };
    }, [value]);

    const displayValue = useMemo(() => {
      if (!selectedDate) return "";
      return formatPersianDate(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day
      );
    }, [selectedDate]);

    const handleDateSelect = (day: number) => {
      const gregorian = toGregorian(viewDate.year, viewDate.month, day);
      const dateString = `${gregorian.gy}-${String(gregorian.gm).padStart(2, "0")}-${String(gregorian.gd).padStart(2, "0")}`;
      onChange?.(dateString);
      setIsOpen(false);
    };

    const handlePrevMonth = () => {
      if (viewDate.month === 1) {
        setViewDate({ year: viewDate.year - 1, month: 12 });
      } else {
        setViewDate({ ...viewDate, month: viewDate.month - 1 });
      }
    };

    const handleNextMonth = () => {
      if (viewDate.month === 12) {
        setViewDate({ year: viewDate.year + 1, month: 1 });
      } else {
        setViewDate({ ...viewDate, month: viewDate.month + 1 });
      }
    };

    const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month);
    const gregorian = toGregorian(viewDate.year, viewDate.month, 1);
    const firstDayOfMonth = new Date(
      gregorian.gy,
      gregorian.gm - 1,
      gregorian.gd
    );
    const firstDayWeekday = firstDayOfMonth.getDay();
    // Convert to Persian weekday (Saturday = 0, Sunday = 1, ..., Friday = 6)
    // JavaScript: Sunday = 0, Monday = 1, ..., Saturday = 6
    // Persian: Saturday = 0, Sunday = 1, ..., Friday = 6
    const firstDayPersianWeekday = (firstDayWeekday + 1) % 7;

    const calendarDays = [];
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayPersianWeekday; i++) {
      calendarDays.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "relative w-full justify-between font-normal",
              !displayValue && "text-muted-foreground",
              className
            )}
            id={id}
          >
            <span className="truncate font-mono text-xs">
              {displayValue || placeholder}
            </span>
            <IconCalendar className="text-muted-foreground size-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 rounded-2xl p-4"
          align="start"
          dir="rtl"
        >
          <div>
            {/* Header */}
            <div className="mb-3 flex items-center justify-between border-b pb-3 select-none">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleNextMonth}
                className="bg-muted/50 hover:bg-muted h-7 w-7"
              >
                ‹
              </Button>
              <div className="text-xs font-black">
                {PERSIAN_MONTHS[viewDate.month - 1]} {viewDate.year}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handlePrevMonth}
                className="bg-muted/50 hover:bg-muted h-7 w-7"
              >
                ›
              </Button>
            </div>

            {/* Weekday headers */}
            <div className="text-muted-foreground mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-black select-none">
              {PERSIAN_WEEKDAYS.map((day, index) => (
                <div
                  key={day}
                  className={cn(
                    "flex h-7 items-center justify-center",
                    index === 6 && "text-rose-500"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-8" />;
                }
                const isSelected =
                  selectedDate?.year === viewDate.year &&
                  selectedDate?.month === viewDate.month &&
                  selectedDate?.day === day;
                const isFriday = (firstDayPersianWeekday + day - 1) % 7 === 6;
                return (
                  <button
                    key={day}
                    type="button"
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-full text-xs font-bold transition-all duration-150",
                      isSelected
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/35 hover:bg-blue-500"
                        : "hover:bg-muted text-foreground",
                      !isSelected && isFriday && "text-rose-500"
                    )}
                    onClick={() => handleDateSelect(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

PersianDateInput.displayName = "PersianDateInput";
