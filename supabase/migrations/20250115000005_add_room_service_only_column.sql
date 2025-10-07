/*
  # Add Room Service Only Column

  This adds a column to mark menu items as room service exclusive,
  so they won't appear on the main menu page.
*/

-- Add room_service_only column to menu_items table
DO $$
BEGIN
  -- Add room_service_only column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'room_service_only'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN room_service_only boolean DEFAULT false;
  END IF;
END $$;

-- Update existing room service food items to be room service only
UPDATE menu_items 
SET room_service_only = true 
WHERE category IN ('breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_room_service_only ON menu_items(room_service_only);
