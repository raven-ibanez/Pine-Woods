import React, { useState } from 'react';
import { useMenu } from '../hooks/useMenu';
import { useCategories } from '../hooks/useCategories';
import { useImageUpload } from '../hooks/useImageUpload';
import { MenuItem } from '../types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Star,
  Image as ImageIcon,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

interface FoodMenuManagerProps {
  onBack: () => void;
}

const FoodMenuManager: React.FC<FoodMenuManagerProps> = ({ onBack }) => {
  const { menuItems, loading: menuLoading, addMenuItem, updateMenuItem, deleteMenuItem, refetch: refetchMenu } = useMenu();
  const { categories, loading: categoriesLoading } = useCategories();
  const { uploadImage, uploading } = useImageUpload();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    category: '',
    popular: false,
    available: true,
    room_service_only: false,
    image_url: '',
    discount_price: '',
    discount_active: false,
    discount_start_date: '',
    discount_end_date: ''
  });

  // Filter menu items based on search and category
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      base_price: '',
      category: '',
      popular: false,
      available: true,
      room_service_only: false,
      image_url: '',
      discount_price: '',
      discount_active: false,
      discount_start_date: '',
      discount_end_date: ''
    });
    setShowForm(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      base_price: item.basePrice.toString(),
      category: item.category,
      popular: item.popular,
      available: item.available,
      room_service_only: (item as any).room_service_only || false,
      image_url: item.image || '',
      discount_price: item.discountPrice?.toString() || '',
      discount_active: item.discountActive,
      discount_start_date: item.discountStartDate || '',
      discount_end_date: item.discountEndDate || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      await deleteMenuItem(itemId);
      alert('Menu item deleted successfully');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadImage(file, 'menu-items');
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const menuItemData = {
        name: formData.name,
        description: formData.description,
        basePrice: parseFloat(formData.base_price),
        category: formData.category,
        popular: formData.popular,
        available: formData.available,
        roomServiceOnly: formData.room_service_only,
        image: formData.image_url || undefined,
        discountPrice: formData.discount_price ? parseFloat(formData.discount_price) : undefined,
        discountStartDate: formData.discount_start_date || undefined,
        discountEndDate: formData.discount_end_date || undefined,
        discountActive: formData.discount_active,
        variations: [],
        addOns: []
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, menuItemData);
        alert('Menu item updated successfully');
      } else {
        await addMenuItem(menuItemData);
        alert('Menu item added successfully');
      }
      
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  if (menuLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pine-forest mx-auto mb-4"></div>
          <p className="text-pine-bark">Loading food menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-pine-forest hover:text-pine-sage transition-colors duration-200"
            >
              <span>← Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🍽️</span>
              <h1 className="text-2xl font-rustic font-bold text-pine-forest">Food Menu Manager</h1>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center space-x-2 bg-pine-forest text-white px-4 py-2 rounded-lg hover:bg-pine-sage transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent appearance-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
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
                    <ImageIcon className="h-12 w-12 text-amber-600" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {item.popular && (
                    <div className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </div>
                  )}
                  {item.isOnDiscount && (
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Sale
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </div>
                </div>
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

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center justify-center bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-playfair font-semibold text-pine-forest mb-2">
              No menu items found
            </h3>
            <p className="text-pine-bark mb-6">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first menu item'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={handleAddNew}
                className="bg-pine-forest text-white px-6 py-3 rounded-lg hover:bg-pine-sage transition-colors duration-200"
              >
                Add Your First Item
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-playfair font-bold text-pine-forest">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent"
                      placeholder="Enter item name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent"
                    placeholder="Enter item description"
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Price (₱) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.base_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Price (₱)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_price: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Discount Settings */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      id="discount_active"
                      checked={formData.discount_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_active: e.target.checked }))}
                      className="h-4 w-4 text-pine-forest focus:ring-pine-forest border-gray-300 rounded"
                    />
                    <label htmlFor="discount_active" className="text-sm font-medium text-gray-700">
                      Enable discount
                    </label>
                  </div>

                  {formData.discount_active && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.discount_start_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, discount_start_date: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount End Date
                        </label>
                        <input
                          type="date"
                          value={formData.discount_end_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, discount_end_date: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-transparent"
                      />
                    </div>
                    {formData.image_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  {uploading && (
                    <p className="text-sm text-amber-600 mt-2">Uploading image...</p>
                  )}
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="popular"
                      checked={formData.popular}
                      onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
                      className="h-4 w-4 text-pine-forest focus:ring-pine-forest border-gray-300 rounded"
                    />
                    <label htmlFor="popular" className="text-sm font-medium text-gray-700">
                      Mark as Popular
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formData.available}
                      onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                      className="h-4 w-4 text-pine-forest focus:ring-pine-forest border-gray-300 rounded"
                    />
                    <label htmlFor="available" className="text-sm font-medium text-gray-700">
                      Available
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="room_service_only"
                      checked={formData.room_service_only}
                      onChange={(e) => setFormData(prev => ({ ...prev, room_service_only: e.target.checked }))}
                      className="h-4 w-4 text-pine-forest focus:ring-pine-forest border-gray-300 rounded"
                    />
                    <label htmlFor="room_service_only" className="text-sm font-medium text-gray-700">
                      Room Service Only
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-pine-forest text-white rounded-lg hover:bg-pine-sage transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingItem ? 'Update Item' : 'Add Item'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodMenuManager;
