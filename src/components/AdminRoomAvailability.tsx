import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  keyword: string;
  status: string;
  max_guests: number;
}

interface AvailabilityData {
  date: string;
  available: boolean;
  price_override?: number;
  notes?: string;
}

interface Booking {
  id: string;
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_amount: number;
}

const AdminRoomAvailability: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDate, setShowAddDate] = useState(false);
  const [newDateData, setNewDateData] = useState({
    date: '',
    available: true,
    price_override: '',
    notes: ''
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadAvailability();
      loadBookings();
    }
  }, [selectedRoom, currentDate]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    if (!selectedRoom) return;

    setLoading(true);
    try {
      console.log('Loading availability for room:', selectedRoom.id);
      console.log('Year:', currentDate.getFullYear(), 'Month:', currentDate.getMonth() + 1);
      
      const { data, error } = await supabase.rpc('get_room_availability_month', {
        room_id_input: selectedRoom.id,
        year_input: currentDate.getFullYear(),
        month_input: currentDate.getMonth() + 1
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }
      
      console.log('Availability data:', data);
      setAvailability(data || []);
    } catch (error) {
      console.error('Error loading availability:', error);
      // If RPC fails, try direct query as fallback
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('room_availability')
          .select('*')
          .eq('room_id', selectedRoom.id)
          .gte('date', `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`)
          .lt('date', `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 2).padStart(2, '0')}-01`);

        if (fallbackError) throw fallbackError;
        
        const formattedData = fallbackData?.map(item => ({
          date: item.date,
          available: item.is_available,
          price_override: item.price_override,
          notes: item.notes
        })) || [];
        
        console.log('Fallback availability data:', formattedData);
        setAvailability(formattedData);
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        setAvailability([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    if (!selectedRoom) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('room_id', selectedRoom.id)
        .order('check_in_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const updateAvailability = async (date: string, available: boolean, priceOverride?: number, notes?: string) => {
    if (!selectedRoom) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('room_availability')
        .upsert({
          room_id: selectedRoom.id,
          date: date,
          is_available: available,
          price_override: priceOverride || null,
          notes: notes || null
        });

      if (error) throw error;
      await loadAvailability();
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Error updating availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addDateAvailability = async () => {
    if (!selectedRoom || !newDateData.date) {
      alert('Please select a room and enter a date');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('room_availability')
        .insert({
          room_id: selectedRoom.id,
          date: newDateData.date,
          is_available: newDateData.available,
          price_override: newDateData.price_override ? parseFloat(newDateData.price_override) : null,
          notes: newDateData.notes || null
        });

      if (error) throw error;

      setNewDateData({ date: '', available: true, price_override: '', notes: '' });
      setShowAddDate(false);
      await loadAvailability();
    } catch (error) {
      console.error('Error adding date availability:', error);
      alert('Error adding date availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAvailability = async (date: string) => {
    if (!selectedRoom) return;

    if (!confirm('Are you sure you want to delete this availability record?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('room_availability')
        .delete()
        .eq('room_id', selectedRoom.id)
        .eq('date', date);

      if (error) throw error;
      await loadAvailability();
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('Error deleting availability. Please try again.');
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

  const getDateAvailability = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availability.find(a => a.date === dateStr);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 w-12"></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const available = isDateAvailable(date);
      const availabilityData = getDateAvailability(date);
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

      days.push(
        <div
          key={day}
          className={`
            h-12 w-12 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center cursor-pointer
            ${isPast 
              ? 'text-gray-300 cursor-not-allowed' 
              : available 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }
          `}
          onClick={() => {
            if (!isPast && selectedRoom) {
              const newAvailable = !available;
              updateAvailability(dateStr, newAvailable);
            }
          }}
        >
          <div className="text-center">
            <div className="text-xs">{day}</div>
            {availabilityData?.price_override && (
              <div className="text-xs opacity-75">₱{availabilityData.price_override}</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  // Debug logging
  console.log('AdminRoomAvailability - selectedRoom:', selectedRoom);
  console.log('AdminRoomAvailability - loading:', loading);
  console.log('AdminRoomAvailability - availability:', availability);

  if (loading && !selectedRoom) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pine-forest"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-rustic font-bold text-pine-forest mb-2">
          Room Availability Management
        </h1>
        <p className="text-pine-bark">
          Manage room availability dates and pricing for Pine Woods Campsite
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Room Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-pine-stone p-6">
          <h2 className="text-xl font-rustic font-semibold text-pine-forest mb-4">Select Room</h2>
          <div className="space-y-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                  selectedRoom?.id === room.id
                    ? 'bg-pine-forest text-white'
                    : 'bg-pine-cream text-pine-forest hover:bg-pine-sand'
                }`}
              >
                <div className="font-medium">{room.room_number}</div>
                <div className="text-sm opacity-75">{room.room_type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        {selectedRoom && (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-pine-stone p-6">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pine-forest"></div>
              </div>
            )}
            {!loading && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-rustic font-semibold text-pine-forest">
                {selectedRoom.room_number} - {selectedRoom.room_type}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAddDate(true)}
                  className="flex items-center space-x-1 px-3 py-2 bg-pine-forest text-white rounded-lg hover:bg-pine-sage transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Date</span>
                </button>
                <button
                  onClick={loadAvailability}
                  className="flex items-center space-x-1 px-3 py-2 bg-pine-stone text-white rounded-lg hover:bg-pine-bark transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-pine-sand rounded-lg transition-colors duration-200"
              >
                <ChevronLeft className="h-5 w-5 text-pine-forest" />
              </button>
              <h3 className="text-lg font-rustic font-semibold text-pine-forest">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-pine-sand rounded-lg transition-colors duration-200"
              >
                <ChevronRight className="h-5 w-5 text-pine-forest" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map(day => (
                <div key={day} className="h-12 flex items-center justify-center text-sm font-medium text-pine-bark">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-6">
              {renderCalendar()}
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 rounded"></div>
                <span>Unavailable</span>
              </div>
              <div className="text-pine-bark">
                Click dates to toggle availability
              </div>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Bookings List */}
      {selectedRoom && bookings.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-pine-stone">
          <div className="p-6 border-b border-pine-stone">
            <h2 className="text-xl font-rustic font-semibold text-pine-forest">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pine-cream">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Check-out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pine-stone">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pine-forest">
                      {booking.guest_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pine-bark">
                      {new Date(booking.check_in_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pine-bark">
                      {new Date(booking.check_out_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pine-bark">
                      ₱{booking.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm px-2 py-1 rounded ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Date Modal */}
      {showAddDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-pine-forest mb-4">Add Date Availability</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pine-forest mb-1">Date</label>
                <input
                  type="date"
                  value={newDateData.date}
                  onChange={(e) => setNewDateData({ ...newDateData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pine-forest mb-1">Available</label>
                <select
                  value={newDateData.available.toString()}
                  onChange={(e) => setNewDateData({ ...newDateData, available: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest"
                >
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-pine-forest mb-1">Price Override (Optional)</label>
                <input
                  type="number"
                  value={newDateData.price_override}
                  onChange={(e) => setNewDateData({ ...newDateData, price_override: e.target.value })}
                  className="w-full px-3 py-2 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest"
                  placeholder="Leave empty for default price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pine-forest mb-1">Notes (Optional)</label>
                <textarea
                  value={newDateData.notes}
                  onChange={(e) => setNewDateData({ ...newDateData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest"
                  rows={3}
                  placeholder="Add notes about this date..."
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={addDateAvailability}
                disabled={loading}
                className="flex-1 bg-pine-forest text-white py-2 rounded-lg hover:bg-pine-sage disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Date'}
              </button>
              <button
                onClick={() => setShowAddDate(false)}
                className="flex-1 bg-pine-stone text-white py-2 rounded-lg hover:bg-pine-bark"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoomAvailability;
