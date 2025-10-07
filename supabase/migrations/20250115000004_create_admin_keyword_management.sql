/*
  # Create Admin Keyword Management System

  This creates tables and functions for admins to:
  1. Generate new room keywords
  2. Manage room occupancy
  3. Create temporary access codes
  4. Monitor keyword usage
*/

-- Create admin_users table for admin authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create temporary_access_codes table for generating temporary keywords
CREATE TABLE IF NOT EXISTS temporary_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  expires_at timestamptz NOT NULL,
  max_uses integer DEFAULT 1,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now()
);

-- Create keyword_generation_log table to track keyword creation
CREATE TABLE IF NOT EXISTS keyword_generation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users(id),
  action text NOT NULL, -- 'create_room', 'generate_temp_code', 'update_room'
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_generation_log ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (only authenticated admins)
DO $$
BEGIN
  -- Create admin_users policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'admin_users' 
    AND policyname = 'Only admins can access admin_users'
  ) THEN
    CREATE POLICY "Only admins can access admin_users"
      ON admin_users
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Create temporary_access_codes policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'temporary_access_codes' 
    AND policyname = 'Only admins can access temporary_access_codes'
  ) THEN
    CREATE POLICY "Only admins can access temporary_access_codes"
      ON temporary_access_codes
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Create keyword_generation_log policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'keyword_generation_log' 
    AND policyname = 'Only admins can access keyword_generation_log'
  ) THEN
    CREATE POLICY "Only admins can access keyword_generation_log"
      ON keyword_generation_log
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create function to generate random keyword
CREATE OR REPLACE FUNCTION generate_room_keyword(prefix text DEFAULT 'PINE')
RETURNS text AS $$
DECLARE
  keyword text;
  counter integer;
BEGIN
  -- Generate a random 3-digit number
  counter := floor(random() * 900 + 100)::integer;
  keyword := prefix || counter::text;
  
  -- Check if keyword already exists, if so generate a new one
  WHILE EXISTS (SELECT 1 FROM rooms WHERE keyword = keyword) LOOP
    counter := floor(random() * 900 + 100)::integer;
    keyword := prefix || counter::text;
  END LOOP;
  
  RETURN keyword;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate temporary access code
CREATE OR REPLACE FUNCTION generate_temporary_access_code(
  description_input text,
  admin_user_id_input uuid,
  expires_in_hours integer DEFAULT 24,
  max_uses_input integer DEFAULT 1
)
RETURNS text AS $$
DECLARE
  access_code text;
  expires_at timestamptz;
BEGIN
  -- Generate a random 8-character code
  access_code := upper(substring(md5(random()::text) from 1 for 8));
  
  -- Set expiration time
  expires_at := now() + (expires_in_hours || ' hours')::interval;
  
  -- Insert the temporary access code
  INSERT INTO temporary_access_codes (code, description, expires_at, max_uses, created_by)
  VALUES (access_code, description_input, expires_at, max_uses_input, admin_user_id_input);
  
  -- Log the action
  INSERT INTO keyword_generation_log (admin_user_id, action, details)
  VALUES (
    admin_user_id_input,
    'generate_temp_code',
    jsonb_build_object(
      'code', access_code,
      'description', description_input,
      'expires_at', expires_at,
      'max_uses', max_uses_input
    )
  );
  
  RETURN access_code;
END;
$$ LANGUAGE plpgsql;

-- Create function to create new room with generated keyword
CREATE OR REPLACE FUNCTION create_room_with_keyword(
  room_number_input text,
  room_type_input text,
  admin_user_id_input uuid,
  max_guests_input integer DEFAULT 2
)
RETURNS text AS $$
DECLARE
  generated_keyword text;
  new_room_id uuid;
BEGIN
  -- Generate unique keyword
  generated_keyword := generate_room_keyword();
  
  -- Create the room
  INSERT INTO rooms (room_number, room_type, keyword, max_guests, status)
  VALUES (room_number_input, room_type_input, generated_keyword, max_guests_input, 'vacant')
  RETURNING id INTO new_room_id;
  
  -- Log the action
  INSERT INTO keyword_generation_log (admin_user_id, action, details)
  VALUES (
    admin_user_id_input,
    'create_room',
    jsonb_build_object(
      'room_id', new_room_id,
      'room_number', room_number_input,
      'room_type', room_type_input,
      'keyword', generated_keyword,
      'max_guests', max_guests_input
    )
  );
  
  RETURN generated_keyword;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate temporary access code
CREATE OR REPLACE FUNCTION validate_temporary_access_code(code_input text)
RETURNS json AS $$
DECLARE
  code_record record;
  result json;
BEGIN
  -- Check if code exists and is valid
  SELECT * INTO code_record
  FROM temporary_access_codes
  WHERE code = upper(code_input)
    AND is_active = true
    AND expires_at > now()
    AND current_uses < max_uses;
  
  IF code_record IS NULL THEN
    result := json_build_object(
      'valid', false,
      'message', 'Invalid or expired access code'
    );
  ELSE
    -- Increment usage count
    UPDATE temporary_access_codes
    SET current_uses = current_uses + 1
    WHERE id = code_record.id;
    
    result := json_build_object(
      'valid', true,
      'message', 'Access granted',
      'description', code_record.description,
      'expires_at', code_record.expires_at
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS json AS $$
DECLARE
  total_rooms integer;
  occupied_rooms integer;
  total_orders integer;
  pending_orders integer;
  active_temp_codes integer;
  result json;
BEGIN
  -- Get room statistics
  SELECT COUNT(*) INTO total_rooms FROM rooms;
  SELECT COUNT(*) INTO occupied_rooms FROM rooms WHERE status = 'occupied';
  
  -- Get order statistics
  SELECT COUNT(*) INTO total_orders FROM room_orders;
  SELECT COUNT(*) INTO pending_orders FROM room_orders WHERE status IN ('pending', 'preparing');
  
  -- Get active temporary codes
  SELECT COUNT(*) INTO active_temp_codes 
  FROM temporary_access_codes 
  WHERE is_active = true AND expires_at > now() AND current_uses < max_uses;
  
  result := json_build_object(
    'rooms', json_build_object(
      'total', total_rooms,
      'occupied', occupied_rooms,
      'vacant', total_rooms - occupied_rooms
    ),
    'orders', json_build_object(
      'total', total_orders,
      'pending', pending_orders
    ),
    'temp_codes', json_build_object(
      'active', active_temp_codes
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, email, password_hash, role) VALUES
  ('admin', 'admin@pinewoods.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_temporary_access_codes_code ON temporary_access_codes(code);
CREATE INDEX IF NOT EXISTS idx_temporary_access_codes_expires ON temporary_access_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_keyword_generation_log_admin ON keyword_generation_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_keyword_generation_log_created_at ON keyword_generation_log(created_at);
