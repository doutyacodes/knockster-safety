'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Users, Mail, Phone, MoreVertical, 
  Edit, Trash2, Eye, RefreshCw, Loader2, Shield, CheckCircle, 
  XCircle, Calendar, ArrowUpDown, User
} from 'lucide-react';
import CreateModeratorModal from './CreateModeratorModal';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
    <span className="text-gray-600">Loading...</span>
  </div>
);

const ModeratorRow = ({ moderator, onView, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 overflow-hidden flex items-center justify-center">
            {moderator.profile_pic_url ? (
              <img 
                src={moderator.profile_pic_url} 
                alt={moderator.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{moderator.full_name}</h4>
            <p className="text-sm text-gray-500">{moderator.email}</p>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-6">
        <div className="flex items-center">
          <Mail className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">{moderator.email}</span>
        </div>
      </td>
      
      <td className="py-4 px-6">
        {moderator.phone ? (
          <div className="flex items-center">
            <Phone className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">{moderator.phone}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Not provided</span>
        )}
      </td>
      
      <td className="py-4 px-6">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${moderator.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={`text-sm font-medium ${moderator.is_active ? 'text-green-600' : 'text-gray-500'}`}>
            {moderator.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </td>
      
      <td className="py-4 px-6">
        <span className="text-sm text-gray-600">
          {new Date(moderator.created_at).toLocaleDateString()}
        </span>
      </td>
      
      <td className="py-4 px-6">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showActions && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowActions(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
                <button
                  onClick={() => {
                    onView(moderator);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    onEdit(moderator);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(moderator);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-3"
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

export default function ModeratorsPage() {
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchModerators();
  }, []);

  const fetchModerators = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/organisation/moderators');
      const data = await response.json();
      if (response.ok) {
        setModerators(data.moderators || []);
      }
    } catch (error) {
      console.error('Error fetching moderators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModerator = (newModerator) => {
    setModerators([newModerator, ...moderators]);
  };

  const handleDeleteModerator = async (moderator) => {
    if (!confirm(`Are you sure you want to delete "${moderator.full_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/organisation/moderators/${moderator.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setModerators(moderators.filter(m => m.id !== moderator.id));
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete moderator');
      }
    } catch (error) {
      console.error('Error deleting moderator:', error);
      alert('Failed to delete moderator');
    }
  };

  const handleEditModerator = (moderator) => {
    // Open edit modal or redirect to edit page
    alert(`Edit ${moderator.full_name}`);
  };

  const handleViewModerator = (moderator) => {
    // Navigate to moderator details page
    window.location.href = `/organisation/moderators/${moderator.id}`;
  };

  const filteredModerators = moderators?.filter(moderator => {
    return moderator?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           moderator?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           moderator?.phone?.includes(searchQuery);
  });

  const sortedModerators = [...filteredModerators].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.full_name.localeCompare(b.full_name);
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
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Moderators</h1>
              <p className="text-gray-600 mt-1">Manage moderators in your organisation</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Add Moderator</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search moderators by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-5 h-5 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              <button
                onClick={fetchModerators}
                className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{sortedModerators.length}</span> moderators
              </p>
            </div>

            {/* Moderators Table */}
            {sortedModerators.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Phone</th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Created</th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedModerators.map(moderator => (
                      <ModeratorRow
                        key={moderator.id}
                        moderator={moderator}
                        onView={handleViewModerator}
                        onEdit={handleEditModerator}
                        onDelete={handleDeleteModerator}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No matching moderators' : 'No moderators yet'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? 'Try adjusting your search to find what you\'re looking for.'
                    : 'Get started by adding your first moderator.'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add First Moderator</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Moderator Modal */}
      <CreateModeratorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateModerator}
      />
    </div>
  );
}