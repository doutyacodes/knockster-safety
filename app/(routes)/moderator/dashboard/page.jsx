'use client';

import { useState, useEffect } from 'react';
import { AlertTable } from '@/components/AlertTable';
import { StatCard } from '@/components/StatCard';
import { BellAlertIcon, ExclamationTriangleIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Bell, AlertTriangle, Clock, CheckCircle, RefreshCw, AlertCircle, Calendar, Users } from 'lucide-react';

export default function ModeratorDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/moderator/alerts/active');
      const data = await response.json();
      
      if (response.ok) {
        setAlerts(data.alerts);
        const critical = data.alerts.filter(a => a.priority === 'critical').length;
        const high = data.alerts.filter(a => a.priority === 'high').length;
        const medium = data.alerts.filter(a => a.priority === 'medium').length;
        
        setStats({
          total: data.total,
          critical,
          high,
          medium,
        });
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Bell className="w-7 h-7 text-white" />
              </div>
              Moderator Dashboard
            </h1>
            <p className="text-gray-600 mt-2 ml-14">Monitor and manage safety alerts in real-time</p>
          </div>

          <button
            onClick={fetchAlerts}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Active Alerts"
            value={stats.total}
            icon={Bell}
            color="blue"
            trend={stats.total > 0 ? 'up' : 'stable'}
          />
          <StatCard
            title="Critical"
            value={stats.critical}
            icon={AlertTriangle}
            color="red"
            trend={stats.critical > 0 ? 'up' : 'stable'}
          />
          <StatCard
            title="High Priority"
            value={stats.high}
            icon={AlertCircle}
            color="orange"
          />
          <StatCard
            title="Medium Priority"
            value={stats.medium}
            icon={Clock}
            color="yellow"
          />
        </div>

        {/* Priority Legend */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
            Priority Legend
          </h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-700 font-medium">Critical (Danger Pin)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-700 font-medium">High (3+ Snoozes)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-700 font-medium">Medium (1-2 Snoozes)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-gray-700 font-medium">Low (Pending)</span>
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-indigo-600" />
              Active Alerts
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Sorted by priority (critical first)
            </p>
          </div>
          <div className="p-6">
            {alerts.length > 0 ? (
              <AlertTable alerts={alerts} />
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No active alerts</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                  All users are safe. You will see alerts here when safety check-ins are missed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Moderator Guidelines
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Critical alerts require immediate attention</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Call users after 3 snoozes if no response</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Log all call attempts in the system</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Escalate to police/contacts if danger is confirmed</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Mark alerts as resolved when situation is handled</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}