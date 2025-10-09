import React from 'react';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
  onBookNow: (room: Room) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ 
  room, 
  onBookNow
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getRoomTypeIcon = (roomType: string) => {
    switch (roomType) {
      case 'standard': return '🏠';
      case 'deluxe': return '🏨';
      case 'executive': return '🏢';
      case 'family': return '🏘️';
      case 'premier': return '🏖️';
      case 'group': return '🏕️';
      default: return '🏠';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };


  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-pine-forest to-pine-sage">
        {room.image_url ? (
          <img
            src={room.image_url}
            alt={room.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${room.image_url ? 'hidden' : ''}`}>
          <div className="text-6xl opacity-20 text-white">{getRoomTypeIcon(room.room_type)}</div>
        </div>
        
        {/* Room Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-pine-forest text-xs font-bold px-3 py-1.5 rounded-full shadow-lg capitalize">
            {room.room_type}
          </span>
        </div>
        
        {/* Max Guests Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-pine-forest text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            👥 {room.max_guests} guests
          </span>
        </div>
        
        
        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-pine-forest text-lg font-bold px-4 py-2 rounded-full shadow-lg">
            {formatPrice(room.base_price)}/night
          </span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-pine-forest leading-tight flex-1 pr-2">
            {room.name}
          </h3>
        </div>
        
        <p className="text-pine-bark text-sm mb-4 line-clamp-3">
          {room.description}
        </p>
        
        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Amenities:</p>
            <div className="flex flex-wrap gap-1">
              {room.amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pine-sand text-pine-forest"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 4 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                  +{room.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        
        {/* Book Now Button */}
        <button
          onClick={() => onBookNow(room)}
          className="w-full bg-pine-forest text-white py-3 px-4 rounded-lg font-medium hover:bg-pine-sage transition-colors duration-200 transform hover:scale-[1.02] shadow-sm"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
