import React, { useState, useEffect } from 'react';
import { Plus, Key, Users, Clock, Trash2, Copy, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  keyword: string;
  status: string;
  max_guests: number;
  created_at: string;
}

interface TempCode {
  id: string;
  code: string;
  description: string;
  expires_at: string;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

interface DashboardStats {
  rooms: {
    total: number;
    occupied: number;
    vacant: number;
  };
  orders: {
    total: number;
    pending: number;
  };
  temp_codes: {
    active: number;
  };
}

const AdminKeywordManager: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tempCodes, setTempCodes] = useState<TempCode[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showCreateTempCode, setShowCreateTempCode] = useState(false);
  
  // Form states
  const [newRoom, setNewRoom] = useState({
    room_number: '',
    room_type: '',
    max_guests: 2
  });
  
  const [newTempCode, setNewTempCode] = useState({
    description: '',
    expires_in_hours: 24,
    max_uses: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load rooms
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');

      // Load temporary codes
      const { data: tempCodesData } = await supabase
        .from('temporary_access_codes')
        .select('*')
        .order('created_at', { ascending: false });

      // Load dashboard stats
      const { data: statsData } = await supabase.rpc('get_admin_dashboard_stats');

      setRooms(roomsData || []);
      setTempCodes(tempCodesData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!newRoom.room_number || !newRoom.room_type) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // First, get or create an admin user
      let adminUserId = '00000000-0000-0000-0000-000000000000';
      
      // Try to get the default admin user
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('id')
        .eq('username', 'admin')
        .single();
      
      if (adminData) {
        adminUserId = adminData.id;
      }

      const { data, error } = await supabase.rpc('create_room_with_keyword', {
        room_number_input: newRoom.room_number,
        room_type_input: newRoom.room_type,
        admin_user_id_input: adminUserId,
        max_guests_input: newRoom.max_guests
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      alert(`Room created successfully! Keyword: ${data}`);
      setNewRoom({ room_number: '', room_type: '', max_guests: 2 });
      setShowCreateRoom(false);
      loadData();
    } catch (error) {
      console.error('Error creating room:', error);
      alert(`Error creating room: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const createTempCode = async () => {
    if (!newTempCode.description) {
      alert('Please enter a description');
      return;
    }

    setLoading(true);
    try {
      // First, get or create an admin user
      let adminUserId = '00000000-0000-0000-0000-000000000000';
      
      // Try to get the default admin user
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('id')
        .eq('username', 'admin')
        .single();
      
      if (adminData) {
        adminUserId = adminData.id;
      }

      const { data, error } = await supabase.rpc('generate_temporary_access_code', {
        description_input: newTempCode.description,
        admin_user_id_input: adminUserId,
        expires_in_hours: newTempCode.expires_in_hours,
        max_uses_input: newTempCode.max_uses
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      alert(`Temporary access code created: ${data}`);
      setNewTempCode({ description: '', expires_in_hours: 24, max_uses: 1 });
      setShowCreateTempCode(false);
      loadData();
    } catch (error) {
      console.error('Error creating temp code:', error);
      alert(`Error creating temporary code: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const updateRoomStatus = async (roomId: string, newStatus: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status: newStatus })
        .eq('id', roomId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating room status:', error);
      alert('Error updating room status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteTempCode = async (codeId: string) => {
    if (!confirm('Are you sure you want to delete this temporary code?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('temporary_access_codes')
        .update({ is_active: false })
        .eq('id', codeId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting temp code:', error);
      alert('Error deleting temporary code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pine-forest"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-rustic font-bold text-pine-forest mb-2">
          Admin Keyword Management
        </h1>
        <p className="text-pine-bark">
          Manage room keywords and temporary access codes for Pine Woods Campsite
        </p>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-pine-stone">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pine-bark">Total Rooms</p>
                <p className="text-2xl font-bold text-pine-forest">{stats.rooms.total}</p>
              </div>
              <div className="p-3 bg-pine-cream rounded-lg">
                <Users className="h-6 w-6 text-pine-forest" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-pine-stone">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pine-bark">Occupied</p>
                <p className="text-2xl font-bold text-pine-forest">{stats.rooms.occupied}</p>
              </div>
              <div className="p-3 bg-pine-cream rounded-lg">
                <Key className="h-6 w-6 text-pine-forest" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-pine-stone">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pine-bark">Pending Orders</p>
                <p className="text-2xl font-bold text-pine-forest">{stats.orders.pending}</p>
              </div>
              <div className="p-3 bg-pine-cream rounded-lg">
                <Clock className="h-6 w-6 text-pine-forest" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-pine-stone">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pine-bark">Active Temp Codes</p>
                <p className="text-2xl font-bold text-pine-forest">{stats.temp_codes.active}</p>
              </div>
              <div className="p-3 bg-pine-cream rounded-lg">
                <RefreshCw className="h-6 w-6 text-pine-forest" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setShowCreateRoom(true)}
          className="flex items-center space-x-2 bg-pine-forest text-white px-4 py-2 rounded-lg hover:bg-pine-sage transition-colors duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Room</span>
        </button>
        <button
          onClick={() => setShowCreateTempCode(true)}
          className="flex items-center space-x-2 bg-pine-sage text-white px-4 py-2 rounded-lg hover:bg-pine-moss transition-colors duration-200"
        >
          <Key className="h-5 w-5" />
          <span>Generate Temp Code</span>
        </button>
        <button
          onClick={loadData}
          className="flex items-center space-x-2 bg-pine-stone text-white px-4 py-2 rounded-lg hover:bg-pine-bark transition-colors duration-200"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-pine-forest mb-4">Create New Room</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pine-forest mb-1">Room Number</label>
                <input
                  type="text"
                  value={newRoom.room_number}
                  onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                  className="w-full px-3 py-2 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest"
                  placeholder="e.g., A101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pine-forest mb-1">Room Type</label>
                <input
                  type="text"
                  value={newRoom.room_type}
                  onChange={(e) => setNewRoom({ ...newRoom, room_type: e.target.value })}
                  className="w-full px-3 py-2 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest"
                  placeholder="e.g., Standard Queen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pine-forest mb-1">Max Guests</label>
                <input
                  type="number"
                  value={newRoom.max_guests}
                  onChange={(e) => setNewRoom({ ...newRoom, max_guests: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest"
                  min="1"
                  max="10"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createRoom}
                disabled={loading}
                className="flex-1 bg-pine-forest text-white py-2 rounded-lg hover:bg-pine-sage disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
              <button
                onClick={() => setShowCreateRoom(false)}
                className="flex-1 bg-pine-stone text-white py-2 rounded-lg hover:bg-pine-bark"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Temp Code Modal */}
      {showCreateTempCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-pine-forest mb-4">Generate Temporary Access Code</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pine-forest mb-1">Description</label>
                <input
                  type="text"
                  value={newTempCode.description}
                  onChange={(e) => setNewTempCode({ ...newTempCode, description: e.target.value })}
                  className="w-full px-3 py-2 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest"
                  placeholder="e.g., VIP Guest Access"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pine-forest mb-1">Expires In (Hours)</label>
                <input
                  type="number"
                  value={newTempCode.expires_in_hours}
                  onChange={(e) => setNewTempCode({ ...newTempCode, expires_in_hours: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest"
                  min="1"
                  max="168"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pine-forest mb-1">Max Uses</label>
                <input
                  type="number"
                  value={newTempCode.max_uses}
                  onChange={(e) => setNewTempCode({ ...newTempCode, max_uses: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-pine-stone rounded-lg focus:ring-2 focus:ring-pine-forest focus:border-pine-forest"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createTempCode}
                disabled={loading}
                className="flex-1 bg-pine-forest text-white py-2 rounded-lg hover:bg-pine-sage disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Code'}
              </button>
              <button
                onClick={() => setShowCreateTempCode(false)}
                className="flex-1 bg-pine-stone text-white py-2 rounded-lg hover:bg-pine-bark"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Table */}
      <div className="bg-white rounded-xl shadow-sm border border-pine-stone mb-8">
        <div className="p-6 border-b border-pine-stone">
          <h2 className="text-xl font-semibold text-pine-forest">Rooms & Keywords</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pine-cream">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Keyword</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Max Guests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pine-stone">
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pine-forest">
                    {room.room_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pine-bark">
                    {room.room_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-pine-cream px-2 py-1 rounded font-mono text-pine-forest">
                        {room.keyword}
                      </code>
                      <button
                        onClick={() => copyToClipboard(room.keyword)}
                        className="p-1 hover:bg-pine-sand rounded"
                      >
                        <Copy className="h-4 w-4 text-pine-forest" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={room.status}
                      onChange={(e) => updateRoomStatus(room.id, e.target.value)}
                      className={`text-sm px-2 py-1 rounded ${
                        room.status === 'occupied' 
                          ? 'bg-green-100 text-green-800' 
                          : room.status === 'vacant'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      <option value="vacant">Vacant</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pine-bark">
                    {room.max_guests}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pine-bark">
                    {new Date(room.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Temporary Codes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-pine-stone">
        <div className="p-6 border-b border-pine-stone">
          <h2 className="text-xl font-semibold text-pine-forest">Temporary Access Codes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pine-cream">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Uses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pine-forest uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pine-stone">
              {tempCodes.map((code) => (
                <tr key={code.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-pine-cream px-2 py-1 rounded font-mono text-pine-forest">
                        {code.code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(code.code)}
                        className="p-1 hover:bg-pine-sand rounded"
                      >
                        <Copy className="h-4 w-4 text-pine-forest" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pine-bark">
                    {code.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pine-bark">
                    {code.current_uses} / {code.max_uses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pine-bark">
                    {new Date(code.expires_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm px-2 py-1 rounded ${
                      code.is_active && new Date(code.expires_at) > new Date() && code.current_uses < code.max_uses
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {code.is_active && new Date(code.expires_at) > new Date() && code.current_uses < code.max_uses
                        ? 'Active'
                        : 'Expired/Used'
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => deleteTempCode(code.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminKeywordManager;
