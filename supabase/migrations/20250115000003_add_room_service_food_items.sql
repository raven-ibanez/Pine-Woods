/*
  # Add Food Items for Room Service

  This adds placeholder food items that will be available in the room service section
  after guests enter their correct room keyword.
*/

-- First, ensure we have food categories
INSERT INTO categories (id, name, icon, sort_order, active) VALUES
  ('breakfast', 'Breakfast', '🥞', 1, true),
  ('lunch', 'Lunch', '🍽️', 2, true),
  ('dinner', 'Dinner', '🍖', 3, true),
  ('snacks', 'Snacks & Appetizers', '🍟', 4, true),
  ('beverages', 'Beverages', '🥤', 5, true),
  ('desserts', 'Desserts', '🍰', 6, true)
ON CONFLICT (id) DO NOTHING;

-- Insert Breakfast Items (Room Service Only)
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url, room_service_only) VALUES
  (
    'Continental Breakfast',
    'Fresh croissants, butter, jam, orange juice, and coffee. Perfect start to your day in nature.',
    250.00,
    'breakfast',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    true
  ),
  (
    'Pine Woods Special Pancakes',
    'Fluffy pancakes with maple syrup, fresh berries, and whipped cream. Served with bacon or sausage.',
    320.00,
    'breakfast',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    true
  ),
  (
    'Forest Omelette',
    'Three-egg omelette with mushrooms, cheese, and herbs. Served with toast and hash browns.',
    280.00,
    'breakfast',
    false,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    true
  ),
  (
    'Campsite Breakfast Burrito',
    'Scrambled eggs, cheese, bacon, and potatoes wrapped in a warm tortilla. Served with salsa.',
    290.00,
    'breakfast',
    false,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    true
  );

-- Insert Lunch Items (Room Service Only)
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url, room_service_only) VALUES
  (
    'Grilled Chicken Caesar Salad',
    'Fresh romaine lettuce, grilled chicken breast, parmesan cheese, croutons, and Caesar dressing.',
    380.00,
    'lunch',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Beach Club Sandwich',
    'Triple-decker sandwich with turkey, bacon, lettuce, tomato, and mayo. Served with fries.',
    420.00,
    'lunch',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Woods Burger',
    'Juicy beef patty with cheese, lettuce, tomato, and special sauce. Served with crispy fries.',
    450.00,
    'lunch',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Fresh Fish Tacos',
    'Grilled fish with cabbage slaw, pico de gallo, and lime. Served with rice and beans.',
    390.00,
    'lunch',
    false,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  );

-- Insert Dinner Items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  (
    'Grilled Salmon',
    'Fresh Atlantic salmon grilled to perfection with lemon butter sauce. Served with vegetables and rice.',
    650.00,
    'dinner',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Ribeye Steak',
    '12oz ribeye steak cooked to your preference. Served with mashed potatoes and seasonal vegetables.',
    750.00,
    'dinner',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Pasta Primavera',
    'Fresh pasta with seasonal vegetables in a light cream sauce. Vegetarian option available.',
    480.00,
    'dinner',
    false,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Chicken Parmesan',
    'Breaded chicken breast with marinara sauce and melted mozzarella. Served with pasta.',
    520.00,
    'dinner',
    false,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  );

-- Insert Snacks & Appetizers
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  (
    'Nachos Supreme',
    'Crispy tortilla chips topped with cheese, jalapeños, sour cream, and guacamole.',
    280.00,
    'snacks',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Buffalo Wings',
    'Spicy buffalo wings served with celery sticks and blue cheese dip.',
    320.00,
    'snacks',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Mozzarella Sticks',
    'Golden fried mozzarella sticks served with marinara sauce.',
    250.00,
    'snacks',
    false,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Garlic Bread',
    'Fresh baked bread with garlic butter and herbs.',
    180.00,
    'snacks',
    false,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  );

-- Insert Beverages
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  (
    'Fresh Orange Juice',
    'Freshly squeezed orange juice, perfect for breakfast or any time of day.',
    120.00,
    'beverages',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Iced Coffee',
    'Cold brew coffee served over ice with cream and sugar on the side.',
    150.00,
    'beverages',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Soft Drinks',
    'Coca-Cola, Sprite, or Pepsi. Available in regular or diet.',
    80.00,
    'beverages',
    false,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Bottled Water',
    'Pure spring water, perfect for staying hydrated during your stay.',
    60.00,
    'beverages',
    false,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  );

-- Insert Desserts
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  (
    'Chocolate Lava Cake',
    'Warm chocolate cake with a molten center, served with vanilla ice cream.',
    280.00,
    'desserts',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'New York Cheesecake',
    'Classic New York style cheesecake with berry compote.',
    250.00,
    'desserts',
    true,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Ice Cream Sundae',
    'Vanilla ice cream with hot fudge, whipped cream, and a cherry on top.',
    200.00,
    'desserts',
    false,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ),
  (
    'Fresh Fruit Plate',
    'Seasonal fresh fruits arranged beautifully. Healthy and refreshing.',
    180.00,
    'desserts',
    false,
    true,
    'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  );
