import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useRoomOrders } from './hooks/useRoomOrders';
import { useCart } from './contexts/CartContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import RoomKeywordAccess from './components/RoomKeywordAccess';
import RoomOrderCart from './components/RoomOrderCart';
import RoomServiceSubNav from './components/RoomServiceSubNav';
import FoodMenu from './components/FoodMenu';
import Cart from './components/Cart';
import FloatingCartButton from './components/FloatingCartButton';
import { useRooms } from './hooks/useRooms';
import { MenuItem, Room } from './types';
import RoomCard from './components/RoomCard';

function MainApp() {
  const roomOrders = useRoomOrders();
  const cart = useCart();
  const { 
    rooms, 
    loading: roomsLoading
  } = useRooms();
  const [currentView, setCurrentView] = React.useState<'menu' | 'checkout' | 'room-service' | 'food-menu' | 'cart'>('menu');
  const [showRoomService, setShowRoomService] = React.useState(false);
  const [selectedItemForBooking, setSelectedItemForBooking] = React.useState<MenuItem | null>(null);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = React.useState<Room | null>(null);

  const handleViewChange = (view: 'menu' | 'checkout' | 'room-service' | 'food-menu' | 'cart') => {
    setCurrentView(view);
  };

  const handleCartClick = () => {
    console.log('Opening cart. Current cart items:', cart.cartItems);
    console.log('Cart total items:', cart.getTotalItems());
    setCurrentView('cart');
  };

  const handleContinueShopping = () => {
    setCurrentView('food-menu');
  };

  const handleCheckoutFromCart = () => {
    setCurrentView('checkout');
  };

  const handleCheckoutSuccess = () => {
    // Clear cart after successful checkout
    cart.clearCart();
    setCurrentView('menu');
    // Show success message
    alert('🎉 Order placed successfully! Thank you for your order.');
  };

  const handleMenuUnlock = () => {
    setShowRoomService(true);
  };

  const handleRoomServiceError = (message: string) => {
    alert(message);
  };

  const handleBookRoom = (room: Room) => {
    setSelectedRoomForBooking(room);
    setCurrentView('checkout');
  };


  const handleAddToRoomOrder = async (item: MenuItem, quantity: number = 1, specialInstructions?: string) => {
    if (!roomOrders.currentRoom) return;
    
    const keyword = 'PINE101'; // You'll need to store this from the keyword input
    const success = await roomOrders.addItemToOrder(keyword, item.id, quantity, specialInstructions);
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




  return (
    <div className="min-h-screen bg-pine-cream font-natural">
      <Header 
        onMenuClick={() => handleViewChange('menu')}
        onRoomServiceClick={() => handleViewChange('room-service')}
        onFoodMenuClick={() => handleViewChange('food-menu')}
        onCartClick={handleCartClick}
        cartItemCount={cart.getTotalItems()}
      />
      
      {currentView === 'menu' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-16">
            {/* Hero Section with Pine Woods Branding */}
            <div className="relative overflow-hidden rounded-2xl mb-12 bg-gradient-to-r from-pine-forest/90 to-green-600/90 p-10 text-white">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/10 to-green-50/10"></div>
              <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-rustic font-bold mb-4">
                  Welcome to Pine Woods Campsite
                </h1>
                <div className="text-lg md:text-xl mb-6 font-playfair font-medium">
                  🌊🌲 Where Adventure Meets Serenity 🌲🌊
                </div>
                <p className="text-base md:text-lg max-w-3xl mx-auto leading-relaxed opacity-95">
                  Discover the perfect blend of forest camping and beach relaxation. 
                  Wake up to ocean waves, sleep under pine trees, and create memories that last forever.
                </p>
              </div>
            </div>

            {/* Natural Experience Flow */}
            <div className="mb-12">
              <h2 className="text-3xl font-playfair font-bold text-pine-forest mb-8">
                Experience the Magic
              </h2>
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Morning */}
                  <div className="group relative">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-amber-100">
                      <div className="text-4xl mb-3 group-hover:scale-105 transition-transform duration-300">🌅</div>
                      <h3 className="text-xl font-playfair font-bold text-pine-forest mb-3">Morning Magic</h3>
                      <p className="text-pine-bark leading-relaxed text-sm">Wake up to breathtaking sunrises over the shoreline, with the gentle sound of waves and fresh pine-scented air filling your lungs.</p>
                      <div className="mt-3 text-xs text-amber-700 font-medium">✨ Perfect start to your day</div>
                    </div>
                  </div>

                  {/* Day */}
                  <div className="group relative">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
                      <div className="text-4xl mb-3 group-hover:scale-105 transition-transform duration-300">🏖️</div>
                      <h3 className="text-xl font-playfair font-bold text-pine-forest mb-3">Day Adventures</h3>
                      <p className="text-pine-bark leading-relaxed text-sm">Dive into crystal-clear waters, paddle through hidden coves, or simply bask in the sun with stunning ocean views as your backdrop.</p>
                      <div className="mt-3 text-xs text-blue-700 font-medium">🏊‍♀️ Endless water fun</div>
                    </div>
                  </div>

                  {/* Evening */}
                  <div className="group relative">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-green-100">
                      <div className="text-4xl mb-3 group-hover:scale-105 transition-transform duration-300">🔥</div>
                      <h3 className="text-xl font-playfair font-bold text-pine-forest mb-3">Evening Unwind</h3>
                      <p className="text-pine-bark leading-relaxed text-sm">Gather around a crackling bonfire under starlit skies, sharing stories and laughter with loved ones as the waves serenade you.</p>
                      <div className="mt-3 text-xs text-green-700 font-medium">🌙 Memories that last forever</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Adventure Features - Hexagonal Grid */}
            <div className="mb-12">
              <h2 className="text-3xl font-playfair font-bold text-pine-forest mb-8">
                Adventure Awaits
              </h2>
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-amber-100">
                    <div className="text-3xl mb-2">🏨</div>
                    <h4 className="text-base font-bold text-pine-forest">Beachfront Rooms</h4>
                    <p className="text-xs text-pine-bark">Comfortable accommodations with ocean views</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-green-100">
                    <div className="text-3xl mb-2">🏕️</div>
                    <h4 className="text-base font-bold text-pine-forest">Pine Camping</h4>
                    <p className="text-xs text-pine-bark">Rustic camping under the stars</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
                    <div className="text-3xl mb-2">🌊</div>
                    <h4 className="text-base font-bold text-pine-forest">Direct Beach</h4>
                    <p className="text-xs text-pine-bark">Step right onto the sand</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-orange-100">
                    <div className="text-3xl mb-2">🔥</div>
                    <h4 className="text-base font-bold text-pine-forest">Bonfire Areas</h4>
                    <p className="text-xs text-pine-bark">Perfect for evening gatherings</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-teal-100">
                    <div className="text-3xl mb-2">🚣</div>
                    <h4 className="text-base font-bold text-pine-forest">Water Sports</h4>
                    <p className="text-xs text-pine-bark">Kayaking and swimming adventures</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-yellow-100">
                    <div className="text-3xl mb-2">🍽️</div>
                    <h4 className="text-base font-bold text-pine-forest">Fresh Seafood</h4>
                    <p className="text-xs text-pine-bark">Local delicacies nearby</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Adventure */}
            <div className="bg-gradient-to-r from-pine-forest to-green-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl md:text-3xl font-playfair font-bold mb-4">
                🌲🏖️ Ready for Your Adventure? 🌲🏖️
              </h2>
              <p className="text-lg mb-6 opacity-95">
                Where the sea meets the woods • Where memories are made • Where nature welcomes you home
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <div className="bg-white/20 px-4 py-2 rounded-full border border-white/30">
                  <span className="text-sm font-medium">💑 Perfect for Couples</span>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full border border-white/30">
                  <span className="text-sm font-medium">👨‍👩‍👧‍👦 Great for Families</span>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full border border-white/30">
                  <span className="text-sm font-medium">👥 Fun for Groups</span>
                </div>
              </div>
            </div>
          </div>

          {/* Room Rates Section */}
          <section className="mb-16">
            <div className="flex items-center mb-8">
              <span className="text-3xl mr-3">🏨</span>
              <h2 className="text-3xl font-rustic font-medium text-pine-forest">Room Rates</h2>
            </div>
            
            {roomsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pine-forest mx-auto mb-4"></div>
                <p className="text-pine-bark">Loading room rates...</p>
              </div>
            ) : rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onBookNow={handleBookRoom}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <h3 className="text-2xl font-rustic font-semibold text-pine-forest mb-4">No Rooms Available</h3>
                <p className="text-pine-bark">
                  Room rates are currently being updated. Please check back later or contact us for more information.
                </p>
              </div>
            )}
          </section>

        </div>
      )}
      
      {currentView === 'checkout' && (
        <Checkout 
          cartItems={cart.cartItems.length > 0 ? cart.cartItems : selectedItemForBooking ? [{
            ...selectedItemForBooking,
            quantity: 1,
            totalPrice: selectedItemForBooking.effectivePrice || selectedItemForBooking.basePrice
          }] : selectedRoomForBooking ? [{
            id: selectedRoomForBooking.id,
            name: selectedRoomForBooking.name,
            description: selectedRoomForBooking.description,
            basePrice: selectedRoomForBooking.base_price,
            category: 'room-rates',
            quantity: 1,
            totalPrice: selectedRoomForBooking.base_price,
            variations: [],
            addOns: []
          }] : []}
          totalPrice={cart.cartItems.length > 0 ? cart.getTotalPrice() : selectedItemForBooking ? 
            (selectedItemForBooking.effectivePrice || selectedItemForBooking.basePrice) : 
            selectedRoomForBooking ? selectedRoomForBooking.base_price : 0
          }
          onBack={() => {
            if (cart.cartItems.length > 0) {
              setCurrentView('cart');
            } else {
              setCurrentView('menu');
              setSelectedItemForBooking(null);
              setSelectedRoomForBooking(null);
            }
          }}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Food Menu Section */}
      {currentView === 'food-menu' && (
        <>
          <FoodMenu onBack={() => handleViewChange('menu')} />
          <FloatingCartButton 
            itemCount={cart.getTotalItems()} 
            onCartClick={handleCartClick}
          />
        </>
      )}

      {/* Cart Section */}
      {currentView === 'cart' && (
        <Cart
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          removeFromCart={cart.removeFromCart}
          clearCart={cart.clearCart}
          getTotalPrice={cart.getTotalPrice}
          onContinueShopping={handleContinueShopping}
          onCheckout={handleCheckoutFromCart}
        />
      )}

      {/* Room Service Section */}
      {currentView === 'room-service' && (
        <>
          {showRoomService && (
            <RoomServiceSubNav 
              selectedCategory="all" 
              onCategoryClick={() => {}} 
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
                {/* Room Service Info */}
                <div>
                  <h2 className="text-2xl font-rustic font-semibold text-pine-forest mb-6">
                    Room Service
                  </h2>
                  <div className="bg-white border border-pine-stone rounded-xl p-6 shadow-sm">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🍽️</div>
                      <h3 className="text-xl font-rustic font-semibold text-pine-forest mb-2">
                        Room Service Available
                      </h3>
                      <p className="text-pine-bark mb-4">
                        Enjoy delicious meals delivered directly to your room. 
                        Contact our front desk or use the Full Menu button to place your order.
                      </p>
                      <button
                        onClick={() => handleViewChange('food-menu')}
                        className="bg-pine-forest text-white px-6 py-3 rounded-xl font-medium hover:bg-pine-sage transition-colors duration-200"
                      >
                        View Full Menu
                      </button>
                    </div>
                  </div>
                </div>

                {/* Room Order Cart */}
                <div>
                  <h2 className="text-2xl font-rustic font-semibold text-pine-forest mb-6">
                    Your Room Order
                  </h2>
                  {roomOrders.currentOrder ? (
                    <RoomOrderCart
                      order={roomOrders.currentOrder}
                      onAddItem={(menuItemId: string, quantity: number, specialInstructions?: string) => 
                        handleAddToRoomOrder({ id: menuItemId } as MenuItem, quantity, specialInstructions)
                      }
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
      

    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;