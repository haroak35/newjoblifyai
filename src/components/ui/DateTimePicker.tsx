import React, { useState, useRef } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import useClickOutside from '../../hooks/useClickOutside';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());
  const [selectedTime, setSelectedTime] = useState(value ? new Date(value) : new Date());
  const [view, setView] = useState<'date' | 'time'>('date');
  const pickerRef = useRef<HTMLDivElement>(null);

  useClickOutside(pickerRef, () => {
    setIsOpen(false);
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push({
          hour,
          minute,
          label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        });
      }
    }
    return slots;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
    updateDateTime(newDate, selectedTime);
  };

  const handleTimeSelect = (hour: number, minute: number) => {
    const newTime = new Date(selectedTime);
    newTime.setHours(hour, minute);
    setSelectedTime(newTime);
    updateDateTime(selectedDate, newTime);
    setIsOpen(false);
  };

  const updateDateTime = (date: Date, time: Date) => {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes());
    onChange(combined.toISOString());
  };

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDate.getDate();
      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors ${
            isSelected
              ? 'bg-neutral-900 text-white'
              : 'hover:bg-neutral-100 text-neutral-600'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative" ref={pickerRef}>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center px-4 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-700 hover:border-neutral-300 transition-colors relative"
      >
        <div className="absolute left-4 text-neutral-400">
          {view === 'date' ? <Calendar size={16} /> : <Clock size={16} />}
        </div>
        <span className="pl-8">
          {value
            ? new Date(value).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : 'Select date and time'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white border border-neutral-200 rounded-xl shadow-lg w-[320px]">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setView('date')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                view === 'date'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Date
            </button>
            <button
              onClick={() => setView('time')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                view === 'time'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Time
            </button>
          </div>

          {view === 'date' ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-neutral-100 rounded-lg">
                  <ChevronLeft size={20} />
                </button>
                <span className="font-medium">
                  {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </span>
                <button onClick={handleNextMonth} className="p-1 hover:bg-neutral-100 rounded-lg">
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-xs font-medium text-neutral-400">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-[280px] overflow-y-auto">
              {generateTimeSlots().map(({ hour, minute, label }) => (
                <button
                  key={label}
                  onClick={() => handleTimeSelect(hour, minute)}
                  className={`p-2 text-sm rounded-lg transition-colors ${
                    hour === selectedTime.getHours() && minute === selectedTime.getMinutes()
                      ? 'bg-neutral-900 text-white'
                      : 'hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;