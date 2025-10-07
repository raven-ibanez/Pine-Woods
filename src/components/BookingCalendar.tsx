import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AvailabilityData {
  date: string;
  available: boolean;
  price_override?: number;
  notes?: string;
}

interface BookingCalendarProps {
  roomId: string;
  roomName: string;
  basePrice: number;
  onDateSelect: (checkIn: Date, checkOut: Date, totalNights: number, totalAmount: number) => void;
  onClose: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  roomId,
  roomName,
  basePrice,
  onDateSelect,
  onClose
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    loadAvailability();
  }, [currentDate, roomId]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_room_availability_month', {
        room_id_input: roomId,
        year_input: currentDate.getFullYear(),
        month_input: currentDate.getMonth() + 1
      });

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const availabilityData = availability.find(a => a.date === dateStr);
    return availabilityData ? availabilityData.available : true;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    return date >= selectedCheckIn && date <= selectedCheckOut;
  };

  const isDateSelected = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const checkInStr = selectedCheckIn?.toISOString().split('T')[0];
    const checkOutStr = selectedCheckOut?.toISOString().split('T')[0];
    return dateStr === checkInStr || dateStr === checkOutStr;
  };

  const handleDateClick = (date: Date) => {
    if (!isDateAvailable(date)) return;

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // Start new selection
      setSelectedCheckIn(date);
      setSelectedCheckOut(null);
    } else if (selectedCheckIn && !selectedCheckOut) {
      // Complete selection
      if (date > selectedCheckIn) {
        setSelectedCheckOut(date);
      } else {
        // If clicked date is before check-in, make it the new check-in
        setSelectedCheckIn(date);
        setSelectedCheckOut(null);
      }
    }
  };

  const handleBookNow = async () => {
    if (!selectedCheckIn || !selectedCheckOut || !guestInfo.name) {
      alert('Please select dates and provide guest information');
      return;
    }

    const totalNights = Math.ceil((selectedCheckOut.getTime() - selectedCheckIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = totalNights * basePrice;

    try {
      const { data, error } = await supabase.rpc('create_booking', {
        room_id_input: roomId,
        guest_name_input: guestInfo.name,
        guest_email_input: guestInfo.email,
        guest_phone_input: guestInfo.phone,
        check_in_date_input: selectedCheckIn.toISOString().split('T')[0],
        check_out_date_input: selectedCheckOut.toISOString().split('T')[0],
        total_amount_input: totalAmount
      });

      if (error) throw error;

      if (data.success) {
        alert('Booking confirmed successfully!');
        onDateSelect(selectedCheckIn, selectedCheckOut, totalNights, totalAmount);
        onClose();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking. Please try again.');
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 w-10"></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const available = isDateAvailable(date);
      const inRange = isDateInRange(date);
      const selected = isDateSelected(date);
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={!available || isPast}
          className={`
            h-10 w-10 rounded-lg text-sm font-medium transition-colors duration-200
            ${isPast 
              ? 'text-gray-300 cursor-not-allowed' 
              : available 
                ? selected
                  ? 'bg-pine-forest text-white'
                  : inRange
                    ? 'bg-pine-sage text-white'
                    : 'text-pine-forest hover:bg-pine-cream'
                : 'bg-red-100 text-red-600 cursor-not-allowed'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const totalNights = selectedCheckIn && selectedCheckOut 
    ? Math.ceil((selectedCheckOut.getTime() - selectedCheckIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalAmount = totalNights * basePrice;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-pine-stone p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="text-2xl font-rustic font-semibold text-pine-forest">Book {roomName}</h3>
            <p className="text-pine-bark mt-1">Select your check-in and check-out dates</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-pine-sand rounded-full transition-colors duration-200"
          >
            <X className="h-6 w-6 text-pine-forest" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 hover:bg-pine-sand rounded-lg transition-colors duration-200"
                >
                  <ChevronLeft className="h-5 w-5 text-pine-forest" />
                </button>
                <h4 className="text-xl font-rustic font-semibold text-pine-forest">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h4>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 hover:bg-pine-sand rounded-lg transition-colors duration-200"
                >
                  <ChevronRight className="h-5 w-5 text-pine-forest" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-pine-bark">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>

              <div className="mt-6 flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-pine-forest rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-pine-sage rounded"></div>
                  <span>In Range</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-100 rounded"></div>
                  <span>Unavailable</span>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-6">
              <div className="bg-pine-cream rounded-xl p-6">
                <h4 className="text-lg font-rustic font-semibold text-pine-forest mb-4">Booking Details</h4>
                
                {selectedCheckIn && selectedCheckOut && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-pine-bark">Check-in:</span>
                      <span className="font-medium text-pine-forest">
                        {selectedCheckIn.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pine-bark">Check-out:</span>
                      <span className="font-medium text-pine-forest">
                        {selectedCheckOut.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pine-bark">Total Nights:</span>
                      <span className="font-medium text-pine-forest">{totalNights}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pine-bark">Price per Night:</span>
                      <span className="font-medium text-pine-forest">₱{basePrice.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-pine-stone pt-3">
                      <div className="flex justify-between text-lg font-semibold text-pine-forest">
                        <span>Total Amount:</span>
                        <span>₱{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-rustic font-semibold text-pine-forest">Guest Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-pine-forest mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pine-forest mb-1">Email</label>
                  <input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-pine-forest mb-1">Phone</label>
                  <input
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <button
                onClick={handleBookNow}
                disabled={!selectedCheckIn || !selectedCheckOut || !guestInfo.name || loading}
                className="w-full bg-pine-forest text-white py-4 rounded-xl hover:bg-pine-sage disabled:bg-pine-stone disabled:cursor-not-allowed transition-colors duration-200 font-semibold flex items-center justify-center space-x-2"
              >
                <Calendar className="h-5 w-5" />
                <span>{loading ? 'Processing...' : 'Book Now'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
