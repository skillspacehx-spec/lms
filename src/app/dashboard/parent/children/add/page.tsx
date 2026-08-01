"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus, X, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ChildForm {
  name: string;
  age: string;
  gradeLevel: string;
  subjects: string[];
  learningStyle: string;
  goals: string;
}

export default function AddChildPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<ChildForm[]>([{
    name: '',
    age: '',
    gradeLevel: '',
    subjects: [],
    learningStyle: 'visual',
    goals: ''
  }]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const availableSubjects = [
    'Math',
    'Science',
    'English',
    'History',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Art',
    'Music',
    'Languages',
    'Geography'
  ];

  const gradeLevels = [
    'Nursery',
    'Reception',
    'Year 1',
    'Year 2',
    'Year 3',
    'Year 4',
    'Year 5',
    'Year 6',
    'Year 7',
    'Year 8',
    'Year 9',
    'Year 10',
    'Year 11',
    'Year 12',
    'Year 13'
  ];

  const learningStyles = [
    { value: 'visual', label: 'Visual - Learns best with images and diagrams' },
    { value: 'auditory', label: 'Auditory - Learns best by listening' },
    { value: 'kinesthetic', label: 'Kinesthetic - Learns best by doing' },
    { value: 'reading', label: 'Reading/Writing - Learns best with text' }
  ];

  useEffect(() => {
    if (!loading && (!user || user.role !== 'parent')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const addChildForm = () => {
    setChildren([...children, {
      name: '',
      age: '',
      gradeLevel: '',
      subjects: [],
      learningStyle: 'visual',
      goals: ''
    }]);
  };

  const removeChildForm = (index: number) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index));
    }
  };

  const updateChild = (index: number, field: keyof ChildForm, value: any) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const toggleSubject = (index: number, subject: string) => {
    const updated = [...children];
    const subjects = updated[index].subjects;
    if (subjects.includes(subject)) {
      updated[index].subjects = subjects.filter(s => s !== subject);
    } else {
      updated[index].subjects = [...subjects, subject];
    }
    setChildren(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child.name.trim()) {
        setError(`Child ${i + 1}: Name is required`);
        return;
      }
      if (!child.age) {
        setError(`Child ${i + 1}: Age is required`);
        return;
      }
      if (!child.gradeLevel) {
        setError(`Child ${i + 1}: Grade level is required`);
        return;
      }
      if (child.subjects.length === 0) {
        setError(`Child ${i + 1}: Please select at least one subject`);
        return;
      }
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/users/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          children: children.map(child => ({
            name: child.name.trim(),
            age: parseInt(child.age),
            gradeLevel: child.gradeLevel,
            subjects: child.subjects,
            learningStyle: child.learningStyle,
            goals: child.goals.trim()
          }))
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(`Successfully added ${children.length} child${children.length > 1 ? 'ren' : ''}!`);
        setTimeout(() => {
          router.push('/dashboard/parent');
        }, 2000);
      } else {
        setError(data.message || 'Failed to add children');
      }
    } catch (error) {
      console.error('Error adding children:', error);
      setError('Failed to add children. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'parent') return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/parent"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Add Children Profiles
          </h1>
          <p className="text-lg text-gray-600">
            Register your children to start booking tutoring sessions
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Children Forms */}
          <div className="space-y-6 mb-6">
            {children.map((child, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Child {index + 1}
                  </h2>
                  {children.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChildForm(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Name and Age */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={child.name}
                        onChange={(e) => updateChild(index, 'name', e.target.value)}
                        placeholder="Enter child's full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Age *
                      </label>
                      <input
                        type="number"
                        value={child.age}
                        onChange={(e) => updateChild(index, 'age', e.target.value)}
                        placeholder="Age"
                        min="3"
                        max="18"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Grade Level */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Grade Level *
                    </label>
                    <select
                      value={child.gradeLevel}
                      onChange={(e) => updateChild(index, 'gradeLevel', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select grade level</option>
                      {gradeLevels.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subjects */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Subjects of Interest * (Select at least one)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableSubjects.map(subject => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(index, subject)}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors text-sm font-semibold ${
                            child.subjects.includes(subject)
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Learning Style */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Learning Style
                    </label>
                    <div className="space-y-2">
                      {learningStyles.map(style => (
                        <label
                          key={style.value}
                          className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`learningStyle-${index}`}
                            value={style.value}
                            checked={child.learningStyle === style.value}
                            onChange={(e) => updateChild(index, 'learningStyle', e.target.value)}
                            className="mr-3"
                          />
                          <span className="text-sm text-gray-700">{style.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Learning Goals */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Learning Goals (Optional)
                    </label>
                    <textarea
                      value={child.goals}
                      onChange={(e) => updateChild(index, 'goals', e.target.value)}
                      placeholder="What would you like your child to achieve? (e.g., improve math grades, prepare for exams, build confidence)"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Another Child Button */}
          <button
            type="button"
            onClick={addChildForm}
            className="w-full mb-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors font-semibold flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Another Child
          </button>

          {/* Submit Button */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-14 bg-[#7AC2F9] text-black rounded-full pl-6 pr-0 py-1.5 flex items-center justify-between group hover:bg-[#6AB4ED] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center">
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? 'Saving...' : `Save ${children.length} Child${children.length > 1 ? 'ren' : ''}`}
              </span>
              <span className="w-14 h-14 rounded-full bg-[#191919] text-white flex items-center justify-center -mr-1 group-hover:bg-[#2a2a2a] transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>

            <Link
              href="/dashboard/parent"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
