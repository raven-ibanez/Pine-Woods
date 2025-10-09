import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomCalendarProps {
  selectedDate: string;
  selectedEndDate?: string;
  onDateSelect: (startDate: string, endDate?: string) => void;
  minDate?: string;
  blockedDates?: string[];
  readOnly?: boolean;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ 
  selectedDate, 
  selectedEndDate,
  onDateSelect, 
  minDate = new Date().toISOString().split('T')[0],
  blockedDates = [],
  readOnly = false
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectionMode, setSelectionMode] = useState<'start' | 'end'>('start');
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const isDateDisabled = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return dateString < minDate;
  };

  const isDateBlocked = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return blockedDates.includes(dateString);
  };
  
  const isDateSelected = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return dateString === selectedDate;
  };
  
  const isDateInRange = (date: Date) => {
    if (!selectedDate || !selectedEndDate) return false;
    const dateString = date.toISOString().split('T')[0];
    return dateString >= selectedDate && dateString <= selectedEndDate;
  };
  
  const isStartDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return dateString === selectedDate;
  };
  
  const isEndDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return dateString === selectedEndDate;
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const handleDateClick = (date: Date) => {
    if (readOnly) return;
    
    if (!isDateDisabled(date) && !isDateBlocked(date)) {
      const dateString = date.toISOString().split('T')[0];
      
      if (!selectedDate || selectionMode === 'start') {
        // Starting a new selection or selecting start date
        onDateSelect(dateString);
        setSelectionMode('end');
      } else {
        // Selecting end date
        if (dateString >= selectedDate) {
          onDateSelect(selectedDate, dateString);
          setSelectionMode('start');
        } else {
          // If end date is before start date, make it the new start date
          onDateSelect(dateString);
          setSelectionMode('end');
        }
      }
    }
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 w-12"></div>
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const disabled = isDateDisabled(date);
      const blocked = isDateBlocked(date);
      const selected = isDateSelected(date);
      const inRange = isDateInRange(date);
      const isStart = isStartDate(date);
      const isEnd = isEndDate(date);
      const today = isToday(date);
      
      let buttonClass = 'h-12 w-12 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center';
      
      if (disabled) {
        buttonClass += ' text-gray-300 cursor-not-allowed bg-gray-50';
      } else if (blocked) {
        buttonClass += ' bg-red-500 text-white cursor-not-allowed shadow-md';
      } else if (isStart || isEnd) {
        buttonClass += ' bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg transform scale-105 ring-2 ring-blue-200';
      } else if (inRange) {
        buttonClass += ' bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 shadow-sm';
      } else if (today) {
        buttonClass += ' bg-gradient-to-br from-green-100 to-green-200 text-green-800 border-2 border-green-400 hover:from-green-200 hover:to-green-300';
      } else {
        buttonClass += ' text-gray-700 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 hover:text-gray-900 hover:scale-105 hover:shadow-md';
      }
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={disabled || blocked}
          className={buttonClass}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100" style={{ backgroundColor: '#ffffff' }}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-105"
        >
          <ChevronLeft className="h-6 w-6 text-gray-600" />
        </button>
        
        <h3 className="text-2xl font-bold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-105"
        >
          <ChevronRight className="h-6 w-6 text-gray-600" />
        </button>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map(day => (
          <div key={day} className="h-10 flex items-center justify-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {renderCalendar()}
      </div>
      
      {/* Selection Instructions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-gray-600 mb-2">
            {selectionMode === 'start' ? '📅 Click to select start date' : '📅 Click to select end date'}
          </p>
          {selectedDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 inline-block">
              <p className="text-sm font-semibold text-blue-800">
                📍 Start: {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
                {selectedEndDate && (
                  <span className="ml-2">
                    📍 End: {new Date(selectedEndDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 flex-wrap bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm"></div>
            <span className="text-xs font-medium text-gray-700">Start/End</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200"></div>
            <span className="text-xs font-medium text-gray-700">Range</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400"></div>
            <span className="text-xs font-medium text-gray-700">Today</span>
          </div>
             {blockedDates.length > 0 && (
               <div className="flex items-center space-x-2">
                 <div className="w-4 h-4 rounded-lg bg-red-500 shadow-sm"></div>
                 <span className="text-xs font-medium text-gray-700">Booked</span>
               </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default CustomCalendar;
