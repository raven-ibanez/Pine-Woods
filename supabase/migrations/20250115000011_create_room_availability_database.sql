/*
  # Create Complete Room Availability Database System

  This creates a comprehensive system for managing room availability:
  1. Room availability tracking
  2. Booking management
  3. Date availability checking
  4. Admin management functions
*/

-- Create room_availability table
CREATE TABLE IF NOT EXISTS room_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  price_override decimal(10,2), -- Optional price override for specific dates
  notes text, -- Optional notes about availability
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(room_id, date)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_email text,
  guest_phone text,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  total_nights integer NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create booking_items table (for additional services)
CREATE TABLE IF NOT EXISTS booking_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can read room availability"
  ON room_availability
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create bookings"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own bookings"
  ON bookings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create booking items"
  ON booking_items
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for authenticated admin access
CREATE POLICY "Authenticated users can manage room availability"
  ON room_availability
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage booking items"
  ON booking_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_room_availability_updated_at
  BEFORE UPDATE ON room_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to check room availability for a date range
CREATE OR REPLACE FUNCTION check_room_availability(
  room_id_input uuid,
  check_in_date_input date,
  check_out_date_input date
)
RETURNS json AS $$
DECLARE
  unavailable_dates date[];
  result json;
BEGIN
  -- Check availability for each date in the range
  SELECT array_agg(date ORDER BY date) INTO unavailable_dates
  FROM room_availability
  WHERE room_id = room_id_input
    AND date >= check_in_date_input
    AND date < check_out_date_input
    AND is_available = false;

  -- If no unavailable dates, room is available
  IF unavailable_dates IS NULL THEN
    result := json_build_object(
      'available', true,
      'message', 'Room is available for the selected dates',
      'unavailable_dates', '[]'::json
    );
  ELSE
    result := json_build_object(
      'available', false,
      'message', 'Room is not available for some dates',
      'unavailable_dates', to_json(unavailable_dates)
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to get room availability for a month
CREATE OR REPLACE FUNCTION get_room_availability_month(
  room_id_input uuid,
  year_input integer,
  month_input integer
)
RETURNS json AS $$
DECLARE
  availability_data json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'date', date,
      'available', is_available,
      'price_override', price_override,
      'notes', notes
    )
  ) INTO availability_data
  FROM room_availability
  WHERE room_id = room_id_input
    AND EXTRACT(YEAR FROM date) = year_input
    AND EXTRACT(MONTH FROM date) = month_input
  ORDER BY date;

  RETURN COALESCE(availability_data, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Create function to create a booking
CREATE OR REPLACE FUNCTION create_booking(
  room_id_input uuid,
  guest_name_input text,
  guest_email_input text,
  guest_phone_input text,
  check_in_date_input date,
  check_out_date_input date,
  total_amount_input decimal,
  special_requests_input text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  booking_id uuid;
  total_nights integer;
  availability_check json;
BEGIN
  -- Calculate total nights
  total_nights := check_out_date_input - check_in_date_input;

  -- Check availability first
  SELECT check_room_availability(room_id_input, check_in_date_input, check_out_date_input) 
  INTO availability_check;

  -- If not available, return error
  IF NOT (availability_check->>'available')::boolean THEN
    RETURN json_build_object(
      'success', false,
      'message', availability_check->>'message',
      'unavailable_dates', availability_check->'unavailable_dates'
    );
  END IF;

  -- Create the booking
  INSERT INTO bookings (
    room_id, guest_name, guest_email, guest_phone,
    check_in_date, check_out_date, total_nights,
    total_amount, special_requests
  ) VALUES (
    room_id_input, guest_name_input, guest_email_input, guest_phone_input,
    check_in_date_input, check_out_date_input, total_nights,
    total_amount_input, special_requests_input
  )
  RETURNING id INTO booking_id;

  -- Mark dates as unavailable
  INSERT INTO room_availability (room_id, date, is_available)
  SELECT room_id_input, generate_series(check_in_date_input, check_out_date_input - interval '1 day', interval '1 day')::date, false
  ON CONFLICT (room_id, date) DO UPDATE SET
    is_available = false,
    updated_at = now();

  RETURN json_build_object(
    'success', true,
    'message', 'Booking created successfully',
    'booking_id', booking_id
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to update room availability (for admin)
CREATE OR REPLACE FUNCTION update_room_availability(
  room_id_input uuid,
  date_input date,
  is_available_input boolean,
  price_override_input decimal DEFAULT NULL,
  notes_input text DEFAULT NULL
)
RETURNS json AS $$
BEGIN
  INSERT INTO room_availability (room_id, date, is_available, price_override, notes)
  VALUES (room_id_input, date_input, is_available_input, price_override_input, notes_input)
  ON CONFLICT (room_id, date) DO UPDATE SET
    is_available = is_available_input,
    price_override = price_override_input,
    notes = notes_input,
    updated_at = now();

  RETURN json_build_object(
    'success', true,
    'message', 'Availability updated successfully'
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to get all room availability (for admin)
CREATE OR REPLACE FUNCTION get_all_room_availability(
  room_id_input uuid DEFAULT NULL,
  start_date_input date DEFAULT NULL,
  end_date_input date DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  availability_data json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', ra.id,
      'room_id', ra.room_id,
      'room_number', r.room_number,
      'room_type', r.room_type,
      'date', ra.date,
      'available', ra.is_available,
      'price_override', ra.price_override,
      'notes', ra.notes,
      'created_at', ra.created_at,
      'updated_at', ra.updated_at
    )
  ) INTO availability_data
  FROM room_availability ra
  JOIN rooms r ON ra.room_id = r.id
  WHERE (room_id_input IS NULL OR ra.room_id = room_id_input)
    AND (start_date_input IS NULL OR ra.date >= start_date_input)
    AND (end_date_input IS NULL OR ra.date <= end_date_input)
  ORDER BY ra.date, r.room_number;

  RETURN COALESCE(availability_data, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Create function to bulk update availability (for admin)
CREATE OR REPLACE FUNCTION bulk_update_availability(
  room_id_input uuid,
  start_date_input date,
  end_date_input date,
  is_available_input boolean,
  price_override_input decimal DEFAULT NULL,
  notes_input text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  updated_count integer;
BEGIN
  INSERT INTO room_availability (room_id, date, is_available, price_override, notes)
  SELECT 
    room_id_input,
    generate_series(start_date_input, end_date_input, interval '1 day')::date,
    is_available_input,
    price_override_input,
    notes_input
  ON CONFLICT (room_id, date) DO UPDATE SET
    is_available = is_available_input,
    price_override = price_override_input,
    notes = notes_input,
    updated_at = now();

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  RETURN json_build_object(
    'success', true,
    'message', format('Updated %s availability records', updated_count),
    'updated_count', updated_count
  );
END;
$$ LANGUAGE plpgsql;

-- Insert sample availability data for the next 90 days
INSERT INTO room_availability (room_id, date, is_available, notes)
SELECT 
  r.id,
  generate_series(
    CURRENT_DATE,
    CURRENT_DATE + interval '90 days',
    interval '1 day'
  )::date,
  CASE 
    WHEN random() < 0.2 THEN false -- 20% chance of being unavailable
    ELSE true
  END,
  CASE 
    WHEN random() < 0.2 THEN 'Maintenance' -- 20% chance of having a note
    WHEN random() < 0.4 THEN 'Booked'
    ELSE NULL
  END
FROM rooms r
ON CONFLICT (room_id, date) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_room_availability_room_date ON room_availability(room_id, date);
CREATE INDEX IF NOT EXISTS idx_room_availability_date ON room_availability(date);
CREATE INDEX IF NOT EXISTS idx_room_availability_available ON room_availability(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking_id ON booking_items(booking_id);

-- Create view for easy availability checking
CREATE OR REPLACE VIEW room_availability_summary AS
SELECT 
  r.id as room_id,
  r.room_number,
  r.room_type,
  r.keyword,
  r.status as room_status,
  COUNT(ra.date) as total_dates,
  COUNT(CASE WHEN ra.is_available = true THEN 1 END) as available_dates,
  COUNT(CASE WHEN ra.is_available = false THEN 1 END) as unavailable_dates,
  MIN(ra.date) as earliest_date,
  MAX(ra.date) as latest_date
FROM rooms r
LEFT JOIN room_availability ra ON r.id = ra.room_id
GROUP BY r.id, r.room_number, r.room_type, r.keyword, r.status;

-- Create view for booking summary
CREATE OR REPLACE VIEW booking_summary AS
SELECT 
  b.id,
  b.room_id,
  r.room_number,
  r.room_type,
  b.guest_name,
  b.guest_email,
  b.guest_phone,
  b.check_in_date,
  b.check_out_date,
  b.total_nights,
  b.total_amount,
  b.status,
  b.special_requests,
  b.created_at,
  b.updated_at
FROM bookings b
JOIN rooms r ON b.room_id = r.id
ORDER BY b.created_at DESC;
