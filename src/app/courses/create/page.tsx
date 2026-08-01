'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Upload,
  Video,
  FileText,
  Clock,
  Users,
  DollarSign,
  Save,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Image,
  Play,
  Settings,
  Calendar,
  Tag
} from 'lucide-react';
import Button from '../../../components/common/Button';

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  type: 'live_session' | 'recorded' | 'lms_course' | 'resource';
  duration: number;
  price: number;
  thumbnail: string;
  maxStudents: number | null;
  isActive: boolean;
  content: {
    modules: Array<{
      title: string;
      content: string;
      videoUrl: string;
      duration: number;
    }>;
    resources: Array<{
      title: string;
      url: string;
      type: string;
    }>;
  };
}

interface CourseCategory {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export default function CreateCoursePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'pricing' | 'settings'>('basic');
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    type: 'lms_course',
    duration: 60,
    price: 0,
    thumbnail: '',
    maxStudents: null,
    isActive: true,
    content: {
      modules: [],
      resources: []
    }
  });

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'tutor' && user.role !== 'admin'))) {
      router.replace('/dashboard');
      return;
    }
    
    // Load categories
    fetchCategories();
  }, [user, loading, router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/course-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (isDraft = false) => {
    setIsSubmitting(true);
    try {
      const courseData = {
        ...formData,
        isDraft
      };

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/courses/${data.course._id}`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error creating course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        modules: [...prev.content.modules, {
          title: '',
          content: '',
          videoUrl: '',
          duration: 0
        }]
      }
    }));
  };

  const updateModule = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        modules: prev.content.modules.map((module, i) => 
          i === index ? { ...module, [field]: value } : module
        )
      }
    }));
  };

  const removeModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        modules: prev.content.modules.filter((_, i) => i !== index)
      }
    }));
  };

  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        resources: [...prev.content.resources, {
          title: '',
          url: '',
          type: 'pdf'
        }]
      }
    }));
  };

  const updateResource = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        resources: prev.content.resources.map((resource, i) => 
          i === index ? { ...resource, [field]: value } : resource
        )
      }
    }));
  };

  const removeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        resources: prev.content.resources.filter((_, i) => i !== index)
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'tutor' && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#191919]">Create New Course</h1>
              <p className="mt-2 text-gray-600">Build engaging learning experiences for your students</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="inline-flex items-center space-x-2 px-4 py-2 border-2 border-[#7AC2F9] text-[#191919] rounded-lg hover:bg-[#7AC2F9]/10 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>{previewMode ? 'Edit' : 'Preview'}</span>
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-4 py-2 border-2 border-[#7AC2F9] text-[#191919] rounded-lg hover:bg-[#7AC2F9]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#7AC2F9] text-black rounded-lg hover:bg-[#6AB4ED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                <span>Publish Course</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'basic', label: 'Basic Info', icon: FileText },
                { id: 'content', label: 'Content', icon: Video },
                { id: 'pricing', label: 'Pricing', icon: DollarSign },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#7AC2F9] text-[#7AC2F9]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'basic' && (
              <BasicInfoTab
                formData={formData}
                categories={categories}
                onInputChange={handleInputChange}
              />
            )}
            
            {activeTab === 'content' && (
              <ContentTab
                formData={formData}
                onInputChange={handleInputChange}
                addModule={addModule}
                updateModule={updateModule}
                removeModule={removeModule}
                addResource={addResource}
                updateResource={updateResource}
                removeResource={removeResource}
              />
            )}
            
            {activeTab === 'pricing' && (
              <PricingTab
                formData={formData}
                onInputChange={handleInputChange}
              />
            )}
            
            {activeTab === 'settings' && (
              <SettingsTab
                formData={formData}
                onInputChange={handleInputChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Basic Info Tab Component
function BasicInfoTab({ formData, categories, onInputChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            placeholder="Enter course title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
            required
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Describe your course..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => onInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
            required
          >
            <option value="">Select category</option>
            {categories.map((category: any) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => onInputChange('type', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
            required
          >
            <option value="lms_course">LMS Course</option>
            <option value="live_session">Live Session</option>
            <option value="recorded">Recorded Course</option>
            <option value="resource">Resource Library</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes) *
          </label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => onInputChange('duration', parseInt(e.target.value))}
            placeholder="60"
            min="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail Image
          </label>
          <div className="flex items-center gap-3">
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => onInputChange('thumbnail', e.target.value)}
              placeholder="https://example.com/image.jpg or upload below"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
            />
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-3 bg-[#7AC2F9] text-black rounded-lg hover:bg-[#6AB4ED] transition-colors font-medium text-sm">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const uploadData = new FormData();
                    uploadData.append('image', file);
                    const res = await fetch('/api/upload/thumbnail', {
                      method: 'POST',
                      credentials: 'include',
                      body: uploadData
                    });
                    const resData = await res.json();
                    if (resData.success && resData.url) {
                      onInputChange('thumbnail', resData.url);
                      alert('Thumbnail uploaded successfully!');
                    } else {
                      alert(resData.message || 'Failed to upload thumbnail');
                    }
                  } catch (err) {
                    console.error('Thumbnail upload failed', err);
                    alert('Upload failed');
                  }
                }}
              />
            </label>
          </div>
          {formData.thumbnail && (
            <div className="mt-2">
              <img src={formData.thumbnail} alt="Thumbnail preview" className="w-32 h-20 object-cover rounded-lg border" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Content Tab Component
function ContentTab({ formData, addModule, updateModule, removeModule, addResource, updateResource, removeResource }: any) {
  return (
    <div className="space-y-8">
      {/* Course Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#191919]">Course Modules</h3>
          <button
            onClick={addModule}
            className="inline-flex items-center space-x-2 px-3 py-2 bg-[#7AC2F9] text-black rounded-lg hover:bg-[#6AB4ED] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
        </div>

        {formData.content.modules.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No modules added yet</p>
            <button
              onClick={addModule}
              className="inline-flex items-center px-4 py-2 border-2 border-[#7AC2F9] text-[#191919] rounded-lg hover:bg-[#7AC2F9]/10 transition-colors"
            >
              Add First Module
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.content.modules.map((module: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Module {index + 1}</h4>
                  <button
                    onClick={() => removeModule(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Module Title
                    </label>
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) => updateModule(index, 'title', e.target.value)}
                      placeholder="Enter module title"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={module.duration}
                      onChange={(e) => updateModule(index, 'duration', parseInt(e.target.value))}
                      placeholder="30"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
                    />
                  </div>
                  
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video URL
                    </label>
                    <input
                      type="url"
                      value={module.videoUrl}
                      onChange={(e) => updateModule(index, 'videoUrl', e.target.value)}
                      placeholder="https://example.com/video.mp4"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
                    />
                  </div>
                  
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Module Content
                    </label>
                    <textarea
                      value={module.content}
                      onChange={(e) => updateModule(index, 'content', e.target.value)}
                      placeholder="Describe what students will learn in this module"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Resources */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#191919]">Course Resources</h3>
          <button
            onClick={addResource}
            className="inline-flex items-center space-x-2 px-3 py-2 bg-[#7AC2F9] text-black rounded-lg hover:bg-[#6AB4ED] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>

        {formData.content.resources.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No resources added yet</p>
            <button
              onClick={addResource}
              className="inline-flex items-center px-4 py-2 border-2 border-[#7AC2F9] text-[#191919] rounded-lg hover:bg-[#7AC2F9]/10 transition-colors"
            >
              Add First Resource
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.content.resources.map((resource: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Resource {index + 1}</h4>
                  <button
                    onClick={() => removeResource(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resource Title
                    </label>
                    <input
                      type="text"
                      value={resource.title}
                      onChange={(e) => updateResource(index, 'title', e.target.value)}
                      placeholder="Enter resource title"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resource Type
                    </label>
                    <select
                      value={resource.type}
                      onChange={(e) => updateResource(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                      <option value="audio">Audio</option>
                      <option value="link">External Link</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resource URL
                    </label>
                    <input
                      type="url"
                      value={resource.url}
                      onChange={(e) => updateResource(index, 'url', e.target.value)}
                      placeholder="https://example.com/resource"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Pricing Tab Component
function PricingTab({ formData, onInputChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Price (£) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => onInputChange('price', parseFloat(e.target.value))}
            placeholder="29.99"
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
            required
          />
          <p className="mt-1 text-sm text-gray-600">Set to 0 for free courses</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Students
          </label>
          <input
            type="number"
            value={formData.maxStudents || ''}
            onChange={(e) => onInputChange('maxStudents', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="Unlimited"
            min="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-600">Leave empty for unlimited enrollment</p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-3">Pricing Guidelines</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Free courses help attract new students</li>
          <li>• Consider offering early bird discounts for live sessions</li>
          <li>• Premium courses should include comprehensive content and resources</li>
          <li>• Group courses can be priced lower per student than 1-on-1 sessions</li>
        </ul>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ formData, onInputChange }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Course Status</h4>
            <p className="text-sm text-gray-600">Control whether students can enroll in this course</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => onInputChange('isActive', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7AC2F9]"></div>
          </label>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Publishing Options</h4>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• <strong>Save Draft:</strong> Course is saved but not visible to students</p>
          <p>• <strong>Publish Course:</strong> Course becomes immediately available for enrollment</p>
          <p>• You can edit course content after publishing</p>
          <p>• Deactivating a course will prevent new enrollments but won't affect existing students</p>
        </div>
      </div>
    </div>
  );
}