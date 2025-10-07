/*
  # Add Room Rates and Services to Main Menu

  This adds room rates and additional services items to the main menu
  (not room service exclusive, so they appear on the main page).
*/

-- Insert Room Rate Items (Main Menu - Not Room Service Only)
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url, room_service_only) VALUES
  (
    'Standard Queen Room',
    'Comfortable queen-sized bed room perfect for couples. Features air conditioning, private bathroom, and basic amenities. Ideal for a cozy stay in nature.',
    1180.00,
    'room-rates',
    false,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  ),
  (
    'Standard Double Room',
    'Spacious double bed room with two comfortable beds. Includes air conditioning, private bathroom, and essential amenities. Great for friends or family.',
    1200.00,
    'room-rates',
    false,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  ),
  (
    'Deluxe Queen Room',
    'Upgraded queen room with enhanced amenities and better views. Features premium bedding, larger bathroom, and additional comfort items.',
    1280.00,
    'room-rates',
    true,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  ),
  (
    'Deluxe Double Room',
    'Premium double room with superior amenities and scenic views. Includes upgraded bedding, spacious bathroom, and premium room features.',
    1300.00,
    'room-rates',
    true,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  ),
  (
    'Executive Deluxe Room',
    'Luxury accommodation with premium amenities and exclusive features. Perfect for special occasions or business travelers seeking comfort.',
    1380.00,
    'room-rates',
    true,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  ),
  (
    'Family Room',
    'Spacious family accommodation designed for 3 persons. Features multiple beds, family-friendly amenities, and extra space for comfort.',
    1500.00,
    'room-rates',
    true,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  ),
  (
    'Premier Room',
    'Luxury suite-style room for 4 persons. Features premium amenities, spacious layout, and exclusive access to resort facilities.',
    1880.00,
    'room-rates',
    true,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  ),
  (
    'Group Room',
    'Large accommodation perfect for groups of 6 persons. Features multiple beds, common area, and group-friendly amenities for extended stays.',
    2650.00,
    'room-rates',
    false,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  );

-- Insert Additional Services (Main Menu - Not Room Service Only)
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url, room_service_only) VALUES
  (
    'Extra Person/Child (Regular)',
    'Additional person or child accommodation per night. Includes basic amenities and bedding. Regular rate for adults and children over 120cm.',
    200.00,
    'additional-services',
    false,
    true,
    'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  ),
  (
    'Extra Person/Child (Infant)',
    'Special rate for infants or children shorter than 120cm. Includes basic amenities and bedding. 50% discount from regular rate.',
    100.00,
    'additional-services',
    false,
    true,
    'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  ),
  (
    'Extra Bed',
    'Additional bed setup for extra comfort. Includes mattress, bedding, and basic amenities. Perfect for accommodating additional guests.',
    350.00,
    'additional-services',
    false,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  ),
  (
    'Extra Towel or Blanket',
    'Additional towel or blanket per request. Fresh, clean linens for your comfort. Available upon request during your stay.',
    50.00,
    'additional-services',
    false,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  ),
  (
    'Extra Pillow',
    'Additional pillow for enhanced comfort. Soft, clean pillows available for use during your stay. Perfect for a good night''s sleep.',
    50.00,
    'additional-services',
    false,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  ),
  (
    'Extension Stay (Hourly)',
    'Room extension after standard checkout time of 12 noon. Charged per hour for late checkout convenience. Maximum until 5pm.',
    120.00,
    'additional-services',
    false,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  ),
  (
    'Extension Stay (Full Day)',
    'Full day extension after 5pm. Charged as one full day stay at the current room rate. Perfect for extended vacation stays.',
    0.00,
    'additional-services',
    false,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    false
  );
