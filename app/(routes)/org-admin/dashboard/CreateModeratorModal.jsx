'use client';

import React, { useState } from 'react';
import { 
  X, User, Mail, Phone, Lock, Eye, EyeOff, 
  Upload, Loader2, CheckCircle, AlertCircle, Shield
} from 'lucide-react';
import ImageCropper from '@/components/ImageCropper';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <Loader2 className="w-5 h-5 animate-spin text-white" />
    <span className="text-white">Creating...</span>
  </div>
);

export default function CreateModeratorModal({ isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [createdModerator, setCreatedModerator] = useState(null);

  const [moderatorData, setModeratorData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    profileImage: null,
    profileImageUrl: '',
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModeratorData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleProfileImageUploaded = (filePath, url) => {
    setModeratorData(prev => ({ ...prev, profileImageUrl: filePath }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!moderatorData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!moderatorData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(moderatorData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!moderatorData.password) {
      newErrors.password = 'Password is required';
    } else if (moderatorData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/organisation/moderators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: moderatorData.full_name,
          email: moderatorData.email,
          password: moderatorData.password,
          phone: moderatorData.phone,
          profile_pic_url: moderatorData.profileImageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCreatedModerator(data.moderator);
        setSuccess(true);
        if (onSuccess) onSuccess(data.moderator);
      } else {
        setErrors({ submit: data.message || 'Failed to create moderator' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsLoading(false);
    setErrors({});
    setSuccess(false);
    setCreatedModerator(null);
    setModeratorData({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      profileImage: null,
      profileImageUrl: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add Moderator</h2>
                <p className="text-sm text-blue-100">Create a new moderator account</p>
              </div>
            </div>
            {!success && (
              <button onClick={handleClose} className="text-white hover:bg-white/20 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {!success ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm">Moderator Permissions</h3>
                    <p className="text-xs text-blue-700 mt-1">
                      Moderators can manage users and content, but cannot modify organisation settings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <ImageCropper
                    onImageSelected={() => {}}
                    onImageUploaded={handleProfileImageUploaded}
                    title="Profile Picture"
                    description="Upload a profile picture (optional)"
                    autoUpload={true}
                    cropperSize={200}
                    required={false}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="full_name"
                        value={moderatorData.full_name}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter full name"
                      />
                    </div>
                    {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        name="email"
                        value={moderatorData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="moderator@example.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={moderatorData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Create a secure password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        name="phone"
                        value={moderatorData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">Moderator Created Successfully!</h3>
              <p className="text-gray-600 mb-6">
                The moderator account has been created and added to your organisation.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 mb-6">
                <h4 className="font-semibold text-blue-900 mb-3 text-sm">Credentials</h4>
                <div className="space-y-3 text-left">
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900">{createdModerator.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{createdModerator.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Password</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 bg-white/50 p-2 rounded">
                      {moderatorData.password}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800 text-left">
                    Share these credentials securely with the moderator. The password cannot be retrieved later.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          {!success ? (
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <span>Create Moderator</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}