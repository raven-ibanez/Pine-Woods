import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, X, Plus, Trash2, Save, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Room, BlockedDate } from '../types';
import CustomCalendar from './CustomCalendar';

interface RoomAvailabilityManagerProps {
  onBack: () => void;
}

const RoomAvailabilityManager: React.FC<RoomAvailabilityManagerProps> = ({ onBack }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [blockReason, setBlockReason] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isBlockingDate, setIsBlockingDate] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchRooms();
    fetchBlockedDates();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_type', { ascending: true });

      if (error) throw error;
      console.log('Fetched rooms:', data); // Debug log
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      alert('Failed to fetch rooms');
    }
  };

  const fetchBlockedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('room_blocked_dates')
        .select('*')
        .order('blocked_date', { ascending: true });

      if (error) throw error;
      setBlockedDates(data || []);
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDate = async () => {
    if (!selectedRoom || !selectedDate || !blockReason.trim()) {
      alert('Please select a room, date, and provide a reason');
      return;
    }

    try {
      setIsBlockingDate(true);
      
      const { error } = await supabase
        .from('room_blocked_dates')
        .insert({
          room_id: selectedRoom.id,
          blocked_date: selectedDate,
          reason: blockReason.trim(),
          blocked_by: 'admin'
        });

      if (error) throw error;

      // Refresh blocked dates
      await fetchBlockedDates();
      
      // Reset form
      setSelectedDate('');
      setBlockReason('');
      
      alert('Date blocked successfully');
    } catch (error) {
      console.error('Error blocking date:', error);
      alert('Failed to block date');
    } finally {
      setIsBlockingDate(false);
    }
  };

  const handleBlockDateFromCalendar = async (roomId: string, date: string) => {
    try {
      const { error } = await supabase
        .from('room_blocked_dates')
        .insert({
          room_id: roomId,
          blocked_date: date,
          reason: 'Booked from calendar',
          blocked_by: 'admin'
        });

      if (error) throw error;

      // Refresh blocked dates
      await fetchBlockedDates();
      
      alert('Date marked as booked successfully');
    } catch (error) {
      console.error('Error marking date as booked from calendar:', error);
      alert('Failed to mark date as booked');
    }
  };

  const handleUnblockDate = async (blockedDateId: string) => {
    if (!confirm('Are you sure you want to mark this date as available?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('room_blocked_dates')
        .delete()
        .eq('id', blockedDateId);

      if (error) throw error;

      await fetchBlockedDates();
      alert('Date marked as available successfully');
    } catch (error) {
      console.error('Error marking date as available:', error);
      alert('Failed to mark date as available');
    }
  };

  const getBlockedDatesForRoom = (roomId: string) => {
    return blockedDates
      .filter(bd => bd.room_id === roomId)
      .map(bd => bd.blocked_date);
  };

  const isDateBlocked = (roomId: string, date: string) => {
    return blockedDates.some(bd => bd.room_id === roomId && bd.blocked_date === date);
  };

  const getBlockedDateInfo = (roomId: string, date: string) => {
    return blockedDates.find(bd => bd.room_id === roomId && bd.blocked_date === date);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-2xl font-playfair font-semibold text-gray-900">Room Availability</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Block Date Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-playfair font-medium text-gray-900 mb-6 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-green-600" />
              Mark Dates as Booked
            </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Room Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
              <select
                value={selectedRoom?.id || ''}
                onChange={(e) => {
                  const room = rooms.find(r => r.id === e.target.value);
                  setSelectedRoom(room || null);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Choose a room...</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} - {formatPrice(room.base_price)}/night
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Booking Reason</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g., Guest Booking, Maintenance, Unavailable"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleBlockDate}
              disabled={!selectedRoom || !selectedDate || !blockReason.trim() || isBlockingDate}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              <span>{isBlockingDate ? 'Marking as Booked...' : 'Mark as Booked'}</span>
            </button>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Room Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{room.room_type} Room</p>
                    <p className="text-lg font-semibold text-green-600 mt-1">
                      {formatPrice(room.base_price)}/night
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Max Guests</p>
                    <p className="text-lg font-semibold text-gray-900">{room.max_guests}</p>
                  </div>
                </div>
                
                {room.description && (
                  <p className="text-sm text-gray-600 mt-3">{room.description}</p>
                )}
                
                {room.amenities && room.amenities.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Amenities:</p>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Calendar Section */}
              <div className="p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Booking Calendar</h4>
                <div className="mb-4">
                  <CustomCalendar
                    selectedDate=""
                    selectedEndDate=""
                    onDateSelect={(date) => {
                      // Handle date selection for blocking/unblocking
                      if (date) {
                        const isBlocked = getBlockedDatesForRoom(room.id).includes(date);
                        if (isBlocked) {
                          // If date is blocked, unblock it
                          const blockedInfo = getBlockedDateInfo(room.id, date);
                          if (blockedInfo?.id) {
                            handleUnblockDate(blockedInfo.id);
                          }
                        } else {
                          // If date is not booked, mark it as booked
                          setSelectedRoom(room);
                          setSelectedDate(date);
                          setBlockReason('Booked from calendar');
                          // Auto-mark the date as booked
                          handleBlockDateFromCalendar(room.id, date);
                        }
                      }
                    }}
                    minDate={new Date().toISOString().split('T')[0]}
                    blockedDates={getBlockedDatesForRoom(room.id)}
                    readOnly={false}
                  />
                </div>

                {/* Booked Dates List */}
                {getBlockedDatesForRoom(room.id).length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Booked Dates</h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {getBlockedDatesForRoom(room.id).map(date => {
                        const blockedInfo = getBlockedDateInfo(room.id, date);
                        return (
                          <div
                            key={date}
                            className="flex items-center justify-between p-2 bg-red-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium text-red-800">
                                {formatDate(date)}
                              </p>
                              {blockedInfo?.reason && (
                                <p className="text-xs text-red-600">{blockedInfo.reason}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleUnblockDate(blockedInfo?.id || '')}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors duration-200"
                              title="Mark as Available"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* All Booked Dates Summary */}
        {blockedDates.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-playfair font-medium text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
              All Booked Dates Summary
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Room</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Reason</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Booked By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedDates.map(blockedDate => {
                    const room = rooms.find(r => r.id === blockedDate.room_id);
                    return (
                      <tr key={blockedDate.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">
                            {room?.name || 'Unknown Room'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-700">
                            {formatDate(blockedDate.blocked_date)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-700">{blockedDate.reason}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-700 capitalize">{blockedDate.blocked_by}</span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleUnblockDate(blockedDate.id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors duration-200"
                            title="Mark as Available"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="text-sm">Mark Available</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomAvailabilityManager;
