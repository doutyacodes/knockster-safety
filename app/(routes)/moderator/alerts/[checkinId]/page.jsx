'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertBadge } from '@/components/AlertBadge';
import { Timeline } from '@/components/Timeline';
import { CallLogModal } from '@/components/CallLogModal';
import { 
  PhoneIcon, 
  ShieldExclamationIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function AlertDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  useEffect(() => {
    if (params.checkinId) {
      fetchAlertDetails();
    }
  }, [params.checkinId]);

  const fetchAlertDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/moderator/alerts/${params.checkinId}`);
      const data = await response.json();
      
      if (response.ok) {
        setAlert(data.alert);
      }
    } catch (error) {
      console.error('Error fetching alert details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogCall = async (checkinId, callStatus, notes) => {
    try {
      const response = await fetch(`/api/moderator/alerts/${checkinId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call_status: callStatus, notes }),
      });

      if (response.ok) {
        await fetchAlertDetails(); // Refresh data
      }
    } catch (error) {
      throw error;
    }
  };

  const handleEscalate = async (escalationType) => {
    if (!confirm(`Are you sure you want to escalate to ${escalationType}?`)) {
      return;
    }

    try {
      setIsEscalating(true);
      const response = await fetch(`/api/moderator/alerts/${params.checkinId}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escalation_type: escalationType }),
      });

      if (response.ok) {
        alert(`Escalated to ${escalationType} successfully`);
        await fetchAlertDetails();
      }
    } catch (error) {
      console.error('Error escalating:', error);
      alert('Failed to escalate. Please try again.');
    } finally {
      setIsEscalating(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!confirm('Mark this alert as resolved?')) {
      return;
    }

    try {
      const response = await fetch(`/api/moderator/alerts/${params.checkinId}`, {
        method: 'PUT',
      });

      if (response.ok) {
        alert('Alert marked as resolved');
        router.push('/moderator/dashboard');
      }
    } catch (error) {
      console.error('Error marking as resolved:', error);
      alert('Failed to mark as resolved. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alert details...</p>
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-900">Alert not found</h2>
        <button
          onClick={() => router.push('/moderator/dashboard')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Go back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/moderator/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alert Details</h1>
            <p className="text-gray-600 mt-1">Handle safety alert #{params.checkinId}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <AlertBadge type={alert.badge?.type} />
          
          {alert.checkin.status !== 'resolved' && (
            <button
              onClick={handleMarkResolved}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Mark as Resolved
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Summary Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">User Summary</h2>
            
            <div className="flex items-start space-x-4">
              {alert.user.profile_pic_url ? (
                <img
                  src={alert.user.profile_pic_url}
                  alt={alert.user.full_name}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-600">
                    {alert.user.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{alert.user.full_name}</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {alert.user.phone || 'No phone number'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                    {alert.organisation.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Email: {alert.user.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            {alert.user.emergency_contact_name && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Emergency Contact</h4>
                <div className="bg-yellow-50 border border-yellow-100 rounded p-3">
                  <div className="font-medium text-yellow-800">{alert.user.emergency_contact_name}</div>
                  <div className="text-sm text-yellow-700 mt-1">{alert.user.emergency_contact_phone}</div>
                </div>
              </div>
            )}

            {/* Alert Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Alert Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Alert Time:</span>
                  <span className="font-medium">
                    {new Date(alert.checkin.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled Time:</span>
                  <span className="font-medium">
                    {alert.timing?.label}: {alert.checkin.scheduled_time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Snooze Count:</span>
                  <span className="font-medium">{alert.checkin.snooze_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <span className="font-medium capitalize">{alert.checkin.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Action Panel and Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Action Panel</h2>
            
            {/* Call User Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">1. Contact User</h3>
              <button
                onClick={() => setIsCallModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                Call User
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Log the outcome after calling the user. This creates a record in the call logs.
              </p>
            </div>

            {/* Escalation Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">2. Escalation Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleEscalate('police')}
                  disabled={isEscalating}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  <ShieldExclamationIcon className="h-4 w-4 mr-2" />
                  Alert Police
                </button>
                
                <button
                  onClick={() => handleEscalate('family')}
                  disabled={isEscalating}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Alert Contacts
                </button>
                
                <button
                  onClick={() => handleEscalate('admin')}
                  disabled={isEscalating}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  Alert Admin
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Use these buttons to escalate the situation when danger is confirmed.
              </p>
            </div>

            {/* Status Info */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Current Status</h4>
              <p className="text-sm text-gray-600">
                {alert.checkin.status === 'acknowledged_danger' ? (
                  "⚠️ User is in danger. Please escalate to appropriate authorities."
                ) : alert.checkin.status === 'snoozed' ? (
                  `⏰ Waiting for user response. ${alert.checkin.snooze_count} snooze(s) sent.`
                ) : alert.checkin.status === 'resolved' ? (
                  "✅ Alert has been resolved."
                ) : (
                  "🔄 Alert is pending moderator action."
                )}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Alert Timeline</h2>
            {alert.timeline && alert.timeline.length > 0 ? (
              <Timeline events={alert.timeline} />
            ) : (
              <p className="text-gray-500 text-sm">No timeline events recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Call Log Modal */}
      <CallLogModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onLogCall={handleLogCall}
        checkinId={params.checkinId}
      />
    </div>
  );
}