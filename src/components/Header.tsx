import React from 'react';
import { Home, Utensils, ShoppingCart } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeaderProps {
  onMenuClick: () => void;
  onRoomServiceClick?: () => void;
  onFoodMenuClick?: () => void;
  onCartClick?: () => void;
  cartItemCount?: number;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onRoomServiceClick, onFoodMenuClick, onCartClick, cartItemCount = 0 }) => {
  const { siteSettings, loading } = useSiteSettings();
  
  // Force re-render when cart count changes
  React.useEffect(() => {
    console.log('Header - Cart item count changed to:', cartItemCount);
  }, [cartItemCount]);

  return (
    <header className="sticky top-0 z-50 bg-pine-cream/90 backdrop-blur-md border-b border-pine-stone shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={onMenuClick}
            className="flex items-center space-x-2 text-pine-forest hover:text-pine-sage transition-colors duration-200"
          >
            {loading ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            ) : (
              <img 
                src={siteSettings?.site_logo || "/logo.jpg"} 
                alt={siteSettings?.site_name || "Pine Woods Campsite"}
                className="w-10 h-10 rounded object-cover ring-2 ring-pine-sun"
                onError={(e) => {
                  e.currentTarget.src = "/logo.jpg";
                }}
              />
            )}
            <h1 className="text-2xl font-rustic font-semibold">
              {loading ? (
                <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
              ) : (
                "Pine Woods Campsite"
              )}
            </h1>
          </button>

          <div className="flex items-center space-x-2">
            {onCartClick && (
              <button 
                onClick={onCartClick}
                className="relative flex items-center space-x-1 px-3 py-2 bg-pine-forest text-white hover:bg-pine-sage rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pine-sun text-pine-forest text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}
            {onFoodMenuClick && (
              <button 
                onClick={onFoodMenuClick}
                className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm"
              >
                <Utensils className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:inline">Full Menu</span>
              </button>
            )}
            {onRoomServiceClick && (
              <button 
                onClick={onRoomServiceClick}
                className="flex items-center space-x-1 px-3 py-2 text-pine-bark hover:text-pine-forest hover:bg-pine-sand rounded-lg transition-all duration-200"
              >
                <Home className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:inline">Room Service</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;