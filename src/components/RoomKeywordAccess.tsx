import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface RoomInfo {
  room_number: string;
  room_type: string;
  guest_name: string;
  check_in_date: string;
}

interface RoomKeywordAccessProps {
  onMenuUnlock: (roomInfo: RoomInfo) => void;
  onError: (message: string) => void;
}

const RoomKeywordAccess: React.FC<RoomKeywordAccessProps> = ({ onMenuUnlock, onError }) => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(true);

  const validateKeyword = async () => {
    if (!keyword.trim()) {
      onError('Please enter your room keyword or access code');
      return;
    }

    setLoading(true);
    try {
      // First try to validate as a room keyword
      const { data: roomData, error: roomError } = await supabase.rpc('unlock_food_menu', {
        keyword_input: keyword.trim().toUpperCase()
      });

      if (roomError) {
        console.error('Error validating room keyword:', roomError);
      }

      if (roomData && roomData.success) {
        setShowInput(false);
        onMenuUnlock(roomData.room_info);
        return;
      }

      // If room keyword fails, try as temporary access code
      const { data: tempData, error: tempError } = await supabase.rpc('validate_temporary_access_code', {
        code_input: keyword.trim().toUpperCase()
      });

      if (tempError) {
        console.error('Error validating temp code:', tempError);
        onError('Error validating access code. Please try again.');
        return;
      }

      if (tempData && tempData.valid) {
        // Create a mock room info for temporary access
        const mockRoomInfo = {
          room_number: 'TEMP',
          room_type: 'Temporary Access',
          guest_name: 'Temporary Guest',
          check_in_date: new Date().toISOString()
        };
        setShowInput(false);
        onMenuUnlock(mockRoomInfo);
      } else {
        onError('Invalid keyword or access code. Please check your room keyword or contact reception.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      onError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateKeyword();
    }
  };

  if (!showInput) {
    return (
      <div className="bg-pine-cream border border-pine-stone rounded-xl p-6 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-xl font-rustic font-semibold text-pine-forest mb-2">
          Food Menu Unlocked!
        </h3>
        <p className="text-pine-bark mb-4">
          You now have access to our food menu. Browse and order delicious meals to be delivered to your room.
        </p>
        <button
          onClick={() => {
            setShowInput(true);
            setKeyword('');
          }}
          className="bg-pine-forest text-white px-4 py-2 rounded-lg hover:bg-pine-sage transition-colors duration-200"
        >
          Change Room
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-pine-stone rounded-xl p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🏨</div>
        <h2 className="text-2xl font-rustic font-semibold text-pine-forest mb-2">
          Room Food Service
        </h2>
        <p className="text-pine-bark">
          Enter your room keyword or temporary access code to unlock our food menu and order delicious meals to your room.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-pine-forest mb-2">
            Room Keyword or Access Code
          </label>
          <input
            id="keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Enter your room keyword (e.g., PINE101) or access code"
            className="w-full px-4 py-3 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest outline-none transition-colors duration-200"
            disabled={loading}
          />
        </div>

        <button
          onClick={validateKeyword}
          disabled={loading || !keyword.trim()}
          className="w-full bg-pine-forest text-white py-3 rounded-lg hover:bg-pine-sage disabled:bg-pine-stone disabled:cursor-not-allowed transition-colors duration-200 font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Validating...
            </div>
          ) : (
            'Unlock Food Menu'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-pine-bark">
            Don't know your keyword? Check your room welcome card or contact reception for a temporary access code.
          </p>
        </div>
      </div>

      {/* Sample keywords for testing */}
      <div className="mt-6 p-4 bg-pine-sand rounded-lg">
        <h4 className="text-sm font-medium text-pine-forest mb-2">Sample Keywords (for testing):</h4>
        <div className="flex flex-wrap gap-2">
          {['PINE101', 'WOODS102', 'FOREST103', 'NATURE104', 'CABIN105'].map((sampleKeyword) => (
            <button
              key={sampleKeyword}
              onClick={() => setKeyword(sampleKeyword)}
              className="text-xs bg-pine-cream text-pine-forest px-2 py-1 rounded border border-pine-stone hover:bg-pine-forest hover:text-white transition-colors duration-200"
            >
              {sampleKeyword}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomKeywordAccess;
