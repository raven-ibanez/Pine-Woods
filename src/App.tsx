import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import { useRoomOrders, RoomInfo } from './hooks/useRoomOrders';
import Header from './components/Header';
import SubNav from './components/SubNav';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import FloatingCartButton from './components/FloatingCartButton';
import AdminDashboard from './components/AdminDashboard';
import RoomKeywordAccess from './components/RoomKeywordAccess';
import RoomOrderCart from './components/RoomOrderCart';
import RoomServiceSubNav from './components/RoomServiceSubNav';
import { useMenu } from './hooks/useMenu';
import { useRoomServiceMenu } from './hooks/useRoomServiceMenu';
import { useRoomServiceCategories } from './hooks/useRoomServiceCategories';

function MainApp() {
  const cart = useCart();
  const roomOrders = useRoomOrders();
  const { menuItems } = useMenu();
  const { menuItems: roomServiceMenuItems } = useRoomServiceMenu();
  const { categories: roomServiceCategories } = useRoomServiceCategories();
  const [currentView, setCurrentView] = React.useState<'menu' | 'cart' | 'checkout' | 'room-service'>('menu');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [showRoomService, setShowRoomService] = React.useState(false);

  const handleViewChange = (view: 'menu' | 'cart' | 'checkout' | 'room-service') => {
    setCurrentView(view);
    // Reset category selection when switching views
    setSelectedCategory('all');
  };

  const handleMenuUnlock = (roomInfo: RoomInfo) => {
    setShowRoomService(true);
  };

  const handleRoomServiceError = (message: string) => {
    alert(message);
  };

  const handleAddToRoomOrder = async (menuItemId: string, quantity: number = 1, specialInstructions?: string) => {
    if (!roomOrders.currentRoom) return;
    
    const keyword = 'PINE101'; // You'll need to store this from the keyword input
    const success = await roomOrders.addItemToOrder(keyword, menuItemId, quantity, specialInstructions);
    if (success) {
      alert('Item added to room order!');
    }
  };

  const handleSubmitRoomOrder = async () => {
    if (!roomOrders.currentRoom) return;
    
    const keyword = 'PINE101'; // You'll need to store this from the keyword input
    const success = await roomOrders.submitOrder(keyword);
    if (success) {
      alert('Order submitted successfully! Your food will be delivered to your room.');
      setShowRoomService(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Filter menu items based on selected category
  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  // Filter room service menu items based on selected category
  const filteredRoomServiceMenuItems = selectedCategory === 'all' 
    ? roomServiceMenuItems 
    : roomServiceMenuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-pine-cream font-natural">
      <Header 
        cartItemsCount={cart.getTotalItems()}
        onCartClick={() => handleViewChange('cart')}
        onMenuClick={() => handleViewChange('menu')}
        onRoomServiceClick={() => handleViewChange('room-service')}
      />
      <SubNav selectedCategory={selectedCategory} onCategoryClick={handleCategoryClick} />
      
      {currentView === 'menu' && (
        <Menu 
          menuItems={filteredMenuItems}
          addToCart={cart.addToCart}
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
        />
      )}
      
      {currentView === 'cart' && (
        <Cart 
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          removeFromCart={cart.removeFromCart}
          clearCart={cart.clearCart}
          getTotalPrice={cart.getTotalPrice}
          onContinueShopping={() => handleViewChange('menu')}
          onCheckout={() => handleViewChange('checkout')}
        />
      )}
      
      {currentView === 'checkout' && (
        <Checkout 
          cartItems={cart.cartItems}
          totalPrice={cart.getTotalPrice()}
          onBack={() => handleViewChange('cart')}
        />
      )}

      {/* Room Service Section */}
      {currentView === 'room-service' && (
        <>
          {showRoomService && (
            <RoomServiceSubNav 
              selectedCategory={selectedCategory} 
              onCategoryClick={handleCategoryClick} 
            />
          )}
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => handleViewChange('menu')}
                className="flex items-center space-x-2 text-pine-bark hover:text-pine-forest transition-colors duration-200"
              >
                <span>← Back to Menu</span>
              </button>
              <h1 className="text-3xl font-rustic font-semibold text-pine-forest">Room Service</h1>
              <div></div>
            </div>

            {!showRoomService ? (
              <RoomKeywordAccess 
                onMenuUnlock={handleMenuUnlock}
                onError={handleRoomServiceError}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Menu Section */}
                <div>
                  <h2 className="text-2xl font-rustic font-semibold text-pine-forest mb-6">
                    Order Food to Your Room
                  </h2>
                  <Menu 
                    menuItems={filteredRoomServiceMenuItems}
                    addToCart={handleAddToRoomOrder}
                    cartItems={[]}
                    updateQuantity={() => {}}
                  />
                </div>

                {/* Room Order Cart */}
                <div>
                  <h2 className="text-2xl font-rustic font-semibold text-pine-forest mb-6">
                    Your Room Order
                  </h2>
                  {roomOrders.currentOrder ? (
                    <RoomOrderCart
                      order={roomOrders.currentOrder}
                      onAddItem={handleAddToRoomOrder}
                      onSubmitOrder={handleSubmitRoomOrder}
                      loading={roomOrders.loading}
                    />
                  ) : (
                    <div className="bg-white border border-pine-stone rounded-xl p-6 shadow-sm">
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🛒</div>
                        <h3 className="text-xl font-rustic font-semibold text-pine-forest mb-2">
                          No Active Order
                        </h3>
                        <p className="text-pine-bark">
                          Add items from the menu to start your room order.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {currentView === 'menu' && (
        <FloatingCartButton 
          itemCount={cart.getTotalItems()}
          onCartClick={() => handleViewChange('cart')}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;