import React from 'react';
import { useRoomServiceCategories } from '../hooks/useRoomServiceCategories';

interface RoomServiceSubNavProps {
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const RoomServiceSubNav: React.FC<RoomServiceSubNavProps> = ({ selectedCategory, onCategoryClick }) => {
  const { categories, loading } = useRoomServiceCategories();

  return (
    <div className="sticky top-16 z-40 bg-pine-cream/90 backdrop-blur-md border-b border-pine-stone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 overflow-x-auto py-3 scrollbar-hide">
          {loading ? (
            <div className="flex space-x-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <button
                onClick={() => onCategoryClick('all')}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors duration-200 border ${
                  selectedCategory === 'all'
                    ? 'bg-pine-forest text-white border-pine-forest'
                    : 'bg-white text-pine-bark border-pine-stone hover:border-pine-forest'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick(c.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors duration-200 border flex items-center space-x-1 ${
                    selectedCategory === c.id
                      ? 'bg-pine-forest text-white border-pine-forest'
                      : 'bg-white text-pine-bark border-pine-stone hover:border-pine-forest'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomServiceSubNav;
