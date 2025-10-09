import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Room, BlockedDate } from '../types';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log('Supabase not configured, using empty rooms list');
        setRooms([]);
        setError(null);
        return;
      }
      
      // Fetch rooms and blocked dates in parallel
      const [roomsResult, blockedDatesResult] = await Promise.all([
        supabase
          .from('rooms')
          .select('*')
          .eq('available', true)
          .order('base_price', { ascending: true }),
        supabase
          .from('room_blocked_dates')
          .select('*')
          .gte('blocked_date', new Date().toISOString().split('T')[0])
          .order('blocked_date', { ascending: true })
      ]);

      if (roomsResult.error) throw roomsResult.error;
      if (blockedDatesResult.error) throw blockedDatesResult.error;

      const formattedRooms: Room[] = roomsResult.data?.map(room => ({
        id: room.id,
        name: room.name,
        description: room.description,
        room_type: room.room_type,
        base_price: room.base_price,
        max_guests: room.max_guests,
        amenities: room.amenities || [],
        image_url: room.image_url,
        available: room.available,
        created_at: room.created_at,
        updated_at: room.updated_at
      })) || [];

      setRooms(formattedRooms);
      setBlockedDates(blockedDatesResult.data || []);
      console.log('Fetched rooms:', formattedRooms);
      console.log('Fetched blocked dates:', blockedDatesResult.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Helper function to get blocked dates for a specific room
  const getBlockedDatesForRoom = (roomId: string) => {
    return blockedDates
      .filter(bd => bd.room_id === roomId)
      .map(bd => bd.blocked_date);
  };

  // Helper function to check if a room has blocked dates
  const hasBlockedDates = (roomId: string) => {
    return blockedDates.some(bd => bd.room_id === roomId);
  };

  // Helper function to get the next blocked date for a room
  const getNextBlockedDate = (roomId: string) => {
    const roomBlockedDates = blockedDates
      .filter(bd => bd.room_id === roomId)
      .sort((a, b) => new Date(a.blocked_date).getTime() - new Date(b.blocked_date).getTime());
    
    return roomBlockedDates.length > 0 ? roomBlockedDates[0].blocked_date : null;
  };

  return {
    rooms,
    blockedDates,
    loading,
    error,
    getBlockedDatesForRoom,
    hasBlockedDates,
    getNextBlockedDate,
    refetch: fetchRooms
  };
};
