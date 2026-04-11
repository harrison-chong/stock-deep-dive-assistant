import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface DatePickerInputProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate = new Date(),
  className = '',
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(value ? new Date(value) : undefined);
  const [viewMonth, setViewMonth] = useState<Date>(value ? new Date(value) : new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setSelected(new Date(value));
      setViewMonth(new Date(value));
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (date: Date | undefined) => {
    setSelected(date);
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  const disabledDays = {
    after: maxDate,
    before: minDate,
  };

  const currentYear = viewMonth.getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - 25 + i).filter(
    (y) => y >= 2000 && y <= maxDate.getFullYear(),
  );
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const footer = (
    <div className="flex justify-end mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        Close
      </button>
    </div>
  );

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/30 dark:border-gray-800/30 rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-gray-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 flex items-center justify-between gap-2"
      >
        <span
          className={
            selected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
          }
        >
          {selected ? format(selected, 'MMM d, yyyy') : placeholder}
        </span>
        <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200/30 dark:border-gray-800/30 p-3">
          {/* Month/Year selector */}
          <div className="flex gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <select
              value={viewMonth.getMonth()}
              onChange={(e) => {
                const newDate = new Date(viewMonth);
                newDate.setMonth(parseInt(e.target.value));
                setViewMonth(newDate);
              }}
              className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {months.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={viewMonth.getFullYear()}
              onChange={(e) => {
                const newDate = new Date(viewMonth);
                newDate.setFullYear(parseInt(e.target.value));
                setViewMonth(newDate);
              }}
              className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={disabledDays}
            showOutsideDays
            footer={footer}
            month={viewMonth}
            onMonthChange={setViewMonth}
            modifiersClassNames={{
              selected: 'rdp-day_selected',
              today: 'rdp-day_today',
            }}
          />
        </div>
      )}
    </div>
  );
}
