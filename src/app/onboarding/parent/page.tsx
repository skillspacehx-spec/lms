'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  ChevronLeft, 
  UserPlus, 
  Settings, 
  CreditCard, 
  Shield,
  Users,
  BookOpen,
  Calendar,
  DollarSign
} from 'lucide-react';
import Button from '../../../components/common/Button';
import { subjects, goals, Child } from '../../../data/data';

interface ParentOnboardingData {
  familyInfo: {
    numberOfChildren: number;
    primaryGoal: string;
    budget: string;
    timeZone: string;
  };
  children: Child[];
  preferences: {
    communicationFrequency: string;
    reportingStyle: string;
    paymentMethod: string;
    safetyPreferences: string[];
  };
  tutorPreferences: {
    genderPreference: string;
    experienceLevel: string;
    teachingStyle: string;
    maxHourlyRate: number;
  };
}

interface OnboardingStep {
  step: number;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

export default function ParentOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<ParentOnboardingData>({
    familyInfo: {
      numberOfChildren: 1,
      primaryGoal: '',
      budget: '',
      timeZone: 'GMT'
    },
    children: [],
    preferences: {
      communicationFrequency: '',
      reportingStyle: '',
      paymentMethod: '',
      safetyPreferences: []
    },
    tutorPreferences: {
      genderPreference: '',
      experienceLevel: '',
      teachingStyle: '',
      maxHourlyRate: 50
    }
  });

  const steps: OnboardingStep[] = [
    {
      step: 1,
      title: "Family Information",
      description: "Tell us about your family and learning goals",
      component: FamilyInformation
    },
    {
      step: 2,
      title: "Add Your Children",
      description: "Create profiles for each child who will be learning",
      component: ChildrenProfiles
    },
    {
      step: 3,
      title: "Tutor Preferences",
      description: "Help us find the perfect tutors for your family",
      component: TutorPreferences
    },
    {
      step: 4,
      title: "Safety & Communication",
      description: "Set up safety preferences and communication settings",
      component: SafetyAndCommunication
    },
    {
      step: 5,
      title: "Payment & Budget",
      description: "Configure your payment preferences and budget",
      component: PaymentAndBudget
    }
  ];

  const currentStepData = steps[currentStep - 1];
  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      // Save parent onboarding data and children to database
      const response = await fetch('/api/users/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(onboardingData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Parent onboarding saved:', data);
        router.push('/dashboard/parent');
      } else {
        const error = await response.json();
        console.error('Failed to save onboarding:', error);
        alert('Failed to save your information. Please try again.');
      }
    } catch (error) {
      console.error('Error saving parent onboarding:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const updateOnboardingData = (field: keyof ParentOnboardingData, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.familyInfo.primaryGoal && onboardingData.familyInfo.budget;
      case 2:
        return onboardingData.children.length > 0 && 
               onboardingData.children.every(child => 
                 child.name && child.age > 0 && child.gradeLevel && child.subjects.length > 0
               );
      case 3:
        return onboardingData.tutorPreferences.experienceLevel && 
               onboardingData.tutorPreferences.teachingStyle;
      case 4:
        return onboardingData.preferences.communicationFrequency && 
               onboardingData.preferences.reportingStyle;
      case 5:
        return onboardingData.preferences.paymentMethod;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#191919]">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-500">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#7AC2F9] h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#191919] mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-gray-600">{currentStepData.description}</p>
          </div>

          <div className="mb-8">
            <currentStepData.component
              onboardingData={onboardingData}
              updateOnboardingData={updateOnboardingData}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isFirstStep
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center space-x-2"
            >
              <span>{isLastStep ? 'Complete Setup' : 'Next'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Family Information Component
function FamilyInformation({ onboardingData, updateOnboardingData }: {
  onboardingData: ParentOnboardingData;
  updateOnboardingData: (field: keyof ParentOnboardingData, value: any) => void;
}) {
  const updateFamilyInfo = (field: keyof ParentOnboardingData['familyInfo'], value: any) => {
    updateOnboardingData('familyInfo', {
      ...onboardingData.familyInfo,
      [field]: value
    });
  };

  const goalOptions = [
    { id: 'academic_improvement', label: 'Academic Improvement', description: 'Help children excel in their current subjects' },
    { id: 'exam_preparation', label: 'Exam Preparation', description: 'Prepare for specific tests or assessments' },
    { id: 'skill_development', label: 'Skill Development', description: 'Build new skills and competencies' },
    { id: 'homework_support', label: 'Homework Support', description: 'Daily assistance with schoolwork' },
    { id: 'confidence_building', label: 'Confidence Building', description: 'Boost academic confidence and motivation' },
    { id: 'enrichment', label: 'Academic Enrichment', description: 'Advanced learning beyond school curriculum' }
  ];

  const budgetOptions = [
    { id: 'budget_25', label: '£20-30/hour', description: 'Basic tutoring sessions' },
    { id: 'budget_35', label: '£30-40/hour', description: 'Standard tutoring sessions' },
    { id: 'budget_45', label: '£40-50/hour', description: 'Premium tutoring sessions' },
    { id: 'budget_55', label: '£50+/hour', description: 'Expert specialist tutors' }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Users className="w-12 h-12 text-[#7AC2F9] mx-auto mb-4" />
      </div>

      {/* Number of Children */}
      <div>
        <label className="block text-sm font-medium text-[#191919] mb-3">
          How many children will be using our tutoring services?
        </label>
        <div className="flex space-x-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => updateFamilyInfo('numberOfChildren', num)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                onboardingData.familyInfo.numberOfChildren === num
                  ? 'border-[#7AC2F9] bg-[#7AC2F9]/10 text-[#191919]'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              {num} {num === 1 ? 'Child' : 'Children'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Goal */}
      <div>
        <label className="block text-sm font-medium text-[#191919] mb-3">
          What is your primary goal for tutoring?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goalOptions.map((goal) => (
            <button
              key={goal.id}
              onClick={() => updateFamilyInfo('primaryGoal', goal.id)}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                onboardingData.familyInfo.primaryGoal === goal.id
                  ? 'border-[#7AC2F9] bg-[#7AC2F9]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-medium text-[#191919] mb-1">{goal.label}</h3>
              <p className="text-sm text-gray-600">{goal.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-[#191919] mb-3">
          What's your budget per tutoring hour?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetOptions.map((budget) => (
            <button
              key={budget.id}
              onClick={() => updateFamilyInfo('budget', budget.id)}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                onboardingData.familyInfo.budget === budget.id
                  ? 'border-[#7AC2F9] bg-[#7AC2F9]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-medium text-[#191919] mb-1">{budget.label}</h3>
              <p className="text-sm text-gray-600">{budget.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Time Zone */}
      <div>
        <label className="block text-sm font-medium text-[#191919] mb-3">
          What's your time zone?
        </label>
        <select
          value={onboardingData.familyInfo.timeZone}
          onChange={(e) => updateFamilyInfo('timeZone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
        >
          <option value="GMT">GMT (Greenwich Mean Time)</option>
          <option value="EST">EST (Eastern Standard Time)</option>
          <option value="PST">PST (Pacific Standard Time)</option>
          <option value="CET">CET (Central European Time)</option>
          <option value="JST">JST (Japan Standard Time)</option>
          <option value="AEST">AEST (Australian Eastern Time)</option>
        </select>
      </div>
    </div>
  );
}

// Children Profiles Component
function ChildrenProfiles({ onboardingData, updateOnboardingData }: {
  onboardingData: ParentOnboardingData;
  updateOnboardingData: (field: keyof ParentOnboardingData, value: any) => void;
}) {
  const addChild = () => {
    const newChild: Child = {
      id: `child-${Date.now()}`,
      name: '',
      age: 8,
      gradeLevel: '',
      subjects: [],
      learningStyle: '',
      goals: []
    };
    updateOnboardingData('children', [...onboardingData.children, newChild]);
  };

  const updateChild = (index: number, field: keyof Child, value: any) => {
    const updatedChildren = [...onboardingData.children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    updateOnboardingData('children', updatedChildren);
  };

  const removeChild = (index: number) => {
    const updatedChildren = onboardingData.children.filter((_, i) => i !== index);
    updateOnboardingData('children', updatedChildren);
  };

  const toggleSubject = (childIndex: number, subjectId: string) => {
    const child = onboardingData.children[childIndex];
    const subjects = child.subjects.includes(subjectId)
      ? child.subjects.filter(id => id !== subjectId)
      : [...child.subjects, subjectId];
    updateChild(childIndex, 'subjects', subjects);
  };

  const learningStyles = [
    'Visual (learns through images and diagrams)',
    'Auditory (learns through listening)',
    'Kinesthetic (learns through hands-on activities)',
    'Reading/Writing (learns through text)'
  ];

  const gradeLevels = [
    'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <UserPlus className="w-12 h-12 text-[#7AC2F9] mx-auto mb-4" />
        <p className="text-gray-600">
          Add {onboardingData.familyInfo.numberOfChildren} child{onboardingData.familyInfo.numberOfChildren !== 1 ? 'ren' : ''} to get started
        </p>
      </div>

      {onboardingData.children.map((child, index) => (
        <div key={child.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[#191919]">
              Child {index + 1}
            </h3>
            {onboardingData.children.length > 1 && (
              <button
                onClick={() => removeChild(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child's Name
              </label>
              <input
                type="text"
                value={child.name}
                onChange={(e) => updateChild(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
                placeholder="Enter child's name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                min="4"
                max="18"
                value={child.age}
                onChange={(e) => updateChild(index, 'age', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level
              </label>
              <select
                value={child.gradeLevel}
                onChange={(e) => updateChild(index, 'gradeLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
              >
                <option value="">Select grade level</option>
                {gradeLevels.map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Style
              </label>
              <select
                value={child.learningStyle}
                onChange={(e) => updateChild(index, 'learningStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
              >
                <option value="">Select learning style</option>
                {learningStyles.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Subjects Needing Help
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {subjects.slice(0, 12).map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => toggleSubject(index, subject.id)}
                  className={`p-2 rounded-lg border transition-colors text-sm ${
                    child.subjects.includes(subject.id)
                      ? 'border-[#7AC2F9] bg-[#7AC2F9]/10 text-[#191919]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      {onboardingData.children.length < onboardingData.familyInfo.numberOfChildren && (
        <div className="text-center">
          <button
            onClick={addChild}
            className="inline-flex items-center px-4 py-2 border-2 border-[#7AC2F9] text-[#191919] rounded-lg hover:bg-[#7AC2F9]/10 transition-colors"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add Another Child
          </button>
        </div>
      )}
    </div>
  );
}

// Tutor Preferences Component
function TutorPreferences({ onboardingData, updateOnboardingData }: {
  onboardingData: ParentOnboardingData;
  updateOnboardingData: (field: keyof ParentOnboardingData, value: any) => void;
}) {
  const updateTutorPreferences = (field: keyof ParentOnboardingData['tutorPreferences'], value: any) => {
    updateOnboardingData('tutorPreferences', {
      ...onboardingData.tutorPreferences,
      [field]: value
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Settings className="w-12 h-12 text-[#7AC2F9] mx-auto mb-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-[#191919] mb-3">
            Gender Preference
          </label>
          <div className="space-y-2">
            {['No preference', 'Female tutors only', 'Male tutors only'].map((option) => (
              <button
                key={option}
                onClick={() => updateTutorPreferences('genderPreference', option)}
                className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                  onboardingData.tutorPreferences.genderPreference === option
                    ? 'border-[#7AC2F9] bg-[#7AC2F9]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#191919] mb-3">
            Experience Level
          </label>
          <div className="space-y-2">
            {[
              { id: 'any', label: 'Any experience level' },
              { id: '2plus', label: '2+ years experience' },
              { id: '5plus', label: '5+ years experience' },
              { id: '10plus', label: '10+ years experience' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => updateTutorPreferences('experienceLevel', option.id)}
                className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                  onboardingData.tutorPreferences.experienceLevel === option.id
                    ? 'border-[#7AC2F9] bg-[#7AC2F9]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#191919] mb-3">
            Teaching Style Preference
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'patient', label: 'Patient and encouraging' },
              { id: 'structured', label: 'Structured and organized' },
              { id: 'creative', label: 'Creative and engaging' },
              { id: 'results', label: 'Results-focused' }
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => updateTutorPreferences('teachingStyle', style.id)}
                className={`p-3 rounded-lg border-2 transition-colors text-left ${
                  onboardingData.tutorPreferences.teachingStyle === style.id
                    ? 'border-[#7AC2F9] bg-[#7AC2F9]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#191919] mb-3">
            Maximum Hourly Rate: £{onboardingData.tutorPreferences.maxHourlyRate}
          </label>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={onboardingData.tutorPreferences.maxHourlyRate}
            onChange={(e) => updateTutorPreferences('maxHourlyRate', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>£20</span>
            <span>£100</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Safety and Communication Component
function SafetyAndCommunication({ onboardingData, updateOnboardingData }: {
  onboardingData: ParentOnboardingData;
  updateOnboardingData: (field: keyof ParentOnboardingData, value: any) => void;
}) {
  const updatePreferences = (field: keyof ParentOnboardingData['preferences'], value: any) => {
    updateOnboardingData('preferences', {
      ...onboardingData.preferences,
      [field]: value
    });
  };

  const toggleSafetyPreference = (preference: string) => {
    const current = onboardingData.preferences.safetyPreferences;
    const updated = current.includes(preference)
      ? current.filter(p => p !== preference)
      : [...current, preference];
    updatePreferences('safetyPreferences', updated);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Shield className="w-12 h-12 text-[#7AC2F9] mx-auto mb-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-[#191919] mb-3">
            Communication Frequency
          </label>
          <div className="space-y-2">
            {[
              'After every session',
              'Weekly summary',
              'Bi-weekly reports',
              'Monthly reports'
            ].map((option) => (
              <button
                key={option}
                onClick={() => updatePreferences('communicationFrequency', option)}
                className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                  onboardingData.preferences.communicationFrequency === option
                    ? 'border-[#7AC2F9] bg-[#7AC2F9]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#191919] mb-3">
            Report Style
          </label>
          <div className="space-y-2">
            {[
              'Detailed progress reports',
              'Brief session summaries',
              'Visual progress charts',
              'Video feedback'
            ].map((option) => (
              <button
                key={option}
                onClick={() => updatePreferences('reportingStyle', option)}
                className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                  onboardingData.preferences.reportingStyle === option
                    ? 'border-[#7AC2F9] bg-[#7AC2F9]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#191919] mb-3">
            Safety Preferences (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Record all sessions',
              'Parent can join sessions',
              'Background checks required',
              'Verified identity only',
              'Same-gender tutors only',
              'Emergency contact setup'
            ].map((option) => (
              <button
                key={option}
                onClick={() => toggleSafetyPreference(option)}
                className={`p-3 rounded-lg border-2 transition-colors text-left ${
                  onboardingData.preferences.safetyPreferences.includes(option)
                    ? 'border-[#7AC2F9] bg-[#7AC2F9]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Payment and Budget Component
function PaymentAndBudget({ onboardingData, updateOnboardingData }: {
  onboardingData: ParentOnboardingData;
  updateOnboardingData: (field: keyof ParentOnboardingData, value: any) => void;
}) {
  const updatePreferences = (field: keyof ParentOnboardingData['preferences'], value: any) => {
    updateOnboardingData('preferences', {
      ...onboardingData.preferences,
      [field]: value
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <CreditCard className="w-12 h-12 text-[#7AC2F9] mx-auto mb-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-[#191919] mb-3">
            Preferred Payment Method
          </label>
          <div className="space-y-3">
            {[
              { id: 'card', label: 'Credit/Debit Card', description: 'Pay per session or monthly' },
              { id: 'paypal', label: 'PayPal', description: 'Secure PayPal payments' },
              { id: 'bank', label: 'Bank Transfer', description: 'Direct bank transfer' },
              { id: 'subscription', label: 'Monthly Subscription', description: 'Automated monthly billing' }
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => updatePreferences('paymentMethod', method.id)}
                className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                  onboardingData.preferences.paymentMethod === method.id
                    ? 'border-[#7AC2F9] bg-[#7AC2F9]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-medium text-[#191919]">{method.label}</h4>
                <p className="text-sm text-gray-600">{method.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-[#191919] mb-4">Pricing Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Selected budget range:</span>
                <span className="font-medium">
                  {onboardingData.familyInfo.budget === 'budget_25' && '£20-30/hour'}
                  {onboardingData.familyInfo.budget === 'budget_35' && '£30-40/hour'}
                  {onboardingData.familyInfo.budget === 'budget_45' && '£40-50/hour'}
                  {onboardingData.familyInfo.budget === 'budget_55' && '£50+/hour'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of children:</span>
                <span className="font-medium">{onboardingData.familyInfo.numberOfChildren}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated monthly cost:</span>
                  <span className="font-medium text-[#191919]">
                    £{((onboardingData.familyInfo.budget === 'budget_25' ? 25 :
                         onboardingData.familyInfo.budget === 'budget_35' ? 35 :
                         onboardingData.familyInfo.budget === 'budget_45' ? 45 : 55) * 
                        onboardingData.familyInfo.numberOfChildren * 4).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Based on 4 sessions per month per child
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-[#191919] mb-2">Money-Back Guarantee</h4>
            <p className="text-sm text-gray-600">
              If you're not satisfied with your first session, we'll refund your money and help you find a better tutor match.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}