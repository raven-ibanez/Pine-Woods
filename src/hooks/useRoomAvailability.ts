import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Room, BlockedDate, RoomBooking } from '../types';

export const useRoomAvailability = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_type', { ascending: true });

      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
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
    } catch (err) {
      console.error('Error fetching blocked dates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch blocked dates');
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    }
  };

  const blockDate = async (roomId: string, date: string, reason: string) => {
    try {
      const { data, error } = await supabase
        .from('room_blocked_dates')
        .insert({
          room_id: roomId,
          blocked_date: date,
          reason: reason,
          blocked_by: 'admin'
        })
        .select()
        .single();

      if (error) throw error;

      setBlockedDates(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error blocking date:', err);
      throw err;
    }
  };

  const unblockDate = async (blockedDateId: string) => {
    try {
      const { error } = await supabase
        .from('room_blocked_dates')
        .delete()
        .eq('id', blockedDateId);

      if (error) throw error;

      setBlockedDates(prev => prev.filter(bd => bd.id !== blockedDateId));
    } catch (err) {
      console.error('Error unblocking date:', err);
      throw err;
    }
  };

  const createBooking = async (bookingData: Omit<RoomBooking, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      setBookings(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating booking:', err);
      throw err;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: RoomBooking['status']) => {
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? data : booking
      ));
      return data;
    } catch (err) {
      console.error('Error updating booking status:', err);
      throw err;
    }
  };

  const checkRoomAvailability = async (roomId: string, checkInDate: string, checkOutDate: string) => {
    try {
      const { data, error } = await supabase
        .rpc('check_room_availability', {
          room_id_input: roomId,
          check_in_date_input: checkInDate,
          check_out_date_input: checkOutDate
        });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error checking room availability:', err);
      throw err;
    }
  };

  const getRoomAvailability = async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_room_availability', {
          start_date_input: startDate,
          end_date_input: endDate
        });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error getting room availability:', err);
      throw err;
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

  const getBookingsForRoom = (roomId: string) => {
    return bookings.filter(booking => booking.room_id === roomId);
  };

  const getBookingsForDateRange = (roomId: string, startDate: string, endDate: string) => {
    return bookings.filter(booking => 
      booking.room_id === roomId &&
      booking.status !== 'cancelled' &&
      (
        (startDate >= booking.check_in_date && startDate < booking.check_out_date) ||
        (endDate > booking.check_in_date && endDate <= booking.check_out_date) ||
        (startDate <= booking.check_in_date && endDate >= booking.check_out_date)
      )
    );
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchRooms(),
          fetchBlockedDates(),
          fetchBookings()
        ]);
      } catch (err) {
        console.error('Error loading room availability data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    rooms,
    blockedDates,
    bookings,
    loading,
    error,
    blockDate,
    unblockDate,
    createBooking,
    updateBookingStatus,
    checkRoomAvailability,
    getRoomAvailability,
    getBlockedDatesForRoom,
    isDateBlocked,
    getBlockedDateInfo,
    getBookingsForRoom,
    getBookingsForDateRange,
    refetch: () => {
      setLoading(true);
      Promise.all([
        fetchRooms(),
        fetchBlockedDates(),
        fetchBookings()
      ]).finally(() => setLoading(false));
    }
  };
};
