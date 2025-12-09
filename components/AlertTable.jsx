'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle, RefreshCw, AlertCircle, Calendar, Users } from 'lucide-react';


export function AlertTable({ alerts }) {
  const getStatusColor = (alert) => {
    switch (alert.statusColor) {
      case 'red': return 'text-red-700 bg-red-100 border-red-300';
      case 'orange': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'yellow': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      default: return 'text-blue-700 bg-blue-100 border-blue-300';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': 
        return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>;
      case 'high': 
        return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>;
      case 'medium': 
        return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500">
          <Clock className="w-5 h-5 text-white" />
        </div>;
      default: 
        return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300">
          <Bell className="w-5 h-5 text-white" />
        </div>;
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Priority
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Alert Type
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Time
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {alerts.map((alert) => (
            <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                {getPriorityIcon(alert.priority)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {alert.profile_pic_url ? (
                    <img
                      className="h-10 w-10 rounded-full mr-3 ring-2 ring-gray-200"
                      src={alert.profile_pic_url}
                      alt={alert.full_name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mr-3 ring-2 ring-gray-200">
                      <span className="text-sm font-semibold text-white">
                        {alert.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{alert.full_name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {alert.organisation_name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{alert.alertDisplay}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {alert.scheduled_time}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`
                  inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border
                  ${getStatusColor(alert)}
                `}>
                  {alert.statusText}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {alert.timeAgo}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => window.location.href = `/moderator/alerts/${alert.id}`}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}