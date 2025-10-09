import React, { useState } from 'react';
import { useMenu } from '../hooks/useMenu';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../contexts/CartContext';
import { MenuItem } from '../types';
import { ChevronLeft, ShoppingCart, Star, Clock } from 'lucide-react';

interface FoodMenuProps {
  onBack: () => void;
}

const FoodMenu: React.FC<FoodMenuProps> = ({ onBack }) => {
  const { menuItems, loading: menuLoading } = useMenu();
  const { categories, loading: categoriesLoading } = useCategories();
  const cart = useCart();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter menu items based on selected category and search term
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  // Get popular items
  const popularItems = menuItems.filter(item => item.popular && item.available);

  // Debug: Log menu items
  React.useEffect(() => {
    console.log('FoodMenu - Menu items loaded:', menuItems);
    console.log('FoodMenu - Menu items count:', menuItems.length);
    console.log('FoodMenu - Popular items:', popularItems);
    console.log('FoodMenu - Categories:', categories);
  }, [menuItems, popularItems, categories]);

  const handleAddToCart = (item: MenuItem) => {
    console.log('Adding to cart:', item);
    console.log('Item properties:', {
      id: item.id,
      name: item.name,
      basePrice: item.basePrice,
      effectivePrice: item.effectivePrice,
      category: item.category,
      available: item.available
    });
    
    // Call addToCart with all parameters
    cart.addToCart(item, 1, undefined, undefined);
    
    console.log('Item added to cart');
    
    // Check cart state after adding
    setTimeout(() => {
      console.log('Cart state after add:', cart.cartItems);
      console.log('Total items after add:', cart.getTotalItems());
    }, 200);
    
    // Show success feedback
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-4 bg-pine-forest text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right';
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-xl">✅</span>
        <span class="font-medium">${item.name} added to cart!</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  if (menuLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pine-forest mx-auto mb-4"></div>
            <p className="text-pine-bark">Loading delicious menu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-pine-forest hover:text-pine-sage transition-colors duration-200"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Back to Home</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🍽️</span>
              <h1 className="text-2xl font-rustic font-bold text-pine-forest">Food Menu</h1>
            </div>
             <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search for your favorite dish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <span className="text-amber-600">🔍</span>
            </div>
          </div>
        </div>

        {/* Popular Items Section */}
        {popularItems.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <Star className="h-6 w-6 text-amber-500 mr-2" />
              <h2 className="text-2xl font-playfair font-bold text-pine-forest">Popular Dishes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularItems.slice(0, 6).map((item) => (
                <FoodItemCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </section>
        )}

        {/* Category Navigation */}
        <section className="mb-8">
          <h2 className="text-2xl font-playfair font-bold text-pine-forest mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-pine-forest text-white shadow-lg'
                  : 'bg-white text-pine-forest border border-amber-200 hover:bg-amber-50'
              }`}
            >
              All Items
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center space-x-2 ${
                  selectedCategory === category.id
                    ? 'bg-pine-forest text-white shadow-lg'
                    : 'bg-white text-pine-forest border border-amber-200 hover:bg-amber-50'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Menu Items Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-playfair font-bold text-pine-forest">
              {selectedCategory === 'all' ? 'All Menu Items' : 
               categories.find(cat => cat.id === selectedCategory)?.name || 'Menu Items'}
            </h2>
            <span className="text-pine-bark">
              {filteredMenuItems.length} item{filteredMenuItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredMenuItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMenuItems.map((item) => (
                <FoodItemCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-playfair font-semibold text-pine-forest mb-2">
                No items found
              </h3>
              <p className="text-pine-bark">
                {searchTerm ? 'Try adjusting your search terms' : 'No items available in this category'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

// Food Item Card Component
interface FoodItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onAddToCart }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await onAddToCart(item);
      // Brief delay for visual feedback
      setTimeout(() => setIsAdding(false), 500);
    } catch (error) {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border border-amber-100">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl text-amber-600">🍽️</span>
          </div>
        )}
        
        {/* Popular Badge */}
        {item.popular && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <Star className="h-3 w-3 mr-1" />
            Popular
          </div>
        )}

        {/* Discount Badge */}
        {item.isOnDiscount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Sale
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-playfair font-semibold text-pine-forest mb-2 line-clamp-1">
          {item.name}
        </h3>
        
        <p className="text-sm text-pine-bark mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {item.isOnDiscount ? (
              <>
                <span className="text-lg font-bold text-red-600">
                  ₱{item.discountPrice?.toLocaleString()}
                </span>
                <span className="text-sm text-pine-bark line-through">
                  ₱{item.basePrice.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-pine-forest">
                ₱{item.basePrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Category */}
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            {item.category}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || !item.available}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            isAdding
              ? 'bg-amber-200 text-amber-800 cursor-not-allowed'
              : item.available
              ? 'bg-pine-forest text-white hover:bg-pine-sage hover:scale-105 shadow-sm'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAdding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-800"></div>
              <span>Adding...</span>
            </>
          ) : item.available ? (
            <>
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              <span>Unavailable</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FoodMenu;

