import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useRoomServiceCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomServiceCategories = async () => {
    try {
      setLoading(true);
      
      // Fetch only room service categories (breakfast, lunch, dinner, snacks, beverages, desserts)
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .in('id', ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts'])
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;

      setCategories(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching room service categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch room service categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomServiceCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchRoomServiceCategories
  };
};
