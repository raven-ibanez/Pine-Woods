/*
  # Add Room Rates and Additional Services Categories

  This adds the room rates and additional services categories to the main menu,
  separate from the room service food categories.
*/

-- Add room rates and additional services categories for main menu
INSERT INTO categories (id, name, icon, sort_order, active) VALUES
  ('room-rates', 'Room Rates', '🏨', 1, true),
  ('additional-services', 'Additional Services', '🛎️', 2, true)
ON CONFLICT (id) DO NOTHING;
