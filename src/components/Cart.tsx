import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalPrice,
  onContinueShopping,
  onCheckout
}) => {
  console.log('Cart component - cartItems:', cartItems);
  console.log('Cart component - cartItems.length:', cartItems.length);
  
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏕️</div>
          <h2 className="text-2xl font-rustic font-medium text-pine-forest mb-2">Your cart is empty</h2>
          <p className="text-pine-bark mb-6">Add some amazing services to get started!</p>
          <button
            onClick={onContinueShopping}
            className="bg-pine-forest text-white px-6 py-3 rounded-full hover:bg-pine-sage transition-all duration-200"
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onContinueShopping}
          className="flex items-center space-x-2 text-pine-bark hover:text-pine-forest transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Continue Shopping</span>
        </button>
        <h1 className="text-3xl font-rustic font-semibold text-pine-forest">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-pine-stone hover:text-pine-forest transition-colors duration-200"
        >
          Clear All
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        {cartItems.map((item, index) => (
          <div key={item.id} className={`p-6 ${index !== cartItems.length - 1 ? 'border-b border-pine-stone' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-rustic font-medium text-pine-forest mb-1">{item.name}</h3>
                {item.selectedVariation && (
                  <p className="text-sm text-gray-500 mb-1">Size: {item.selectedVariation.name}</p>
                )}
                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <p className="text-sm text-gray-500 mb-1">
                    Add-ons: {item.selectedAddOns.map(addOn => 
                      addOn.quantity && addOn.quantity > 1 
                        ? `${addOn.name} x${addOn.quantity}`
                        : addOn.name
                    ).join(', ')}
                  </p>
                )}
                <p className="text-lg font-semibold text-pine-forest">₱{item.totalPrice} each</p>
              </div>
              
              <div className="flex items-center space-x-4 ml-4">
                <div className="flex items-center space-x-3 bg-pine-cream rounded-full p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-pine-sand rounded-full transition-colors duration-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-semibold text-pine-forest min-w-[32px] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-pine-sand rounded-full transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold text-pine-forest">₱{item.totalPrice * item.quantity}</p>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-pine-stone hover:text-pine-forest hover:bg-pine-sand rounded-full transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between text-2xl font-rustic font-semibold text-pine-forest mb-6">
          <span>Total:</span>
          <span>₱{parseFloat(getTotalPrice() || 0).toFixed(2)}</span>
        </div>
        
        <button
          onClick={onCheckout}
          className="w-full bg-pine-forest text-white py-4 rounded-xl hover:bg-pine-sage transition-all duration-200 transform hover:scale-[1.02] font-medium text-lg"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;