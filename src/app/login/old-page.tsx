'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../../components/common/Button';
import { Eye, EyeOff, User, Users, GraduationCap } from 'lucide-react';

type UserRole = 'student' | 'parent' | 'tutor';
type AuthTab = 'login' | 'signup';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Login Form States
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup Form States
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const roles = [
    {
      id: 'student' as UserRole,
      title: 'Student',
      icon: <User className="w-5 h-5" />,
      description: 'Learn with expert tutors'
    },
    {
      id: 'parent' as UserRole,
      title: 'Parent',
      icon: <Users className="w-5 h-5" />,
      description: 'Manage your children\'s learning'
    },
    {
      id: 'tutor' as UserRole,
      title: 'Tutor',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Teach and inspire students'
    }
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock login - replace with actual authentication
    setTimeout(() => {
      // In real implementation, get user role from backend/database
      const userData = {
        email: loginForm.email,
        name: loginForm.email.split('@')[0], // Mock name from email
        role: 'student' as UserRole, // This should come from database
        isAuthenticated: true
      };

      localStorage.setItem('user', JSON.stringify(userData));

      // Direct redirect to dashboard based on user's stored role
      switch (userData.role) {
        case 'student':
          router.push('/dashboard/student');
          break;
        case 'parent':
          router.push('/dashboard/parent');
          break;
        case 'tutor':
          router.push('/dashboard/tutor');
          break;
      }

      setIsLoading(false);
    }, 1500);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupForm.password !== signupForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    // Mock registration - replace with actual authentication
    setTimeout(() => {
      const userData = {
        email: signupForm.email,
        firstName: signupForm.firstName,
        lastName: signupForm.lastName,
        name: `${signupForm.firstName} ${signupForm.lastName}`,
        role: signupForm.role,
        isAuthenticated: true,
        isNewUser: true // Flag for onboarding flow
      };

      localStorage.setItem('user', JSON.stringify(userData));

      // Redirect based on role - students and parents go to onboarding
      switch (signupForm.role) {
        case 'student':
          router.push('/onboarding/student');
          break;
        case 'parent':
          router.push('/onboarding/parent');
          break;
        case 'tutor':
          router.push('/dashboard/tutor');
          break;
      }

      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#191919]">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to your account or create a new one
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white rounded-t-lg">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors rounded-tl-lg ${
              activeTab === 'login' 
                ? 'text-[#7AC2F9] border-b-2 border-[#7AC2F9] bg-white' 
                : 'text-gray-500 hover:text-gray-700 bg-gray-50'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors rounded-tr-lg ${
              activeTab === 'signup' 
                ? 'text-[#7AC2F9] border-b-2 border-[#7AC2F9] bg-white' 
                : 'text-gray-500 hover:text-gray-700 bg-gray-50'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg p-6 shadow-sm border border-gray-200">
          {activeTab === 'login' ? (
            // Login Form
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-8"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
          ) : (
            // Signup Form
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sign up as:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSignupForm(prev => ({ ...prev, role: role.id }))}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        signupForm.role === role.id
                          ? 'border-[#7AC2F9] bg-[#7AC2F9]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`${signupForm.role === role.id ? 'text-[#7AC2F9]' : 'text-gray-400'}`}>
                          {role.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-[#191919]">{role.title}</h4>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={signupForm.firstName}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={signupForm.lastName}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={signupForm.email}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupForm.password}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#7AC2F9] border-gray-300 rounded focus:ring-[#7AC2F9]"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="/terms" className="text-[#7AC2F9] hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-[#7AC2F9] hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Signup Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-8"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            <Link href="/" className="text-[#7AC2F9] hover:underline">
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
