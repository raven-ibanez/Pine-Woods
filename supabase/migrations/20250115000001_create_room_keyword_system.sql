/*
  # Create Room Keyword System for Food Menu Access

  1. New Tables
    - `rooms` - stores room information and keywords
    - `room_guests` - tracks current guests in rooms
    - `room_orders` - tracks food orders placed by room guests
    - `keyword_access_log` - logs keyword usage for security

  2. Features
    - Each room has a unique keyword to unlock food menu
    - Guests can place food orders using their room keyword
    - Order tracking and history per room
    - Security logging of keyword usage
    - Room status management (occupied/vacant)
*/

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number text UNIQUE NOT NULL,
  room_type text NOT NULL,
  keyword text UNIQUE NOT NULL,
  status text DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'maintenance')),
  max_guests integer DEFAULT 2,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create room_guests table
CREATE TABLE IF NOT EXISTS room_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  check_in_date timestamptz DEFAULT now(),
  check_out_date timestamptz,
  contact_number text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create room_orders table
CREATE TABLE IF NOT EXISTS room_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES room_guests(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
  special_instructions text,
  delivery_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create room_order_items table
CREATE TABLE IF NOT EXISTS room_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES room_orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  special_instructions text,
  created_at timestamptz DEFAULT now()
);

-- Create keyword_access_log table
CREATE TABLE IF NOT EXISTS keyword_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  access_type text NOT NULL CHECK (access_type IN ('menu_access', 'order_placed')),
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_access_log ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for keyword validation)
CREATE POLICY "Anyone can read rooms for keyword validation"
  ON rooms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read room_guests for validation"
  ON room_guests
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Anyone can create room orders"
  ON room_orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can create room order items"
  ON room_order_items
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can create keyword access logs"
  ON keyword_access_log
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for authenticated admin access
CREATE POLICY "Authenticated users can manage rooms"
  ON rooms
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage room guests"
  ON room_guests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage room orders"
  ON room_orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage room order items"
  ON room_order_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage keyword access logs"
  ON keyword_access_log
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_orders_updated_at
  BEFORE UPDATE ON room_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate room keyword
CREATE OR REPLACE FUNCTION validate_room_keyword(keyword_input text)
RETURNS TABLE (
  room_id uuid,
  room_number text,
  room_type text,
  is_valid boolean,
  guest_name text,
  check_in_date timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.room_number,
    r.room_type,
    (r.keyword = keyword_input AND r.status = 'occupied') as is_valid,
    rg.guest_name,
    rg.check_in_date
  FROM rooms r
  LEFT JOIN room_guests rg ON r.id = rg.room_id AND rg.is_active = true
  WHERE r.keyword = keyword_input;
END;
$$ LANGUAGE plpgsql;

-- Create function to log keyword access
CREATE OR REPLACE FUNCTION log_keyword_access(
  keyword_input text,
  access_type_input text,
  ip_address_input inet DEFAULT NULL,
  user_agent_input text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  room_id_found uuid;
  success_result boolean;
BEGIN
  -- Find room by keyword
  SELECT id INTO room_id_found
  FROM rooms
  WHERE keyword = keyword_input;
  
  -- Determine if access was successful
  success_result := (room_id_found IS NOT NULL);
  
  -- Log the access attempt
  INSERT INTO keyword_access_log (room_id, keyword, access_type, ip_address, user_agent, success)
  VALUES (room_id_found, keyword_input, access_type_input, ip_address_input, user_agent_input, success_result);
  
  RETURN success_result;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  order_num text;
  counter integer;
BEGIN
  -- Get current date in YYYYMMDD format
  order_num := to_char(now(), 'YYYYMMDD');
  
  -- Get count of orders today
  SELECT COALESCE(COUNT(*), 0) + 1 INTO counter
  FROM room_orders
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Format: YYYYMMDD-XXX (3 digit counter)
  order_num := order_num || '-' || LPAD(counter::text, 3, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Create function to place room order
CREATE OR REPLACE FUNCTION place_room_order(
  keyword_input text,
  guest_name_input text,
  contact_number_input text DEFAULT NULL,
  special_instructions_input text DEFAULT NULL
)
RETURNS TABLE (
  order_id uuid,
  order_number text,
  room_number text,
  success boolean,
  message text
) AS $$
DECLARE
  room_record record;
  guest_record record;
  new_order_id uuid;
  new_order_number text;
BEGIN
  -- Validate keyword and get room info
  SELECT * INTO room_record
  FROM validate_room_keyword(keyword_input);
  
  IF NOT room_record.is_valid THEN
    -- Log failed access
    PERFORM log_keyword_access(keyword_input, 'order_placed');
    
    RETURN QUERY SELECT 
      NULL::uuid as order_id,
      NULL::text as order_number,
      NULL::text as room_number,
      false as success,
      'Invalid keyword or room not occupied' as message;
    RETURN;
  END IF;
  
  -- Get or create guest record
  SELECT * INTO guest_record
  FROM room_guests
  WHERE room_id = room_record.room_id AND is_active = true
  LIMIT 1;
  
  -- Generate order number
  new_order_number := generate_order_number();
  
  -- Create order
  INSERT INTO room_orders (room_id, guest_id, order_number, total_amount, special_instructions)
  VALUES (
    room_record.room_id,
    guest_record.id,
    new_order_number,
    0.00, -- Will be calculated when items are added
    special_instructions_input
  )
  RETURNING id INTO new_order_id;
  
  -- Log successful access
  PERFORM log_keyword_access(keyword_input, 'order_placed');
  
  RETURN QUERY SELECT 
    new_order_id as order_id,
    new_order_number as order_number,
    room_record.room_number as room_number,
    true as success,
    'Order created successfully' as message;
END;
$$ LANGUAGE plpgsql;

-- Insert sample rooms with keywords
INSERT INTO rooms (room_number, room_type, keyword, status, max_guests) VALUES
  ('A101', 'Standard Queen', 'PINE101', 'occupied', 2),
  ('A102', 'Standard Double', 'WOODS102', 'occupied', 2),
  ('A103', 'Deluxe Queen', 'FOREST103', 'vacant', 2),
  ('A104', 'Deluxe Double', 'NATURE104', 'occupied', 2),
  ('A105', 'Executive Deluxe', 'CABIN105', 'occupied', 2),
  ('B201', 'Family Room', 'CAMP201', 'occupied', 3),
  ('B202', 'Premier Room', 'RESORT202', 'vacant', 4),
  ('B203', 'Group Room', 'LODGE203', 'occupied', 6),
  ('C301', 'Standard Queen', 'TREE301', 'occupied', 2),
  ('C302', 'Standard Double', 'LEAF302', 'vacant', 2);

-- Insert sample guests
INSERT INTO room_guests (room_id, guest_name, contact_number) VALUES
  ((SELECT id FROM rooms WHERE room_number = 'A101'), 'John Smith', '+639171234567'),
  ((SELECT id FROM rooms WHERE room_number = 'A102'), 'Maria Garcia', '+639181234567'),
  ((SELECT id FROM rooms WHERE room_number = 'A104'), 'David Johnson', '+639191234567'),
  ((SELECT id FROM rooms WHERE room_number = 'A105'), 'Sarah Wilson', '+639201234567'),
  ((SELECT id FROM rooms WHERE room_number = 'B201'), 'The Brown Family', '+639211234567'),
  ((SELECT id FROM rooms WHERE room_number = 'B203'), 'The Martinez Group', '+639221234567'),
  ((SELECT id FROM rooms WHERE room_number = 'C301'), 'Lisa Chen', '+639231234567');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_keyword ON rooms(keyword);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_guests_room_id ON room_guests(room_id);
CREATE INDEX IF NOT EXISTS idx_room_guests_active ON room_guests(is_active);
CREATE INDEX IF NOT EXISTS idx_room_orders_room_id ON room_orders(room_id);
CREATE INDEX IF NOT EXISTS idx_room_orders_status ON room_orders(status);
CREATE INDEX IF NOT EXISTS idx_keyword_access_log_room_id ON keyword_access_log(room_id);
CREATE INDEX IF NOT EXISTS idx_keyword_access_log_created_at ON keyword_access_log(created_at);
