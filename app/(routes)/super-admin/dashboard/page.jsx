'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Building2, Users, Mail, Phone, MapPin, 
  MoreVertical, Edit, Trash2, Eye, Download, RefreshCw,
  Shield, CheckCircle, XCircle, Loader2, Calendar, ArrowUpDown
} from 'lucide-react';
import CreateOrganisationModal from './CreateOrganisationModal';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
    <span className="text-gray-600">Loading...</span>
  </div>
);

const OrganisationCard = ({ organisation, onView, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-200 group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border border-blue-200 flex items-center justify-center">
              {organisation.profile_pic_url ? (
                <img 
                  src={organisation.profile_pic_url} 
                  alt={organisation.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {organisation.name}
              </h3>
              {organisation.type && (
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mt-1">
                  {organisation.type}
                </span>
              )}
            </div>
          </div>
          
          {/* Actions Dropdown */}
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
                      onView(organisation);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => {
                      onEdit(organisation);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(organisation);
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
        </div>

        {/* Details */}
        <div className="space-y-3">
          {organisation.contact_email && (
            <div className="flex items-center text-gray-600">
              <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="text-sm truncate">{organisation.contact_email}</span>
            </div>
          )}
          
          {organisation.contact_phone && (
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="text-sm">{organisation.contact_phone}</span>
            </div>
          )}
          
          {organisation.address && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="text-sm truncate">{organisation.address}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {organisation.member_count || 0} members
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(organisation.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-600">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OrganisationsPage() {
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrganisation, setSelectedOrganisation] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    schools: 0,
    itCompanies: 0,
    malls: 0,
    others: 0
  });

  useEffect(() => {
    fetchOrganisations();
    fetchStats();
  }, []);

  const fetchOrganisations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/super-admin/organisations');
      const data = await response.json();
      if (response.ok) {
        setOrganisations(data.organisations || []);
      }
    } catch (error) {
      console.error('Error fetching organisations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/super-admin/organisations/stats');
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateOrganisation = (newOrg) => {
    setOrganisations([newOrg, ...organisations]);
    fetchStats(); // Refresh stats
  };

  const handleDeleteOrganisation = async (org) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/super-admin/organisations/${org.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrganisations(organisations.filter(o => o.id !== org.id));
        fetchStats();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete organisation');
      }
    } catch (error) {
      console.error('Error deleting organisation:', error);
      alert('Failed to delete organisation');
    }
  };

  const handleEditOrganisation = (org) => {
    // Open edit modal or redirect to edit page
    alert(`Edit ${org.name}`);
  };

  const handleViewOrganisation = (org) => {
    // Navigate to organisation details page
    window.location.href = `/admin/organisations/${org.id}`;
  };

  const filteredOrganisations = organisations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.contact_phone?.includes(searchQuery);
    
    const matchesFilter = filterType === 'all' || org.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const sortedOrganisations = [...filteredOrganisations].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      default:
        return 0;
    }
  });

  const organisationTypes = ['all', ...new Set(organisations.map(org => org.type).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organisations</h1>
              <p className="text-gray-600 mt-1">Manage and oversee all organisations in the system</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>New Organisation</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Organisations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Schools</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.schools}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">IT Companies</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.itCompanies}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Malls</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.malls}</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Others</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.others}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Active</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.active}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search organisations by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {organisationTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </option>
                  ))}
                </select>
              </div>

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
                onClick={fetchOrganisations}
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
      <div className="px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{sortedOrganisations.length}</span> organisations
              </p>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>

            {/* Organisations Grid */}
            {sortedOrganisations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedOrganisations.map(organisation => (
                  <OrganisationCard
                    key={organisation.id}
                    organisation={organisation}
                    onView={handleViewOrganisation}
                    onEdit={handleEditOrganisation}
                    onDelete={handleDeleteOrganisation}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Building2 className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No matching organisations' : 'No organisations yet'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'Get started by creating your first organisation.'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 inline-flex items-center space-x-2 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create First Organisation</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Organisation Modal */}
      <CreateOrganisationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateOrganisation}
      />
    </div>
  );
}