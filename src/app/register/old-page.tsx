'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../../components/common/Button';
import { Eye, EyeOff, User, Users, GraduationCap, Check } from 'lucide-react';

type UserRole = 'student' | 'parent' | 'tutor';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();

  const roles = [
    {
      id: 'student' as UserRole,
      title: 'Student',
      icon: <User className="w-6 h-6" />,
      description: 'Learn with expert tutors',
      benefits: ['Personalized learning', 'Flexible scheduling', 'Progress tracking']
    },
    {
      id: 'parent' as UserRole,
      title: 'Parent',
      icon: <Users className="w-6 h-6" />,
      description: 'Manage your children\'s learning',
      benefits: ['Monitor progress', 'Multiple children', 'Safe environment']
    },
    {
      id: 'tutor' as UserRole,
      title: 'Tutor',
      icon: <GraduationCap className="w-6 h-6" />,
      description: 'Teach and inspire students',
      benefits: ['Flexible hours', 'Good earnings', 'Global reach']
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
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
      // Store user data in localStorage (replace with proper auth)
      localStorage.setItem('user', JSON.stringify({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: selectedRole,
        isAuthenticated: true,
        isNewUser: true // Flag for onboarding flow
      }));

      // Redirect based on role - students go to onboarding
      switch (selectedRole) {
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

  const isPasswordValid = formData.password.length >= 6;
  const doPasswordsMatch = formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#191919]">Create Your Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Start your learning journey today
          </p>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-[#191919] mb-4">I want to join as:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedRole === role.id
                    ? 'border-[#7AC2F9] bg-[#7AC2F9]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`${selectedRole === role.id ? 'text-[#7AC2F9]' : 'text-gray-400'}`}>
                      {role.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-[#191919]">{role.title}</h4>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {role.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <form className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[#191919] mb-2">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#7AC2F9] focus:border-[#7AC2F9]"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[#191919] mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#7AC2F9] focus:border-[#7AC2F9]"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#191919] mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#7AC2F9] focus:border-[#7AC2F9]"
              placeholder="Enter your email"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#191919] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#7AC2F9] pr-10 ${
                    formData.password && isPasswordValid 
                      ? 'border-green-300 focus:border-green-500' 
                      : 'border-gray-300 focus:border-[#7AC2F9]'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {formData.password && (
                <p className={`text-xs mt-1 ${isPasswordValid ? 'text-green-600' : 'text-red-600'}`}>
                  {isPasswordValid ? '✓ Password looks good' : 'Password must be at least 6 characters'}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#191919] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#7AC2F9] pr-10 ${
                    formData.confirmPassword && doPasswordsMatch 
                      ? 'border-green-300 focus:border-green-500' 
                      : 'border-gray-300 focus:border-[#7AC2F9]'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && (
                <p className={`text-xs mt-1 ${doPasswordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {doPasswordsMatch ? '✓ Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="h-4 w-4 text-[#7AC2F9] focus:ring-[#7AC2F9] border-gray-300 rounded mt-0.5"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link href="/terms" className="font-medium text-[#7AC2F9] hover:underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-medium text-[#7AC2F9] hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !agreedToTerms || !isPasswordValid || !doPasswordsMatch}
          >
            {isLoading ? 'Creating account...' : `Create ${roles.find(r => r.id === selectedRole)?.title} Account`}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-[#7AC2F9] hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
