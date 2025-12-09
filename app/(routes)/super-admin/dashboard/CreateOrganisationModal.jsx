'use client';

import React, { useState } from 'react';
import { 
  X, Building2, User, Mail, Phone, MapPin, Lock, Eye, EyeOff, 
  Upload, Loader2, CheckCircle, AlertCircle, Shield, Globe,
  ArrowRight
} from 'lucide-react';
import ImageCropper from '@/components/ImageCropper';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <Loader2 className="w-5 h-5 animate-spin text-white" />
    <span className="text-white">Creating...</span>
  </div>
);

export default function CreateOrganisationModal({ isOpen, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Step 1: Organisation Details
  const [orgData, setOrgData] = useState({
    name: '',
    type: '',
    address: '',
    contact_email: '',
    contact_phone: '',
    profileImage: null,
    profileImageUrl: '',
  });

  // Step 2: Admin User Details
  const [adminData, setAdminData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
  });

  if (!isOpen) return null;

  const handleOrgInputChange = (e) => {
    const { name, value } = e.target;
    setOrgData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleProfileImageSelected = (file, previewUrl) => {
    setOrgData(prev => ({ ...prev, profileImage: file }));
  };

  const handleProfileImageUploaded = (filePath, url) => {
    setOrgData(prev => ({ ...prev, profileImageUrl: filePath }));
    if (errors.profileImage) setErrors(prev => ({ ...prev, profileImage: '' }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!orgData.name.trim()) newErrors.name = 'Organisation name is required';
    if (!orgData.contact_email.trim()) newErrors.contact_email = 'Contact email is required';
    if (!orgData.profileImageUrl) newErrors.profileImage = 'Organisation logo is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!adminData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!adminData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminData.email)) newErrors.email = 'Invalid email';
    if (!adminData.password) newErrors.password = 'Password is required';
    else if (adminData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else {
      if (!validateStep2()) return;

      setIsLoading(true);
      try {
        const response = await fetch('/api/super-admin/organisations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organisation: {
              name: orgData.name,
              type: orgData.type,
              address: orgData.address,
              contact_email: orgData.contact_email,
              contact_phone: orgData.contact_phone,
              profile_pic_url: orgData.profileImageUrl,
            },
            admin: adminData
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setCreatedCredentials({
            organisation: data.organisation,
            admin: data.admin
          });
          setSuccess(true);
          if (onSuccess) onSuccess(data.organisation);
        } else {
          setErrors({ submit: data.message || 'Failed to create organisation' });
        }
      } catch (error) {
        setErrors({ submit: 'Network error. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setIsLoading(false);
    setErrors({});
    setSuccess(false);
    setCreatedCredentials(null);
    setOrgData({
      name: '',
      type: '',
      address: '',
      contact_email: '',
      contact_phone: '',
      profileImage: null,
      profileImageUrl: '',
    });
    setAdminData({
      full_name: '',
      email: '',
      password: '',
      phone: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create Organisation</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-white' : 'text-blue-200'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-white text-blue-600' : 'border border-blue-300'}`}>
                      {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
                    </div>
                    <span className="text-sm font-medium">Organisation</span>
                  </div>
                  <div className="w-8 h-0.5 bg-blue-400" />
                  <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-white' : 'text-blue-200'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-white text-blue-600' : 'border border-blue-300'}`}>
                      {currentStep > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
                    </div>
                    <span className="text-sm font-medium">Admin</span>
                  </div>
                  <div className="w-8 h-0.5 bg-blue-400" />
                  <div className={`flex items-center space-x-2 ${currentStep === 3 ? 'text-white' : 'text-blue-200'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep === 3 ? 'bg-white text-blue-600' : 'border border-blue-300'}`}>
                      3
                    </div>
                    <span className="text-sm font-medium">Complete</span>
                  </div>
                </div>
              </div>
            </div>
            {!success && (
              <button onClick={handleClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Step 1: Organisation Details */}
          {currentStep === 1 && !success && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Building2 className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Organisation Information</h3>
                    <p className="text-sm text-blue-700">Enter basic details about the organisation</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <ImageCropper
                    onImageSelected={handleProfileImageSelected}
                    onImageUploaded={handleProfileImageUploaded}
                    title="Organisation Logo"
                    description="Upload a logo for the organisation (required)"
                    autoUpload={true}
                    cropperSize={300}
                    required={true}
                  />
                  {errors.profileImage && (
                    <p className="mt-2 text-sm text-red-600">{errors.profileImage}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organisation Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={orgData.name}
                      onChange={handleOrgInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter organisation name"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organisation Type
                  </label>
                  <select
                    name="type"
                    value={orgData.type}
                    onChange={handleOrgInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select type (optional)</option>
                    <option value="school">School</option>
                    <option value="it_company">IT Company</option>
                    <option value="mall">Mall</option>
                    <option value="hospital">Hospital</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      name="address"
                      value={orgData.address}
                      onChange={handleOrgInputChange}
                      rows={2}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Enter organisation address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="contact_email"
                      value={orgData.contact_email}
                      onChange={handleOrgInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contact_email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="contact@organisation.com"
                    />
                  </div>
                  {errors.contact_email && <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="contact_phone"
                      value={orgData.contact_phone}
                      onChange={handleOrgInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Admin Details */}
          {currentStep === 2 && !success && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Administrator Account</h3>
                    <p className="text-sm text-green-700">
                      Create an admin account for this organisation. This user will have full access.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-900">{orgData.name}</h4>
                        {orgData.type && (
                          <p className="text-sm text-blue-700">Type: {orgData.type}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="full_name"
                      value={adminData.full_name}
                      onChange={handleAdminInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter admin's full name"
                    />
                  </div>
                  {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={adminData.email}
                      onChange={handleAdminInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="admin@email.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={adminData.password}
                      onChange={handleAdminInputChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Create a secure password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={adminData.phone}
                      onChange={handleAdminInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {success && createdCredentials && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Organisation Created Successfully!</h3>
              <p className="text-gray-600 mb-8">
                The organisation and admin account have been created.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>Organisation Details</span>
                  </h4>
                  <div className="space-y-3 text-left">
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Name</p>
                      <p className="font-semibold text-gray-900">{createdCredentials.organisation.name}</p>
                    </div>
                    {createdCredentials.organisation.type && (
                      <div>
                        <p className="text-xs text-blue-600 mb-1">Type</p>
                        <p className="font-semibold text-gray-900">{createdCredentials.organisation.type}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Contact Email</p>
                      <p className="font-semibold text-gray-900">{createdCredentials.organisation.contact_email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <h4 className="font-semibold text-green-900 mb-4 flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Admin Credentials</span>
                  </h4>
                  <div className="space-y-3 text-left">
                    <div>
                      <p className="text-xs text-green-600 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900">{createdCredentials.admin.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">{createdCredentials.admin.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 mb-1">Password</p>
                      <p className="font-mono text-sm font-semibold text-gray-900 bg-white/50 p-2 rounded">
                        {adminData.password}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-semibold text-yellow-900 mb-1">Important Note</h4>
                    <p className="text-sm text-yellow-800">
                      Share these credentials securely with the organisation admin. The password cannot be retrieved later.
                      The admin should login and complete their profile setup.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          {!success ? (
            <div className="flex justify-between">
              {currentStep === 1 ? (
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Back
                </button>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={isLoading || (currentStep === 1 && !orgData.profileImageUrl)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <LoadingSpinner />
                ) : currentStep === 1 ? (
                  <>
                    <span>Continue to Admin Setup</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <span>Create Organisation</span>
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.href = `/admin/organisations/${createdCredentials.organisation.id}`}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium"
              >
                View Organisation
              </button>
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}