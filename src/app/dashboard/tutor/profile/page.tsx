"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Save, Upload, Trash2, Lock, Mail, Eye, EyeOff, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TutorProfile() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    subjects: [] as string[],
    hourlyRate: '',
    experience: '',
    qualifications: [] as string[],
    avatar: ''
  });
  const [newSubject, setNewSubject] = useState('');
  const [newQualification, setNewQualification] = useState('');
  const [isSaving, setIsSaving] = useState(false);
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
    if (!loading && (!user || user.role !== 'tutor')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'tutor') {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    // Update avatar preview when user data changes
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user?.avatar]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched user profile:', data.user);
        
        const avatarUrl = data.user.avatar || '';
        
        setFormData({
          name: data.user.name || '',
          bio: data.user.bio || '',
          subjects: data.user.subjects || [],
          hourlyRate: data.user.hourlyRate?.toString() || '',
          experience: data.user.experience?.toString() || '',
          qualifications: data.user.qualifications || [],
          avatar: avatarUrl
        });
        setAvatarPreview(avatarUrl);
        console.log('Avatar set to:', avatarUrl);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploading(true);
    setMessage('Uploading image...');
    setMessageType('success');

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', file.name, file.type, file.size);

      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      console.log('Upload response status:', response.status);
      const data = await response.json();
      console.log('Upload response data:', data);

      if (response.ok && data.success) {
        // Update preview
        setAvatarPreview(data.avatarUrl);
        
        // Update form data
        setFormData(prev => ({ ...prev, avatar: data.avatarUrl }));
        
        setMessage('✓ Profile image updated successfully!');
        setMessageType('success');
        
        // Refresh user context to update avatar everywhere
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
      // Reset file input
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

  const handleAddSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, newSubject.trim()]
      });
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(s => s !== subject)
    });
  };

  const handleAddQualification = () => {
    if (newQualification.trim()) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, newQualification.trim()]
      });
      setNewQualification('');
    }
  };

  const handleRemoveQualification = (index: number) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter((_, i) => i !== index)
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          hourlyRate: parseFloat(formData.hourlyRate),
          experience: parseInt(formData.experience)
        })
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setMessageType('success');
        await refreshUser();
        setTimeout(() => {
          router.push('/dashboard/tutor');
        }, 1500);
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to update profile');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error updating profile');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!user || user.role !== 'tutor') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Edit Public Profile
          </h1>
          <p className="text-lg text-gray-600">
            Update your tutor profile, password, and email settings
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border-2 flex items-start gap-3 ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="font-medium">{message}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Profile Picture */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Picture</h3>
              
              <div className="flex flex-col items-center">
                <div className="relative group mb-4">
                  <div className="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-6xl font-bold border-4 border-white shadow-lg">
                    {uploading ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-2"></div>
                        <span className="text-sm">Uploading...</span>
                      </div>
                    ) : avatarPreview ? (
                      <Image 
                        key={avatarPreview}
                        src={avatarPreview} 
                        alt="Profile" 
                        width={192}
                        height={192}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', avatarPreview);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{user?.name?.charAt(0)?.toUpperCase() || 'T'}</span>
                    )}
                  </div>
                  
                  {!uploading && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 p-3 bg-[#7AC2F9] text-white rounded-full shadow-lg hover:bg-[#5AA3D9] transition-all group-hover:scale-110"
                      title="Upload profile picture"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <p className="text-sm text-gray-500 text-center">
                  {uploading ? (
                    <span className="text-blue-600 font-medium">Uploading your image...</span>
                  ) : (
                    <>
                      Click the camera icon to upload a new photo
                      <br />
                      <span className="text-xs">Max size: 5MB • JPG, PNG, GIF</span>
                    </>
                  )}
                </p>
              </div>

              {/* Security Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <button
                  onClick={() => {
                    setShowPasswordSection(!showPasswordSection);
                    setShowEmailSection(false);
                  }}
                  className="w-full flex items-center justify-between p-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </span>
                </button>

                <button
                  onClick={() => {
                    setShowEmailSection(!showEmailSection);
                    setShowPasswordSection(false);
                  }}
                  className="w-full flex items-center justify-between p-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Change Email
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Form & Security Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Form */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>
              
              <div className="space-y-6">{/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your full name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio *
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell students about yourself, your teaching style, and experience..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.bio.length} / 500 characters
                  </p>
                </div>

                {/* Subjects */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subjects I Teach *
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Mathematics, English, Physics"
                    />
                    <button
                      onClick={handleAddSubject}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#7AC2F9] to-[#5AA3D9] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2 font-medium"
                      >
                        {subject}
                        <button
                          onClick={() => handleRemoveSubject(subject)}
                          className="hover:text-red-600 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hourly Rate */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hourly Rate (£) *
                    </label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="30"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="5"
                      min="0"
                    />
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qualifications & Certifications
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newQualification}
                      onChange={(e) => setNewQualification(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQualification())}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., BSc Mathematics, PGCE, DBS Checked"
                    />
                    <button
                      onClick={handleAddQualification}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#7AC2F9] to-[#5AA3D9] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.qualifications.map((qual, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <span className="text-gray-700 font-medium">{qual}</span>
                        <button
                          onClick={() => handleRemoveQualification(index)}
                          className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formData.name || !formData.bio || formData.subjects.length === 0 || !formData.hourlyRate || !formData.experience}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#7AC2F9] to-[#5AA3D9] text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>

            {/* Change Password Section */}
            {showPasswordSection && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
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
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-6 h-6 text-blue-600" />
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
          </div>
        </div>
      </div>
    </div>
  );
}
