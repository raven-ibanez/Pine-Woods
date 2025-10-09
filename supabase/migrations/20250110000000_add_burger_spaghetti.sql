/*
  # Add Burger and Spaghetti to Food Menu

  1. New Category
    - 'food' category for general food items

  2. New Menu Items
    - Burger (50 pesos)
    - Spaghetti (100 pesos)

  3. Features
    - Both items under 'food' category
    - Available for immediate ordering
    - Set as popular items for visibility
*/

-- First, ensure the 'food' category exists
INSERT INTO categories (id, name, icon, sort_order, active) VALUES
  ('food', 'Food', '🍽️', 5, true)
ON CONFLICT (id) DO NOTHING;

-- Insert Burger and Spaghetti items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Burger', 'Delicious burger with fresh ingredients', 50, 'food', true, true, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800'),
  ('Spaghetti', 'Classic spaghetti with savory sauce', 100, 'food', true, true, 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800');

