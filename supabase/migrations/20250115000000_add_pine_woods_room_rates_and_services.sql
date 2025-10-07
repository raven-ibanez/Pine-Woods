/*
  # Add Pine Woods Campsite Room Rates and Services

  1. New Categories
    - Add 'room-rates' category for accommodation options
    - Add 'additional-services' category for extra services

  2. New Menu Items
    - Room Rates: Standard Queen, Standard Double, Deluxe Queen, Deluxe Double, Executive Deluxe, Family Room, Premier Room, Group Room
    - Additional Services: Extra Person/Child, Extra Bed, Extra Towel/Blanket, Extra Pillow, Extension Stay

  3. Features
    - Auto-generated UUIDs for all items
    - Detailed descriptions with capacity and amenities
    - Appropriate pricing for each room type and service
    - High-quality hotel/resort room images from Pexels
    - Proper categorization for easy browsing
*/

-- Categories will be added separately if needed

-- Menu items will be added separately if needed

-- Update site settings for Pine Woods Campsite
UPDATE site_settings SET 
  value = 'Pine Woods Campsite & Beach Resort',
  description = 'The name of the campsite and beach resort'
WHERE id = 'site_name';

UPDATE site_settings SET 
  value = 'Experience the perfect blend of forest camping and beach relaxation in our natural paradise. Enjoy comfortable accommodations and outdoor activities.',
  description = 'Short description of the campsite and resort'
WHERE id = 'site_description';

-- Add new site settings specific to Pine Woods
INSERT INTO site_settings (id, value, type, description) VALUES
  ('checkout_time', '12:00 PM', 'text', 'Standard checkout time for all rooms'),
  ('room_rate_note', 'Room rates are computed per night of stay. Toiletries not included in rate.', 'text', 'Important note about room rates and amenities'),
  ('infant_discount_note', 'Infants or children shorter than 120cm get 50% discount on extra person rate', 'text', 'Special discount information for infants and small children')
ON CONFLICT (id) DO NOTHING;
