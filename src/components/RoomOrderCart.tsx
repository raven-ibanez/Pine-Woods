import React from 'react';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { RoomOrder, RoomOrderItem } from '../hooks/useRoomOrders';

interface RoomOrderCartProps {
  order: RoomOrder;
  onAddItem: (menuItemId: string, quantity: number, specialInstructions?: string) => void;
  onSubmitOrder: () => void;
  onRemoveItem?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  loading?: boolean;
}

const RoomOrderCart: React.FC<RoomOrderCartProps> = ({
  order,
  onAddItem,
  onSubmitOrder,
  onRemoveItem,
  onUpdateQuantity,
  loading = false
}) => {
  const totalItems = order.items.reduce((total, item) => total + item.quantity, 0);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0 && onRemoveItem) {
      onRemoveItem(itemId);
    } else if (onUpdateQuantity) {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  if (order.items.length === 0) {
    return (
      <div className="bg-white border border-pine-stone rounded-xl p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="text-xl font-rustic font-semibold text-pine-forest mb-2">
            Your Room Order is Empty
          </h3>
          <p className="text-pine-bark">
            Add some delicious items to your order and we'll deliver them to your room!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-pine-stone rounded-xl shadow-sm overflow-hidden">
      {/* Order Header */}
      <div className="bg-pine-cream px-6 py-4 border-b border-pine-stone">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-rustic font-semibold text-pine-forest">
              Room Order #{order.order_number}
            </h3>
            <p className="text-sm text-pine-bark">
              {totalItems} item{totalItems !== 1 ? 's' : ''} • Total: ₱{order.total_amount.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-pine-bark">Status</div>
            <div className="text-sm font-medium text-pine-forest capitalize">
              {order.status}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-6">
        <div className="space-y-4 mb-6">
          {order.items.map((item) => (
            <div key={item.item_id} className="flex items-center justify-between p-4 bg-pine-cream rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-pine-forest">{item.menu_item_name}</h4>
                <p className="text-sm text-pine-bark">
                  ₱{item.unit_price.toFixed(2)} each
                </p>
                {item.special_instructions && (
                  <p className="text-xs text-pine-stone mt-1">
                    Note: {item.special_instructions}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-pine-stone">
                  <button
                    onClick={() => handleQuantityChange(item.item_id, item.quantity - 1)}
                    className="p-1 hover:bg-pine-sand rounded transition-colors duration-200"
                    disabled={loading}
                  >
                    <Minus className="h-4 w-4 text-pine-forest" />
                  </button>
                  <span className="font-medium text-pine-forest min-w-[24px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.item_id, item.quantity + 1)}
                    className="p-1 hover:bg-pine-sand rounded transition-colors duration-200"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 text-pine-forest" />
                  </button>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-pine-forest">
                    ₱{item.total_price.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Special Instructions */}
        {order.special_instructions && (
          <div className="mb-6 p-4 bg-pine-sand rounded-lg">
            <h4 className="text-sm font-medium text-pine-forest mb-2">Special Instructions:</h4>
            <p className="text-sm text-pine-bark">{order.special_instructions}</p>
          </div>
        )}

        {/* Order Summary */}
        <div className="border-t border-pine-stone pt-4 mb-6">
          <div className="flex items-center justify-between text-lg font-semibold text-pine-forest">
            <span>Total Amount:</span>
            <span>₱{order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmitOrder}
          disabled={loading || order.items.length === 0}
          className="w-full bg-pine-forest text-white py-4 rounded-lg hover:bg-pine-sage disabled:bg-pine-stone disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Submitting Order...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              <span>Submit Order to Kitchen</span>
            </>
          )}
        </button>

        <p className="text-xs text-pine-bark text-center mt-3">
          Your order will be prepared and delivered to your room. Estimated delivery time: 20-30 minutes.
        </p>
      </div>
    </div>
  );
};

export default RoomOrderCart;
