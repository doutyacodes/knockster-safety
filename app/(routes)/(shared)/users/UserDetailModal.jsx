'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Phone, Calendar, Shield, 
  Smartphone, Clock, MapPin, Contact, Lock, 
  Globe, ShieldAlert, Users, Building, AlertCircle,
  CheckCircle, XCircle, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

const UserDetailModal = ({ user, onClose }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [user.id]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/moderator/users/${user.id}/details`);
      const data = await response.json();
      if (response.ok) {
        setUserDetails(data.user);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: 'Active'
        };
      case 'suspended':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: AlertCircle,
          label: 'Suspended'
        };
      case 'deleted':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          label: 'Deleted'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Shield,
          label: 'Unknown'
        };
    }
  };

  const renderSection = (title, icon, children) => (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center space-x-2 border-b pb-2">
        {React.createElement(icon, { className: "w-4 h-4 md:w-5 md:h-5 text-gray-600" })}
        <h3 className="font-semibold text-gray-900 text-sm md:text-base">{title}</h3>
      </div>
      {children}
    </div>
  );

  const renderDetailItem = (icon, label, value, isLink = false) => (
    <div className="flex items-start space-x-3 py-1.5 md:py-2">
      <div className="mt-0.5">
        {React.createElement(icon, { className: "w-4 h-4 text-gray-400 flex-shrink-0" })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        {isLink ? (
          <a 
            href={value.startsWith('http') ? value : `mailto:${value}`}
            className="text-sm text-blue-600 hover:text-blue-800 truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-gray-900 truncate">{value || 'Not provided'}</p>
        )}
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const info = getStatusInfo(status);
    const Icon = info.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {info.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-gray-600">Loading user details...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
      <div 
        className="bg-white rounded-xl md:rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 overflow-hidden flex items-center justify-center">
              {user.profile_pic_url ? (
                <img 
                  src={user.profile_pic_url} 
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">{user.full_name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <StatusBadge status={user.status} />
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  User
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column */}
            <div className="space-y-6 md:space-y-8">
              {/* Basic Information */}
              {renderSection(User, 'Basic Information',
                <>
                  {renderDetailItem(Mail, 'Email Address', user.email, true)}
                  {renderDetailItem(Phone, 'Phone Number', user.phone)}
                  {renderDetailItem(Calendar, 'Joined Date', 
                    user.created_at ? format(new Date(user.created_at), 'PPP') : 'Unknown')}
                  {renderDetailItem(Globe, 'Timezone', user.timezone || 'UTC')}
                </>
              )}

              {/* Profile Information */}
              {renderSection(Contact, 'Profile Information',
                <>
                  {renderDetailItem(User, 'Full Name', user.full_name)}
                  {renderDetailItem(Smartphone, 'Profile Picture URL', 
                    user.profile_pic_url ? 'Uploaded' : 'Not provided')}
                  {renderDetailItem(Shield, 'User ID', user.id)}
                </>
              )}

              {/* Security */}
              {renderSection(Lock, 'Security',
                <>
                  {renderDetailItem(ShieldAlert, 'Safe PIN', 
                    user.safe_pin_hash ? 'Set' : 'Not set')}
                  {renderDetailItem(ShieldAlert, 'Danger PIN', 
                    user.danger_pin_hash ? 'Set' : 'Not set')}
                  {renderDetailItem(Calendar, 'Last Updated', 
                    user.updated_at ? format(new Date(user.updated_at), 'PPP') : 'Never')}
                </>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6 md:space-y-8">
              {/* Emergency Contacts */}
              {renderSection(AlertCircle, 'Emergency Contacts',
                <>
                  {renderDetailItem(User, 'Emergency Contact Name', 
                    user.emergency_contact_name)}
                  {renderDetailItem(Phone, 'Emergency Contact Phone', 
                    user.emergency_contact_phone)}
                </>
              )}

              {/* Organisation */}
              {renderSection(Building, 'Organisation',
                <>
                  {renderDetailItem(Users, 'Organisation', 
                    userDetails?.organisation?.name)}
                  {renderDetailItem(MapPin, 'Organisation Address', 
                    userDetails?.organisation?.address)}
                  {renderDetailItem(Calendar, 'Joined Organisation', 
                    userDetails?.org_joined_at ? 
                    format(new Date(userDetails.org_joined_at), 'PPP') : 'Unknown')}
                  {renderDetailItem(Shield, 'Organisation Role', 'User')}
                </>
              )}

              {/* Safety Timings */}
              {renderSection(Clock, 'Safety Timings',
                <>
                  {userDetails?.safety_timings?.length > 0 ? (
                    <div className="space-y-2">
                      {userDetails.safety_timings.map((timing, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm text-gray-900">{timing.label}</p>
                            <p className="text-xs text-gray-500">
                              {timing.time} • {timing.active_days?.length || 0} days/week
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            timing.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {timing.is_active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-2">No safety timings configured</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 md:px-6 md:py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm md:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;