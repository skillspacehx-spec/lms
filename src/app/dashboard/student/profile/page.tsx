'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2, User } from 'lucide-react';

export default function StudentProfile() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  // Image upload states
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  // Password change states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    verificationCode: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordStep, setPasswordStep] = useState<'input' | 'verify'>('input');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] = useState<'success' | 'error'>('success');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Email change states
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [emailData, setEmailData] = useState({
    newEmail: '',
    verificationCode: ''
  });
  const [emailStep, setEmailStep] = useState<'input' | 'verify'>('input');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailMessageType, setEmailMessageType] = useState<'success' | 'error'>('success');
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // Fetch profile data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  // Update avatar preview when user changes
  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user?.avatar]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size should be less than 5MB');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    setUploading(true);
    setMessage('Uploading image...');
    setMessageType('success');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAvatarPreview(data.avatarUrl);
        setFormData(prev => ({ ...prev, avatar: data.avatarUrl }));
        setMessage('✓ Profile image updated successfully!');
        setMessageType('success');
        await refreshUser();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Failed to upload image');
        setMessageType('error');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage('Error uploading image. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendPasswordCode = async () => {
    if (!passwordData.currentPassword) {
      setPasswordMessage('Please enter your current password');
      setPasswordMessageType('error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters');
      setPasswordMessageType('error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('Passwords do not match');
      setPasswordMessageType('error');
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage('');

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'send-code',
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordStep('verify');
        setPasswordMessage(data.message);
        setPasswordMessageType('success');
      } else {
        setPasswordMessage(data.message);
        setPasswordMessageType('error');
      }
    } catch (error) {
      setPasswordMessage('Error sending verification code');
      setPasswordMessageType('error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleVerifyAndChangePassword = async () => {
    if (!passwordData.verificationCode) {
      setPasswordMessage('Please enter verification code');
      setPasswordMessageType('error');
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage('');

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'verify-and-update',
          newPassword: passwordData.newPassword,
          verificationCode: passwordData.verificationCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage(data.message);
        setPasswordMessageType('success');
        setTimeout(() => {
          setShowPasswordSection(false);
          setPasswordStep('input');
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            verificationCode: ''
          });
          setPasswordMessage('');
        }, 2000);
      } else {
        setPasswordMessage(data.message);
        setPasswordMessageType('error');
      }
    } catch (error) {
      setPasswordMessage('Error changing password');
      setPasswordMessageType('error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendEmailCode = async () => {
    if (!emailData.newEmail) {
      setEmailMessage('Please enter new email');
      setEmailMessageType('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      setEmailMessage('Invalid email format');
      setEmailMessageType('error');
      return;
    }

    setEmailLoading(true);
    setEmailMessage('');

    try {
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'send-code',
          newEmail: emailData.newEmail
        })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailStep('verify');
        setEmailMessage(data.message);
        setEmailMessageType('success');
      } else {
        setEmailMessage(data.message);
        setEmailMessageType('error');
      }
    } catch (error) {
      setEmailMessage('Error sending verification code');
      setEmailMessageType('error');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyAndChangeEmail = async () => {
    if (!emailData.verificationCode) {
      setEmailMessage('Please enter verification code');
      setEmailMessageType('error');
      return;
    }

    setEmailLoading(true);
    setEmailMessage('');

    try {
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'verify-and-update',
          verificationCode: emailData.verificationCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailMessage(data.message);
        setEmailMessageType('success');
        setTimeout(() => {
          setShowEmailSection(false);
          setEmailStep('input');
          setEmailData({
            newEmail: '',
            verificationCode: ''
          });
          setEmailMessage('');
          refreshUser();
        }, 2000);
      } else {
        setEmailMessage(data.message);
        setEmailMessageType('error');
      }
    } catch (error) {
      setEmailMessage('Error changing email');
      setEmailMessageType('error');
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-300 text-green-800' 
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          
          {/* Profile Picture Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Picture</label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {avatarPreview ? (
                  <img 
                    key={avatarPreview}
                    src={avatarPreview} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-[#7AC2F9] to-[#5AA3D9] flex items-center justify-center ${avatarPreview ? 'hidden' : ''}`}>
                  {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2 bg-[#7AC2F9] text-white rounded-full hover:bg-[#5AA3D9] transition-colors shadow-lg disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upload a new profile picture</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 5MB</p>
              </div>
            </div>
          </div>

          {/* Name & Email Display */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                {formData.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                {formData.email}
              </div>
            </div>
          </div>

          {/* Security Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowPasswordSection(!showPasswordSection);
                  setShowEmailSection(false);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-semibold border border-blue-200"
              >
                <Lock className="w-5 h-5" />
                Change Password
              </button>
              <button
                onClick={() => {
                  setShowEmailSection(!showEmailSection);
                  setShowPasswordSection(false);
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-semibold border border-purple-200"
              >
                <Mail className="w-5 h-5" />
                Change Email
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        {showPasswordSection && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-600" />
              Change Password
            </h3>

            {passwordMessage && (
              <div className={`mb-4 p-3 rounded-lg border flex items-start gap-2 ${
                passwordMessageType === 'success' 
                  ? 'bg-green-50 border-green-300 text-green-800' 
                  : 'bg-red-50 border-red-300 text-red-800'
              }`}>
                {passwordMessageType === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-medium">{passwordMessage}</p>
              </div>
            )}

            {passwordStep === 'input' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password * (min 6 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  onClick={handleSendPasswordCode}
                  disabled={passwordLoading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {passwordLoading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {passwordLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            )}

            {passwordStep === 'verify' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    A 6-digit verification code has been sent to your email. Please enter it below.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Code *
                  </label>
                  <input
                    type="text"
                    value={passwordData.verificationCode}
                    onChange={(e) => setPasswordData({ ...passwordData, verificationCode: e.target.value })}
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-bold"
                    placeholder="000000"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPasswordStep('input')}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyAndChangePassword}
                    disabled={passwordLoading}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {passwordLoading && (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {passwordLoading ? 'Verifying...' : 'Verify & Change Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Change Email Section */}
        {showEmailSection && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-purple-600" />
              Change Email Address
            </h3>

            {emailMessage && (
              <div className={`mb-4 p-3 rounded-lg border flex items-start gap-2 ${
                emailMessageType === 'success' 
                  ? 'bg-green-50 border-green-300 text-green-800' 
                  : 'bg-red-50 border-red-300 text-red-800'
              }`}>
                {emailMessageType === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-medium">{emailMessage}</p>
              </div>
            )}

            {emailStep === 'input' && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Current Email:</strong> {user?.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Email Address *
                  </label>
                  <input
                    type="email"
                    value={emailData.newEmail}
                    onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="newemail@example.com"
                  />
                </div>

                <button
                  onClick={handleSendEmailCode}
                  disabled={emailLoading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {emailLoading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {emailLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            )}

            {emailStep === 'verify' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    A 6-digit verification code has been sent to <strong>{emailData.newEmail}</strong>. Please enter it below.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Code *
                  </label>
                  <input
                    type="text"
                    value={emailData.verificationCode}
                    onChange={(e) => setEmailData({ ...emailData, verificationCode: e.target.value })}
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-bold"
                    placeholder="000000"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setEmailStep('input')}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyAndChangeEmail}
                    disabled={emailLoading}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {emailLoading && (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {emailLoading ? 'Verifying...' : 'Verify & Change Email'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
