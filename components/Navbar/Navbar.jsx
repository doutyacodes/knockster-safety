"use client"

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ShieldAlert, 
  Building2, 
  User, 
  LogOut, 
  Settings, 
  Users, 
  Bell, 
  Phone,
  Layout,
  Loader2,
  UserPlus,
  Shield,
  UserCog,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // State for Real Data
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch User Data on Mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/me'); 
        
        if (response.status === 401) {
          setError("Unauthorized");
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        if (data.user) {
          setUserData(data.user);
        } else {
          setError("Failed to load user data");
        }
      } catch (err) {
        console.error("Error fetching user session:", err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

    const handleLogout = async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          localStorage.clear();
          window.location.href = "/auth/login";
        } else {
          console.error("Logout failed");
        }
      } catch (err) {
        console.error("Logout error:", err);
      }
    };

  // Helper to determine user role
  const isSuperAdmin = userData?.role?.name === 'super_admin';
  const isOrgAdmin = userData?.role?.name === 'org_admin';
  const isModerator = userData?.role?.name === 'moderator';
  

    // dashboard path based on role
  let dashboardPath = "/login";
  if (isSuperAdmin) dashboardPath = "/super-admin/dashboard";
  else if (isOrgAdmin) dashboardPath = "/org-admin/dashboard";
  else if (isModerator) dashboardPath = "/moderator/dashboard";

  // --- LOADING STATE ---
  if (loading) {
    return (
      <nav className="h-20 bg-white border-b border-gray-200 flex items-center justify-center fixed w-full top-0 z-50">
        <div className="flex items-center gap-2 text-indigo-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="font-medium text-slate-600">Loading Admin Portal...</span>
        </div>
      </nav>
    );
  }

  // --- ERROR STATE ---
  if (error || !userData) {
    return (
      <nav className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 fixed w-full top-0 z-50">
        <span className="font-bold text-slate-800 text-xl">Knockster</span>
        <a href="/login" className="text-sm text-indigo-600 font-medium hover:underline">Please Log In</a>
      </nav>
    );
  }

  return (
    <div className="bg-gray-50 font-sans text-slate-800">
      {/* --- NAVBAR START --- */}
      <nav className="bg-white/95 backdrop-blur-sm border-t-4 border-t-indigo-600 border-b border-gray-200 shadow-sm fixed w-full top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center relative">
            {/* LEFT: App Logo - Pushed to far left */}
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-md group-hover:bg-indigo-700 transition-colors">
                <ShieldAlert className="h-7 w-7 text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">Knockster</h1>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider w-fit mt-0.5">
                  {userData.role?.display_name || 'Admin Portal'}
                </span>
              </div>
            </div>

            {/* MIDDLE: Spacer - Allows right section to push to far right */}
            <div className="flex-1"></div>

            {/* RIGHT: User Actions & Profile - Pushed to far right */}
            <div className="hidden md:flex items-center justify-end gap-4 dropdown-container">

              {/* Notification Bell */}
              <div className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-full cursor-pointer transition-colors group">
                <Bell className="h-6 w-6 group-hover:text-indigo-600 transition-colors" />
                <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </div>

              <div className="h-8 w-px bg-slate-200"></div>

              {/* User Profile Dropdown Trigger */}
              <div className="relative dropdown-container">
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-3 focus:outline-none hover:bg-slate-50 p-1.5 pl-3 rounded-full border border-transparent hover:border-slate-200 transition-all"
                >
                  {/* Avatar: Check if profile_pic_url exists, else use initials */}
                  {userData.profile?.profile_pic_url ? (
                    <img
                      src={userData.profile.profile_pic_url}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-100"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white shadow-sm">
                      {userData.profile?.full_name?.charAt(0) || userData.email?.charAt(0) || "U"}
                    </div>
                  )}

                  <div className="text-right leading-tight pr-1">
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[120px]">{userData.profile?.full_name || "User"}</p>
                    <p className="text-xs text-slate-500 font-medium truncate max-w-[120px]">
                      {userData.role?.display_name}
                    </p>
                  </div>

                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 transform transition-all origin-top-right z-50">
                    {/* Profile Header */}
                    <div className="px-5 py-4 border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        {userData.profile?.profile_pic_url ? (
                          <img
                            src={userData.profile.profile_pic_url}
                            alt="Profile"
                            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {userData.profile?.full_name?.charAt(0) || userData.email?.charAt(0) || "U"}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-800 truncate">{userData.profile?.full_name}</p>
                          <p className="text-xs text-slate-500 truncate">{userData.email}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                              {userData.role?.display_name}
                            </span>
                            {userData.organisation && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 truncate max-w-[100px]">
                                {userData.organisation.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-2 py-2">
                      <Link href={dashboardPath} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors">
                        <Layout className="h-4 w-4" /> Dashboard
                      </Link>

                      {/* Uncomment later if needed
                      <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors">
                        <Settings className="h-4 w-4" /> Account Settings
                      </Link>
                      */}
                    </div>

                    {/* Sign Out Section */}
                    <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                      <a
                        onClick={() => {
                          handleLogout();
                        }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      
                        <LogOut className="h-4 w-4" /> Sign out
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center md:hidden gap-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-slate-600" />
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu (Drawer) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-xl absolute w-full">
            <div className="pt-4 pb-4 space-y-2 px-4">
              {/* Mobile User Info */}
              <div className="flex items-center gap-3 py-4 border-b border-gray-100 mb-4 bg-slate-50 -mx-4 px-6">
                {userData.profile?.profile_pic_url ? (
                  <img
                    src={userData.profile.profile_pic_url}
                    alt="Profile"
                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {userData.profile?.full_name?.charAt(0) || userData.email?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <div className="text-base font-bold text-slate-800">{userData.profile?.full_name}</div>
                  <div className="text-sm font-medium text-slate-500">{userData.email}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {userData.role?.display_name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Organization Info */}
              {userData.organisation && (
                <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-50 mb-4">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="block text-xs font-bold text-blue-600 uppercase tracking-wide">Organization</span>
                    <span className="block font-bold text-slate-800">{userData.organisation.name}</span>
                  </div>
                </div>
              )}

              {/* Mobile Navigation Links */}
              <Link href={dashboardPath} className="block px-4 py-3 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600">
                Dashboard
              </Link>
            </div>

            {/* Mobile Sign Out */}
            <div className="pt-4 pb-6 border-t border-gray-100 bg-gray-50 px-4">
              <a 
               onClick={() => {
                  handleLogout();
                }}
               className="block px-4 py-3 rounded-lg text-center font-bold text-red-600 bg-white border border-red-100 hover:bg-red-50">
                Sign out
              </a>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;