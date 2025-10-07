/*
  # Create Keyword Validation API Functions

  This creates functions that can be called from your frontend to:
  1. Validate room keywords
  2. Unlock food menu access
  3. Place orders using room keywords
  4. Get room order history
*/

-- Function to check if keyword is valid and unlock menu
CREATE OR REPLACE FUNCTION unlock_food_menu(keyword_input text)
RETURNS json AS $$
DECLARE
  room_info record;
  result json;
BEGIN
  -- Validate keyword and get room info
  SELECT * INTO room_info
  FROM validate_room_keyword(keyword_input);
  
  -- Log the access attempt
  PERFORM log_keyword_access(keyword_input, 'menu_access');
  
  IF room_info.is_valid THEN
    -- Return success with room info
    result := json_build_object(
      'success', true,
      'message', 'Food menu unlocked successfully!',
      'room_info', json_build_object(
        'room_number', room_info.room_number,
        'room_type', room_info.room_type,
        'guest_name', room_info.guest_name,
        'check_in_date', room_info.check_in_date
      )
    );
  ELSE
    -- Return failure
    result := json_build_object(
      'success', false,
      'message', 'Invalid keyword or room not occupied. Please check your room keyword.',
      'room_info', null
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get room order history
CREATE OR REPLACE FUNCTION get_room_order_history(keyword_input text)
RETURNS json AS $$
DECLARE
  room_info record;
  orders json;
  result json;
BEGIN
  -- Validate keyword first
  SELECT * INTO room_info
  FROM validate_room_keyword(keyword_input);
  
  IF NOT room_info.is_valid THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid keyword or room not occupied',
      'orders', null
    );
  END IF;
  
  -- Get orders for this room
  SELECT json_agg(
    json_build_object(
      'order_id', ro.id,
      'order_number', ro.order_number,
      'total_amount', ro.total_amount,
      'status', ro.status,
      'created_at', ro.created_at,
      'delivery_time', ro.delivery_time,
      'special_instructions', ro.special_instructions
    )
  ) INTO orders
  FROM room_orders ro
  WHERE ro.room_id = room_info.room_id
  ORDER BY ro.created_at DESC
  LIMIT 10;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Order history retrieved successfully',
    'room_number', room_info.room_number,
    'orders', COALESCE(orders, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to add item to room order
CREATE OR REPLACE FUNCTION add_item_to_room_order(
  keyword_input text,
  menu_item_id_input uuid,
  quantity_input integer DEFAULT 1,
  special_instructions_input text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  room_info record;
  active_order_id uuid;
  menu_item_price decimal;
  order_item_id uuid;
  result json;
BEGIN
  -- Validate keyword
  SELECT * INTO room_info
  FROM validate_room_keyword(keyword_input);
  
  IF NOT room_info.is_valid THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid keyword or room not occupied'
    );
  END IF;
  
  -- Get active order for this room (pending status)
  SELECT id INTO active_order_id
  FROM room_orders
  WHERE room_id = room_info.room_id 
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no active order, create one
  IF active_order_id IS NULL THEN
    SELECT order_id INTO active_order_id
    FROM place_room_order(keyword_input, room_info.guest_name);
  END IF;
  
  -- Get menu item price
  SELECT base_price INTO menu_item_price
  FROM menu_items
  WHERE id = menu_item_id_input;
  
  IF menu_item_price IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Menu item not found'
    );
  END IF;
  
  -- Add item to order
  INSERT INTO room_order_items (order_id, menu_item_id, quantity, unit_price, total_price, special_instructions)
  VALUES (
    active_order_id,
    menu_item_id_input,
    quantity_input,
    menu_item_price,
    menu_item_price * quantity_input,
    special_instructions_input
  )
  RETURNING id INTO order_item_id;
  
  -- Update order total
  UPDATE room_orders
  SET total_amount = (
    SELECT SUM(total_price)
    FROM room_order_items
    WHERE order_id = active_order_id
  )
  WHERE id = active_order_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Item added to order successfully',
    'order_item_id', order_item_id,
    'order_id', active_order_id
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get current room order details
CREATE OR REPLACE FUNCTION get_current_room_order(keyword_input text)
RETURNS json AS $$
DECLARE
  room_info record;
  order_details json;
  order_items json;
  result json;
BEGIN
  -- Validate keyword
  SELECT * INTO room_info
  FROM validate_room_keyword(keyword_input);
  
  IF NOT room_info.is_valid THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid keyword or room not occupied'
    );
  END IF;
  
  -- Get current pending order
  SELECT json_build_object(
    'order_id', ro.id,
    'order_number', ro.order_number,
    'total_amount', ro.total_amount,
    'status', ro.status,
    'created_at', ro.created_at,
    'special_instructions', ro.special_instructions
  ) INTO order_details
  FROM room_orders ro
  WHERE ro.room_id = room_info.room_id 
    AND ro.status = 'pending'
  ORDER BY ro.created_at DESC
  LIMIT 1;
  
  -- Get order items if order exists
  IF order_details IS NOT NULL THEN
    SELECT json_agg(
      json_build_object(
        'item_id', roi.id,
        'menu_item_name', mi.name,
        'quantity', roi.quantity,
        'unit_price', roi.unit_price,
        'total_price', roi.total_price,
        'special_instructions', roi.special_instructions
      )
    ) INTO order_items
    FROM room_order_items roi
    JOIN menu_items mi ON roi.menu_item_id = mi.id
    WHERE roi.order_id = (order_details->>'order_id')::uuid;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Current order retrieved successfully',
    'room_number', room_info.room_number,
    'order', order_details,
    'items', COALESCE(order_items, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to submit room order
CREATE OR REPLACE FUNCTION submit_room_order(keyword_input text)
RETURNS json AS $$
DECLARE
  room_info record;
  active_order_id uuid;
  result json;
BEGIN
  -- Validate keyword
  SELECT * INTO room_info
  FROM validate_room_keyword(keyword_input);
  
  IF NOT room_info.is_valid THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid keyword or room not occupied'
    );
  END IF;
  
  -- Get active order
  SELECT id INTO active_order_id
  FROM room_orders
  WHERE room_id = room_info.room_id 
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF active_order_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'No pending order found'
    );
  END IF;
  
  -- Update order status to preparing
  UPDATE room_orders
  SET status = 'preparing', updated_at = now()
  WHERE id = active_order_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Order submitted successfully! Your food will be prepared and delivered to your room.',
    'order_id', active_order_id,
    'room_number', room_info.room_number
  );
END;
$$ LANGUAGE plpgsql;
