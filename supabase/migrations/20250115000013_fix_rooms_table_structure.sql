/*
  # Fix Rooms Table Structure

  This migration fixes the rooms table structure to ensure it has all required columns
  and then inserts the sample room data.
*/

-- First, let's check if the rooms table exists and what columns it has
-- If it doesn't exist, create it with all columns
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number text,
  room_type text NOT NULL,
  keyword text NOT NULL,
  name text NOT NULL,
  description text,
  status text DEFAULT 'vacant',
  base_price decimal(10,2) NOT NULL,
  max_guests integer DEFAULT 2,
  amenities text[] DEFAULT '{}',
  image_url text,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add room_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'room_number') THEN
        ALTER TABLE rooms ADD COLUMN room_number text;
    END IF;
    
    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'name') THEN
        ALTER TABLE rooms ADD COLUMN name text;
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'description') THEN
        ALTER TABLE rooms ADD COLUMN description text;
    END IF;
    
    -- Add room_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'room_type') THEN
        ALTER TABLE rooms ADD COLUMN room_type text;
    END IF;
    
    -- Add keyword column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'keyword') THEN
        ALTER TABLE rooms ADD COLUMN keyword text;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'status') THEN
        ALTER TABLE rooms ADD COLUMN status text DEFAULT 'vacant';
    END IF;
    
    -- Add base_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'base_price') THEN
        ALTER TABLE rooms ADD COLUMN base_price decimal(10,2);
    END IF;
    
    -- Add max_guests column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'max_guests') THEN
        ALTER TABLE rooms ADD COLUMN max_guests integer DEFAULT 2;
    END IF;
    
    -- Add amenities column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'amenities') THEN
        ALTER TABLE rooms ADD COLUMN amenities text[] DEFAULT '{}';
    END IF;
    
    -- Add image_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'image_url') THEN
        ALTER TABLE rooms ADD COLUMN image_url text;
    END IF;
    
    -- Add available column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'available') THEN
        ALTER TABLE rooms ADD COLUMN available boolean DEFAULT true;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'created_at') THEN
        ALTER TABLE rooms ADD COLUMN created_at timestamptz DEFAULT now();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'updated_at') THEN
        ALTER TABLE rooms ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Clear any existing data to avoid conflicts
DELETE FROM rooms;

-- Insert sample room data
INSERT INTO rooms (room_number, room_type, keyword, name, description, status, base_price, max_guests, amenities, image_url) VALUES
  ('MOL-001', 'standard', 'MOLAVE101', 'Molave Room', 'Comfortable standard room with queen bed, perfect for couples or small families. Features air conditioning, private bathroom, and forest view.', 'vacant', 6999.00, 2, ARRAY['Air Conditioning', 'Private Bathroom', 'Forest View', 'WiFi', 'TV'], 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  ('NAR-001', 'deluxe', 'NARRA101', 'Narra Room', 'Spacious deluxe room with double bed, ideal for families. Includes air conditioning, private bathroom, and balcony with mountain view.', 'vacant', 8999.00, 4, ARRAY['Air Conditioning', 'Private Bathroom', 'Mountain View', 'Balcony', 'WiFi', 'TV', 'Mini Fridge'], 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  ('MAH-001', 'executive', 'MAHOGANY101', 'Mahogany Suite', 'Premium executive suite with separate living area and bedroom. Perfect for business travelers or special occasions.', 'vacant', 12999.00, 4, ARRAY['Air Conditioning', 'Private Bathroom', 'Living Area', 'Kitchenette', 'Ocean View', 'WiFi', 'TV', 'Mini Bar'], 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  ('FAM-001', 'family', 'FAMILY101', 'Family Cabin', 'Large family accommodation with multiple bedrooms and shared living space. Great for groups and extended families.', 'vacant', 15999.00, 8, ARRAY['Air Conditioning', 'Multiple Bedrooms', 'Shared Living Area', 'Kitchen', 'Garden View', 'WiFi', 'TV', 'Dining Area'], 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  ('PRE-001', 'premier', 'PREMIER101', 'Premier Villa', 'Luxury villa with private pool and premium amenities. The ultimate accommodation for special occasions.', 'vacant', 24999.00, 6, ARRAY['Private Pool', 'Air Conditioning', 'Multiple Bedrooms', 'Full Kitchen', 'Ocean View', 'WiFi', 'TV', 'Premium Amenities'], 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  ('GRP-001', 'group', 'GROUP101', 'Group Lodge', 'Large group accommodation perfect for events, retreats, or large families. Can accommodate up to 12 guests.', 'vacant', 19999.00, 12, ARRAY['Air Conditioning', 'Multiple Rooms', 'Shared Kitchen', 'Event Space', 'Garden View', 'WiFi', 'TV', 'Dining Hall'], 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Create room blocked dates table if it doesn't exist
CREATE TABLE IF NOT EXISTS room_blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  reason text,
  blocked_by text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  UNIQUE(room_id, blocked_date)
);

-- Create room bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS room_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_contact text NOT NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  total_price decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_room_blocked_dates_room_id ON room_blocked_dates(room_id);
CREATE INDEX IF NOT EXISTS idx_room_blocked_dates_date ON room_blocked_dates(blocked_date);
CREATE INDEX IF NOT EXISTS idx_room_bookings_room_id ON room_bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_room_bookings_dates ON room_bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(available);
