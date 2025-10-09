/*
  # Create Room Availability Management System

  1. New Tables
    - `rooms` - Room definitions with rates and details
    - `room_blocked_dates` - Blocked/unavailable dates for each room
    - `room_bookings` - Actual bookings for rooms

  2. Features
    - Room management with different types and rates
    - Date blocking system for maintenance or unavailability
    - Booking tracking system
    - Admin interface for managing availability
*/

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  room_type text NOT NULL, -- 'standard', 'deluxe', 'executive', 'family', 'premier', 'group'
  base_price decimal(10,2) NOT NULL,
  max_guests integer DEFAULT 2,
  amenities text[] DEFAULT '{}',
  image_url text,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add name column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'name') THEN
        ALTER TABLE rooms ADD COLUMN name text;
    END IF;
END $$;

-- Create room blocked dates table
CREATE TABLE IF NOT EXISTS room_blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  reason text, -- 'maintenance', 'booking', 'unavailable', etc.
  blocked_by text DEFAULT 'admin', -- 'admin', 'system', 'booking'
  created_at timestamptz DEFAULT now(),
  UNIQUE(room_id, blocked_date)
);

-- Create room bookings table
CREATE TABLE IF NOT EXISTS room_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_contact text NOT NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  total_price decimal(10,2) NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  payment_method text,
  payment_reference text,
  special_requests text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Public can view blocked dates" ON room_blocked_dates FOR SELECT USING (true);
CREATE POLICY "Public can view bookings" ON room_bookings FOR SELECT USING (true);

-- Create policies for admin access (authenticated users)
CREATE POLICY "Admin can manage rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Admin can manage blocked dates" ON room_blocked_dates FOR ALL USING (true);
CREATE POLICY "Admin can manage bookings" ON room_bookings FOR ALL USING (true);

-- Insert sample room data
INSERT INTO rooms (name, description, room_type, base_price, max_guests, amenities, image_url) VALUES
  ('Molave Room', 'Comfortable standard room with queen bed, perfect for couples or small families. Features air conditioning, private bathroom, and forest view.', 'standard', 6999.00, 2, ARRAY['Air Conditioning', 'Private Bathroom', 'Forest View', 'WiFi', 'TV'], 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  ('Narra Room', 'Spacious deluxe room with double bed, ideal for families. Includes air conditioning, private bathroom, and balcony with mountain view.', 'deluxe', 8999.00, 4, ARRAY['Air Conditioning', 'Private Bathroom', 'Mountain View', 'Balcony', 'WiFi', 'TV', 'Mini Fridge'], 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  ('Mahogany Suite', 'Premium executive suite with separate living area and bedroom. Perfect for business travelers or special occasions.', 'executive', 12999.00, 4, ARRAY['Air Conditioning', 'Private Bathroom', 'Living Area', 'Kitchenette', 'Ocean View', 'WiFi', 'TV', 'Mini Bar'], 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  ('Family Cabin', 'Large family accommodation with multiple bedrooms and shared living space. Great for groups and extended families.', 'family', 15999.00, 8, ARRAY['Air Conditioning', 'Multiple Bedrooms', 'Shared Living Area', 'Kitchen', 'Garden View', 'WiFi', 'TV', 'Dining Area'], 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  ('Premier Villa', 'Luxury villa with private pool and premium amenities. The ultimate accommodation for special occasions.', 'premier', 24999.00, 6, ARRAY['Private Pool', 'Air Conditioning', 'Multiple Bedrooms', 'Full Kitchen', 'Ocean View', 'WiFi', 'TV', 'Premium Amenities'], 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  ('Group Lodge', 'Large group accommodation perfect for events, retreats, or large families. Can accommodate up to 12 guests.', 'group', 19999.00, 12, ARRAY['Air Conditioning', 'Multiple Rooms', 'Shared Kitchen', 'Event Space', 'Garden View', 'WiFi', 'TV', 'Dining Hall'], 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_room_blocked_dates_room_id ON room_blocked_dates(room_id);
CREATE INDEX IF NOT EXISTS idx_room_blocked_dates_date ON room_blocked_dates(blocked_date);
CREATE INDEX IF NOT EXISTS idx_room_bookings_room_id ON room_bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_room_bookings_dates ON room_bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(available);

-- Create function to check room availability
CREATE OR REPLACE FUNCTION check_room_availability(
  room_id_input uuid,
  check_in_date_input date,
  check_out_date_input date
)
RETURNS boolean AS $$
DECLARE
  blocked_count integer;
  booking_count integer;
BEGIN
  -- Check for blocked dates in the range
  SELECT COUNT(*) INTO blocked_count
  FROM room_blocked_dates
  WHERE room_id = room_id_input
    AND blocked_date >= check_in_date_input
    AND blocked_date < check_out_date_input;
  
  -- Check for existing bookings that overlap
  SELECT COUNT(*) INTO booking_count
  FROM room_bookings
  WHERE room_id = room_id_input
    AND status IN ('confirmed', 'pending')
    AND (
      (check_in_date_input >= check_in_date AND check_in_date_input < check_out_date) OR
      (check_out_date_input > check_in_date AND check_out_date_input <= check_out_date) OR
      (check_in_date_input <= check_in_date AND check_out_date_input >= check_out_date)
    );
  
  -- Room is available if no blocked dates and no overlapping bookings
  RETURN (blocked_count = 0 AND booking_count = 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to get room availability for a date range
CREATE OR REPLACE FUNCTION get_room_availability(
  start_date_input date,
  end_date_input date
)
RETURNS TABLE(
  room_id uuid,
  room_name text,
  room_type text,
  base_price decimal,
  max_guests integer,
  available boolean,
  blocked_dates date[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.room_type,
    r.base_price,
    r.max_guests,
    r.available,
    ARRAY(
      SELECT bd.blocked_date 
      FROM room_blocked_dates bd 
      WHERE bd.room_id = r.id 
        AND bd.blocked_date >= start_date_input 
        AND bd.blocked_date < end_date_input
    ) as blocked_dates
  FROM rooms r
  WHERE r.available = true
  ORDER BY r.room_type, r.base_price;
END;
$$ LANGUAGE plpgsql;
