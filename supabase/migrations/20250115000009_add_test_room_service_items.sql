/*
  # Add Test Room Service Items

  Simple test to add a few room service items for debugging
*/

-- Ensure room_service_only column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'room_service_only'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN room_service_only boolean DEFAULT false;
  END IF;
END $$;

-- Add test breakfast item
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url, room_service_only) VALUES
  (
    'Test Breakfast Item',
    'This is a test breakfast item for room service.',
    250.00,
    'breakfast',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    true
  )
ON CONFLICT DO NOTHING;

-- Add test lunch item
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url, room_service_only) VALUES
  (
    'Test Lunch Item',
    'This is a test lunch item for room service.',
    350.00,
    'lunch',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    true
  )
ON CONFLICT DO NOTHING;
