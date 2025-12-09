'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Users, Mail, Phone, MoreVertical, 
  Trash2, Eye, RefreshCw, Loader2, User, Shield, Calendar, 
  ArrowUpDown, CheckCircle, XCircle, Smartphone, Clock, 
  ShieldAlert, AlertCircle, MapPin, Contact, Lock, Globe
} from 'lucide-react';
import CreateUserModal from './CreateUserModal';
import UserDetailModal from './UserDetailModal';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
    <span className="text-gray-600">Loading...</span>
  </div>
);

const StatusToggle = ({ status, userId, onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!confirm(`Are you sure you want to ${status === 'active' ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await onToggle(userId, status === 'active' ? 'suspended' : 'active');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        status === 'active' ? 'bg-green-600' : 'bg-gray-300'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          status === 'active' ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-3 h-3 animate-spin text-white" />
        </div>
      )}
    </button>
  );
};

const UserRow = ({ user, onView, onDelete, onStatusToggle }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full inline-flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
            Active
          </span>
        );
      case 'suspended':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full inline-flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Suspended
          </span>
        );
      case 'deleted':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full inline-flex items-center">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Deleted
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4 md:px-6">
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 overflow-hidden flex items-center justify-center">
            {user.profile_pic_url ? (
              <img 
                src={user.profile_pic_url} 
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm md:text-base">{user.full_name}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                User
              </span>
            </div>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4 md:px-6">
        <div className="flex items-center">
          <Mail className="w-4 h-4 text-gray-400 mr-2 hidden sm:block" />
          <span className="text-sm text-gray-600 truncate max-w-[150px] md:max-w-none">{user.email}</span>
        </div>
      </td>
      
      <td className="py-4 px-4 md:px-6">
        {user.phone ? (
          <div className="flex items-center">
            <Phone className="w-4 h-4 text-gray-400 mr-2 hidden sm:block" />
            <span className="text-sm text-gray-600">{user.phone}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      
      <td className="py-4 px-4 md:px-6">
        <div className="flex flex-col space-y-2">
          <div>{getStatusBadge(user.status)}</div>
          <StatusToggle 
            status={user.status} 
            userId={user.id} 
            onToggle={onStatusToggle}
          />
        </div>
      </td>
      
      <td className="py-4 px-4 md:px-6">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-gray-400 mr-2 hidden sm:block" />
          <span className="text-sm text-gray-600">
            {new Date(user.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
      </td>
      
      <td className="py-4 px-4 md:px-6">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showActions && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowActions(false)}
              />
              <div className="absolute right-0 mt-2 w-36 md:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
                <button
                  onClick={() => {
                    onView(user);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 md:px-4 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2 md:space-x-3 text-sm md:text-base"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${user.full_name}"? This action cannot be undone.`)) {
                      onDelete(user);
                    }
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 md:px-4 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2 md:space-x-3 text-sm md:text-base"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    deleted: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/moderator/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/moderator/users/stats');
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateUser = (newUser) => {
    setUsers([newUser, ...users]);
    fetchStats();
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Are you sure you want to permanently delete "${user.full_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/moderator/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== user.id));
        fetchStats();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleStatusToggle = async (userId, newStatus) => {
    try {
      const response = await fetch(`/api/moderator/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
        fetchStats();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update status');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone?.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || 
                         user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.full_name || '').localeCompare(b.full_name || '');
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Manage users in your organisation</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Total Users</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg">
                  <Users className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Active</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
                <div className="p-1.5 md:p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Suspended</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.suspended}</p>
                </div>
                <div className="p-1.5 md:p-2 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 md:w-6 md:h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Deleted</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.deleted}</p>
                </div>
                <div className="p-1.5 md:p-2 bg-red-50 rounded-lg">
                  <XCircle className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
                </div>
              </div>
            </div> */}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center justify-between">
            <div className="relative flex-1 max-w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500 hidden md:block" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 md:px-4 md:py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4 text-gray-500 hidden md:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 md:px-4 md:py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              <button
                onClick={() => {
                  fetchUsers();
                  fetchStats();
                }}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4 md:px-6 md:py-6">
        {loading ? (
          <div className="flex items-center justify-center h-48 md:h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-4 md:mb-6">
              <p className="text-gray-600 text-sm md:text-base">
                Showing <span className="font-semibold text-gray-900">{sortedUsers.length}</span> user{sortedUsers.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Users Table */}
            {sortedUsers.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-900">User</th>
                      <th className="py-3 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-900">Email</th>
                      <th className="py-3 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-900">Phone</th>
                      <th className="py-3 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-900">Status</th>
                      <th className="py-3 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-900">Joined</th>
                      <th className="py-3 px-4 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.map(user => (
                      <UserRow
                        key={user.id}
                        user={user}
                        onView={handleViewUser}
                        onDelete={handleDeleteUser}
                        onStatusToggle={handleStatusToggle}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 md:p-12 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <Users className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No matching users' : 'No users yet'}
                </h3>
                <p className="text-gray-600 mb-4 md:mb-6 max-w-md mx-auto text-sm md:text-base">
                  {searchQuery 
                    ? 'Try adjusting your search or filters.'
                    : 'Get started by adding your first user.'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-2 md:px-8 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 font-medium text-sm md:text-base"
                  >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Add First User</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateUser}
      />

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}