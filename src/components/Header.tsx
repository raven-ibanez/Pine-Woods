import React from 'react';
import { ShoppingCart, Home } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
  onRoomServiceClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick, onRoomServiceClick }) => {
  const { siteSettings, loading } = useSiteSettings();

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
            {onRoomServiceClick && (
              <button 
                onClick={onRoomServiceClick}
                className="flex items-center space-x-1 px-3 py-2 text-pine-bark hover:text-pine-forest hover:bg-pine-sand rounded-lg transition-all duration-200"
              >
                <Home className="h-5 w-5" />
                <span className="text-sm font-medium">Room Service</span>
              </button>
            )}
            <button 
              onClick={onCartClick}
              className="relative p-2 text-pine-bark hover:text-pine-forest hover:bg-pine-sand rounded-full transition-all duration-200"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pine-forest text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-gentle">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;