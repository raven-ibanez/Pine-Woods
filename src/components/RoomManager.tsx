import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft } from 'lucide-react';
import { Room } from '../types';
import { useRooms } from '../hooks/useRooms';
import ImageUpload from './ImageUpload';

interface RoomManagerProps {
  onBack: () => void;
}

const RoomManager: React.FC<RoomManagerProps> = ({ onBack }) => {
  const { rooms, loading, refetch } = useRooms();
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<Partial<Room>>({
    name: '',
    description: '',
    room_type: 'standard',
    base_price: 0,
    max_guests: 2,
    amenities: [],
    image_url: '',
    available: true
  });

  const roomTypes = [
    { value: 'standard', label: 'Standard' },
    { value: 'deluxe', label: 'Deluxe' },
    { value: 'executive', label: 'Executive' },
    { value: 'family', label: 'Family' },
    { value: 'premier', label: 'Premier' },
    { value: 'group', label: 'Group' }
  ];

  const commonAmenities = [
    'Air Conditioning', 'Private Bathroom', 'WiFi', 'TV', 'Mini Fridge',
    'Kitchen', 'Balcony', 'Ocean View', 'Forest View', 'Mountain View',
    'Living Area', 'Dining Area', 'Private Pool', 'Mini Bar'
  ];

  const handleAddRoom = () => {
    setCurrentView('add');
    setFormData({
      name: '',
      description: '',
      room_type: 'standard',
      base_price: 0,
      max_guests: 2,
      amenities: [],
      image_url: '',
      available: true
    });
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description,
      room_type: room.room_type,
      base_price: room.base_price,
      max_guests: room.max_guests,
      amenities: room.amenities || [],
      image_url: room.image_url || '',
      available: room.available
    });
    setCurrentView('edit');
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        setIsProcessing(true);
        // Import supabase dynamically to avoid issues
        const { supabase } = await import('../lib/supabase');
        const { error } = await supabase
          .from('rooms')
          .delete()
          .eq('id', roomId);

        if (error) throw error;
        await refetch();
        alert('Room deleted successfully');
      } catch (error) {
        console.error('Error deleting room:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Failed to delete room: ${errorMessage}`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveRoom = async () => {
    if (!formData.name || !formData.description || !formData.base_price) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsProcessing(true);
      const { supabase } = await import('../lib/supabase');
      
      // Generate unique room number and keyword
      const baseName = formData.name?.toUpperCase().replace(/\s+/g, '').substring(0, 3) || 'ROOM';
      const baseKeyword = formData.name?.toUpperCase().replace(/\s+/g, '') || 'ROOM';
      
      let roomNumber: string;
      let keyword: string;
      
      if (editingRoom) {
        // Keep existing room number and keyword for edits
        roomNumber = editingRoom.room_number || baseName + '-001';
        keyword = editingRoom.keyword || baseKeyword + '101';
      } else {
        // For new rooms, generate unique identifiers with timestamp
        const timestamp = Date.now().toString().slice(-6);
        roomNumber = baseName + '-' + timestamp.slice(-3);
        keyword = baseKeyword + timestamp;
      }

      const roomData = {
        room_number: roomNumber,
        room_type: formData.room_type,
        keyword: keyword,
        name: formData.name,
        description: formData.description,
        status: 'vacant',
        base_price: formData.base_price,
        max_guests: formData.max_guests,
        amenities: formData.amenities || [],
        image_url: formData.image_url || null,
        available: formData.available ?? true
      };

      console.log('Attempting to save room data:', roomData);

      if (editingRoom) {
        const { data, error } = await supabase
          .from('rooms')
          .update(roomData)
          .eq('id', editingRoom.id)
          .select();

        console.log('Update result:', { data, error });
        if (error) throw error;
        alert('Room updated successfully');
      } else {
        const { data, error } = await supabase
          .from('rooms')
          .insert(roomData)
          .select();

        console.log('Insert result:', { data, error });
        if (error) throw error;
        alert('Room added successfully');
      }

      await refetch();
      setCurrentView('list');
      setEditingRoom(null);
    } catch (error) {
      console.error('Error saving room:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to save room: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setEditingRoom(null);
    setSelectedRooms([]);
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRooms.length === rooms.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(rooms.map(room => room.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRooms.length === 0) {
      alert('Please select rooms to delete');
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedRooms.length} room(s)? This action cannot be undone.`)) {
      try {
        setIsProcessing(true);
        const { supabase } = await import('../lib/supabase');
        
        for (const roomId of selectedRooms) {
          const { error } = await supabase
            .from('rooms')
            .delete()
            .eq('id', roomId);
          
          if (error) throw error;
        }
        
        setSelectedRooms([]);
        await refetch();
        alert(`Successfully deleted ${selectedRooms.length} room(s).`);
      } catch (error) {
        console.error('Error deleting rooms:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Failed to delete rooms: ${errorMessage}`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = formData.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    setFormData({ ...formData, amenities: updatedAmenities });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  // Form View (Add/Edit)
  if (currentView === 'add' || currentView === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
                <h1 className="text-2xl font-playfair font-semibold text-gray-900">
                  {currentView === 'add' ? 'Add New Room' : 'Edit Room'}
                </h1>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveRoom}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isProcessing ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter room name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Type *</label>
                <select
                  value={formData.room_type || 'standard'}
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {roomTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (PHP) *</label>
                <input
                  type="number"
                  value={formData.base_price || ''}
                  onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Guests *</label>
                <input
                  type="number"
                  value={formData.max_guests || ''}
                  onChange={(e) => setFormData({ ...formData, max_guests: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="2"
                  min="1"
                  max="20"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter room description"
                rows={4}
              />
            </div>

            <div className="mb-8">
              <ImageUpload
                currentImage={formData.image_url}
                onImageChange={(imageUrl) => setFormData({ ...formData, image_url: imageUrl })}
              />
            </div>

            {/* Amenities Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities?.includes(amenity) || false}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.available ?? true}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Available for Booking</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
              <h1 className="text-2xl font-playfair font-semibold text-gray-900">Room Management</h1>
            </div>
            <div className="flex items-center space-x-3">
              {selectedRooms.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isProcessing ? 'Deleting...' : `Delete Selected (${selectedRooms.length})`}</span>
                </button>
              )}
              <button
                onClick={handleAddRoom}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Room</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Bulk Actions Bar */}
        {rooms.length > 0 && (
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedRooms.length === rooms.length && rooms.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({rooms.length} rooms)
                  </span>
                </label>
              </div>
              {selectedRooms.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedRooms.length} room(s) selected
                  </span>
                  <button
                    onClick={() => setSelectedRooms([])}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Select</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Room</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Guests</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRooms.includes(room.id)}
                        onChange={() => handleSelectRoom(room.id)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {room.image_url && (
                          <img
                            src={room.image_url}
                            alt={room.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{room.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{room.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                      {room.room_type}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatPrice(room.base_price)}/night
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {room.max_guests} guests
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        room.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {room.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditRoom(room)}
                          disabled={isProcessing}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          disabled={isProcessing}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {rooms.map((room) => (
              <div key={room.id} className={`p-4 border-b border-gray-200 last:border-b-0 ${selectedRooms.includes(room.id) ? 'bg-blue-50' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedRooms.includes(room.id)}
                      onChange={() => handleSelectRoom(room.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-600">Select</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditRoom(room)}
                      disabled={isProcessing}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      disabled={isProcessing}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 mb-3">
                  {room.image_url && (
                    <img
                      src={room.image_url}
                      alt={room.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{room.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{room.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-1 text-gray-900 capitalize">{room.room_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <span className="ml-1 font-medium text-gray-900">{formatPrice(room.base_price)}/night</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Guests:</span>
                    <span className="ml-1 text-gray-900">{room.max_guests}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      room.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {room.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomManager;