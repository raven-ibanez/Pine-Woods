-- Debug query to check room service items
-- Run this in your Supabase SQL Editor

-- Check if room_service_only column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'menu_items' AND column_name = 'room_service_only';

-- Check all menu items and their room_service_only status
SELECT id, name, category, room_service_only, available 
FROM menu_items 
ORDER BY room_service_only DESC, category, name;

-- Check specifically for room service items
SELECT id, name, category, room_service_only, available 
FROM menu_items 
WHERE room_service_only = true;

-- Check categories
SELECT id, name, icon, active 
FROM categories 
WHERE id IN ('breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts');
