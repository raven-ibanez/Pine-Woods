import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface RoomOrderItem {
  item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
}

export interface RoomOrder {
  order_id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  delivery_time?: string;
  special_instructions?: string;
  items: RoomOrderItem[];
}

export interface RoomInfo {
  room_number: string;
  room_type: string;
  guest_name: string;
  check_in_date: string;
}

export const useRoomOrders = () => {
  const [currentRoom, setCurrentRoom] = useState<RoomInfo | null>(null);
  const [currentOrder, setCurrentOrder] = useState<RoomOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlockMenu = async (keyword: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase.rpc('unlock_food_menu', {
        keyword_input: keyword.trim().toUpperCase()
      });

      if (rpcError) {
        setError('Error validating keyword. Please try again.');
        return false;
      }

      if (data.success) {
        setCurrentRoom(data.room_info);
        await loadCurrentOrder(keyword);
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentOrder = async (keyword: string) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('get_current_room_order', {
        keyword_input: keyword.trim().toUpperCase()
      });

      if (rpcError) {
        console.error('Error loading current order:', rpcError);
        return;
      }

      if (data.success && data.order) {
        setCurrentOrder({
          ...data.order,
          items: data.items || []
        });
      } else {
        setCurrentOrder(null);
      }
    } catch (err) {
      console.error('Error loading current order:', err);
    }
  };

  const addItemToOrder = async (keyword: string, menuItemId: string, quantity: number = 1, specialInstructions?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('add_item_to_room_order', {
        keyword_input: keyword.trim().toUpperCase(),
        menu_item_id_input: menuItemId,
        quantity_input: quantity,
        special_instructions_input: specialInstructions || null
      });

      if (rpcError) {
        setError('Error adding item to order. Please try again.');
        return false;
      }

      if (data.success) {
        await loadCurrentOrder(keyword);
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitOrder = async (keyword: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('submit_room_order', {
        keyword_input: keyword.trim().toUpperCase()
      });

      if (rpcError) {
        setError('Error submitting order. Please try again.');
        return false;
      }

      if (data.success) {
        setCurrentOrder(null); // Clear current order after submission
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getOrderHistory = async (keyword: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_room_order_history', {
        keyword_input: keyword.trim().toUpperCase()
      });

      if (rpcError) {
        setError('Error loading order history. Please try again.');
        return null;
      }

      if (data.success) {
        return data.orders;
      } else {
        setError(data.message);
        return null;
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearRoom = () => {
    setCurrentRoom(null);
    setCurrentOrder(null);
    setError(null);
  };

  const getTotalItems = () => {
    if (!currentOrder?.items) return 0;
    return currentOrder.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    if (!currentOrder) return 0;
    return currentOrder.total_amount;
  };

  return {
    currentRoom,
    currentOrder,
    loading,
    error,
    unlockMenu,
    addItemToOrder,
    submitOrder,
    getOrderHistory,
    clearRoom,
    getTotalItems,
    getTotalPrice,
    loadCurrentOrder
  };
};
