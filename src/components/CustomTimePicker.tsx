import React, { useState } from 'react';
import { Clock } from 'lucide-react';

interface CustomTimePickerProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ selectedTime, onTimeSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Generate time slots (every 30 minutes from 6:00 AM to 10:00 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  const formatDisplayTime = (time: string) => {
    if (!time) return 'Select Time';
    
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  const handleTimeSelect = (time: string) => {
    onTimeSelect(time);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent transition-all duration-200 bg-white text-left flex items-center justify-between hover:bg-pine-sand"
      >
        <span className={selectedTime ? 'text-pine-forest font-medium' : 'text-gray-500'}>
          {formatDisplayTime(selectedTime)}
        </span>
        <Clock className="h-5 w-5 text-pine-forest" />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-pine-stone rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`
                  w-full px-3 py-2 text-left rounded-lg transition-all duration-200
                  ${selectedTime === time
                    ? 'bg-pine-forest text-white'
                    : 'text-pine-bark hover:bg-pine-sand hover:text-pine-forest'
                  }
                `}
              >
                {formatDisplayTime(time)}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CustomTimePicker;

