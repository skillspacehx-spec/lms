"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Upload, Plus, Trash2, GripVertical, Calendar, Clock, Users, Mic2 } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
}

interface Tutor {
  id: string;
  name: string;
  email: string;
}

interface Module {
  id?: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'quiz' | 'assignment';
  order: number;
  isPreview: boolean;
  isActive: boolean;
  accessLevel: 'free' | 'premium' | 'enrolled_only';
  content: {
    videoUrl?: string;
    videoCloudinaryId?: string;
    videoDuration?: number;
    documentUrl?: string;
    documentCloudinaryId?: string;
  };
}

export default function CreateCoursePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  // Course form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    instructor: '',
    type: 'lms_course',
    duration: '',
    price: '',
    thumbnail: '',
    level: 'all',
    language: 'English',
    maxStudents: '',
    isActive: true,
    isFeatured: false,
    prerequisites: [] as string[],
    learningOutcomes: [] as string[],
    tags: [] as string[]
  });

  // Webinar-specific state
  const [webinarData, setWebinarData] = useState({
    audience: 'parents' as 'students' | 'parents' | 'educators',
    date: '',
    startTime: '',
    endTime: '',
    speaker: '',
    includedWithMembership: false,
    recordingAvailable: false,
  });

  const isWebinar = formData.type === 'live_session';

  const [modules, setModules] = useState<Module[]>([]);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/dashboard');
      return;
    }

    if (user) {
      fetchCategories();
      fetchTutors();
    }
  }, [user, loading, router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await fetch('/api/users?role=tutor', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setTutors(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingThumbnail(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/thumbnail', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, thumbnail: data.url }));
        alert('Thumbnail uploaded successfully!');
      } else {
        alert(data.message || 'Failed to upload thumbnail');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isWebinar) {
      if (!formData.title || !formData.description || !webinarData.date || !webinarData.startTime || !webinarData.endTime) {
        alert('Please fill in all required fields: title, description, date, start time, and end time');
        return;
      }
    } else {
      if (!formData.title || !formData.description || !formData.category || !formData.duration) {
        alert('Please fill in all required fields: title, description, category, and duration');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Build payload — merge webinar extras when applicable
      const payload = isWebinar
        ? { ...formData, webinarData }
        : formData;

      // Create course
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        const courseId = data.course.id;

        // Add modules
        for (const courseModule of modules) {
          console.log('DEBUG: Sending module to API:', {
            title: courseModule.title,
            type: courseModule.type,
            hasContent: !!courseModule.content,
            content: courseModule.content
          });

          const moduleResponse = await fetch(`/api/admin/courses/${courseId}/content`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseModule)
          });

          const moduleData = await moduleResponse.json();
          console.log('DEBUG: Module creation response:', moduleData);
        }

        alert('Course created successfully!');
        router.push('/dashboard/admin/courses');
      } else {
        alert(data.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addModule = (module: Module) => {
    if (editingModule && editingModule.order !== undefined) {
      setModules(prev => prev.map(m =>
        m.order === editingModule.order ? module : m
      ));
    } else {
      setModules(prev => [...prev, { ...module, order: prev.length }]);
    }
    setShowModuleModal(false);
    setEditingModule(null);
  };

  const deleteModule = (order: number) => {
    if (confirm('Are you sure you want to delete this module?')) {
      setModules(prev => prev.filter(m => m.order !== order).map((m, i) => ({ ...m, order: i })));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9]"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Link href="/dashboard/admin/courses" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {isWebinar ? 'Create New Webinar' : 'Create New Course'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isWebinar ? '📝 Webinar Details' : '📝 Basic Information'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isWebinar ? 'Webinar Title *' : 'Course Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                  placeholder={isWebinar ? 'Supporting Children Through Exam Stress...' : 'Complete Python Programming...'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                  placeholder={isWebinar ? 'Describe what attendees will gain from this webinar...' : 'Describe what students will learn...'}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Category — hidden for webinars */}
                {!isWebinar && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required={!isWebinar}
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                    >
                      <option value="">Select category...</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                  >
                    <option value="lms_course">LMS Course</option>
                    <option value="recorded">Recorded</option>
                    <option value="live_session">Live Session (Webinar)</option>
                    <option value="resource">Resource</option>
                  </select>
                </div>

                {/* Instructor — hidden for webinars (they use the free-text Speaker field below) */}
                {!isWebinar && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructor <span className="text-xs">(optional)</span>
                    </label>
                    <select
                      value={formData.instructor}
                      onChange={e => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                    >
                      <option value="">No specific instructor (admin)</option>
                      {tutors.map(tutor => (
                        <option key={tutor.id} value={tutor.id}>{tutor.name} ({tutor.email})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Level — hidden for webinars */}
                {!isWebinar && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level
                    </label>
                    <select
                      value={formData.level}
                      onChange={e => setFormData(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail
                </label>
                <div className="flex items-center gap-4">
                  {formData.thumbnail && (
                    <img src={formData.thumbnail} alt="Thumbnail" className="w-32 h-24 object-cover rounded-lg" />
                  )}
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <Upload className="w-4 h-4" />
                    {uploadingThumbnail ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      disabled={uploadingThumbnail}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Webinar-specific scheduling fields */}
          {isWebinar && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📅 Webinar Schedule &amp; Details</h2>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> Audience *</span>
                  </label>
                  <select
                    required={isWebinar}
                    value={webinarData.audience}
                    onChange={e => setWebinarData(prev => ({ ...prev, audience: e.target.value as typeof prev.audience }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                  >
                    <option value="students">Students</option>
                    <option value="parents">Parents</option>
                    <option value="educators">Educators</option>
                  </select>
                </div>

                {/* Speaker / Host (free-text override) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="inline-flex items-center gap-1"><Mic2 className="w-4 h-4" /> Speaker / Host</span>
                  </label>
                  <input
                    type="text"
                    value={webinarData.speaker}
                    onChange={e => setWebinarData(prev => ({ ...prev, speaker: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                    placeholder="e.g. Dr. Sarah Johnson"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> Date *</span>
                  </label>
                  <input
                    type="date"
                    required={isWebinar}
                    value={webinarData.date}
                    onChange={e => setWebinarData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> Start Time *</span>
                  </label>
                  <input
                    type="time"
                    required={isWebinar}
                    value={webinarData.startTime}
                    onChange={e => setWebinarData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> End Time *</span>
                  </label>
                  <input
                    type="time"
                    required={isWebinar}
                    value={webinarData.endTime}
                    onChange={e => setWebinarData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                  />
                </div>
              </div>

              {/* Webinar toggles */}
              <div className="flex flex-wrap gap-6 mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webinarData.includedWithMembership}
                    onChange={e => setWebinarData(prev => ({ ...prev, includedWithMembership: e.target.checked }))}
                    className="w-4 h-4 text-[#7AC2F9] rounded focus:ring-[#7AC2F9]"
                  />
                  <span className="text-sm font-medium text-gray-700">Included with tutoring membership?</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webinarData.recordingAvailable}
                    onChange={e => setWebinarData(prev => ({ ...prev, recordingAvailable: e.target.checked }))}
                    className="w-4 h-4 text-[#7AC2F9] rounded focus:ring-[#7AC2F9]"
                  />
                  <span className="text-sm font-medium text-gray-700">Recording available afterwards?</span>
                </label>
              </div>
            </div>
          )}

          {/* Pricing & Settings */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">💰 Pricing &amp; Settings</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (£) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                  placeholder="49.99"
                />
              </div>

              {/* Duration — hidden for webinars (derived from start/end times) */}
              {!isWebinar && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    required={!isWebinar}
                    min="1"
                    value={formData.duration}
                    onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                    placeholder="720"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isWebinar ? 'Max Attendees' : 'Max Students'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxStudents}
                  onChange={e => setFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-[#7AC2F9] rounded focus:ring-[#7AC2F9]"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={e => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4 text-[#7AC2F9] rounded focus:ring-[#7AC2F9]"
                />
                <span className="text-sm font-medium text-gray-700">{isWebinar ? 'Featured Webinar' : 'Featured Course'}</span>
              </label>
            </div>
          </div>

          {/* Modules — hidden for webinars */}
          {!isWebinar && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">📚 Course Modules</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingModule(null);
                    setShowModuleModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#7AC2F9] text-white rounded-lg hover:bg-[#6AB2E9]"
                >
                  <Plus className="w-4 h-4" />
                  Add Module
                </button>
              </div>

              {modules.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No modules added yet</p>
              ) : (
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{module.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{module.type}</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{module.accessLevel}</span>
                          {module.isPreview && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">Free Preview</span>}
                          {!module.isActive && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">Inactive</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteModule(module.order)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#7AC2F9] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6AB2E9] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? (isWebinar ? 'Creating Webinar...' : 'Creating Course...')
                : (isWebinar ? 'Create Webinar' : 'Create Course')}
            </button>
            <Link
              href="/dashboard/admin/courses"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Module Modal */}
        {showModuleModal && (
          <ModuleModal
            onClose={() => {
              setShowModuleModal(false);
              setEditingModule(null);
            }}
            onSave={addModule}
            editingModule={editingModule}
          />
        )}
      </div>
    </div>
  );
}

// Module Modal Component
function ModuleModal({
  onClose,
  onSave,
  editingModule
}: {
  onClose: () => void;
  onSave: (module: Module) => void;
  editingModule: Module | null;
}) {
  const [moduleData, setModuleData] = useState<Module>(
    editingModule || {
      title: '',
      description: '',
      type: 'video',
      order: 0,
      isPreview: false,
      isActive: true,
      accessLevel: 'enrolled_only',
      content: {}
    }
  );

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingVideo(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('video', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            setModuleData(prev => ({
              ...prev,
              content: {
                ...prev.content,
                videoUrl: data.video.url,
                videoCloudinaryId: data.video.publicId,
                videoDuration: data.video.duration
              }
            }));
            alert('Video uploaded successfully!');
          } else {
            alert(data.message || 'Failed to upload video');
          }
        } else {
          alert('Failed to upload video');
        }
        setUploadingVideo(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        alert('Failed to upload video');
        setUploadingVideo(false);
        setUploadProgress(0);
      });

      xhr.open('POST', '/api/upload/video', true);
      xhr.setRequestHeader('credentials', 'include');
      xhr.send(formData);

    } catch (error) {
      console.error('Video upload error:', error);
      alert('Failed to upload video');
      setUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDocument(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('document', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            setModuleData(prev => ({
              ...prev,
              content: {
                ...prev.content,
                documentUrl: data.document.url,
                documentCloudinaryId: data.document.publicId
              }
            }));
            alert('Document uploaded successfully!');
          } else {
            alert(data.message || 'Failed to upload document');
          }
        } else {
          alert('Failed to upload document');
        }
        setUploadingDocument(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        alert('Failed to upload document');
        setUploadingDocument(false);
        setUploadProgress(0);
      });

      xhr.open('POST', '/api/upload/document', true);
      xhr.setRequestHeader('credentials', 'include');
      xhr.send(formData);

    } catch (error) {
      console.error('Document upload error:', error);
      alert('Failed to upload document');
      setUploadingDocument(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleData.title || !moduleData.description) {
      alert('Please fill in title and description');
      return;
    }

    // Validate based on type
    if (moduleData.type === 'video' && !moduleData.content.videoUrl) {
      if (!confirm('No video uploaded. Continue anyway?')) return;
    }
    if (moduleData.type === 'document' && !moduleData.content.documentUrl) {
      if (!confirm('No document uploaded. Continue anyway?')) return;
    }

    onSave(moduleData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-2xl font-bold mb-4">{editingModule ? 'Edit' : 'Add'} Module</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={moduleData.title}
              onChange={e => setModuleData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={moduleData.description}
              onChange={e => setModuleData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={moduleData.type}
                onChange={e => setModuleData(prev => ({ ...prev, type: e.target.value as Module['type'] }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
              >
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Level *</label>
              <select
                value={moduleData.accessLevel}
                onChange={e => setModuleData(prev => ({ ...prev, accessLevel: e.target.value as Module['accessLevel'] }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AC2F9]"
              >
                <option value="free">Free (Anyone can view)</option>
                <option value="enrolled_only">Enrolled Only</option>
                <option value="premium">Premium (Subscription)</option>
              </select>
            </div>
          </div>

          {/* Video Upload Section */}
          {moduleData.type === 'video' && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Video
              </label>

              {moduleData.content.videoUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-green-700">Video uploaded successfully</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModuleData(prev => ({
                        ...prev,
                        content: { ...prev.content, videoUrl: undefined, videoCloudinaryId: undefined, videoDuration: undefined }
                      }))}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <a
                    href={moduleData.content.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline block"
                  >
                    View uploaded video
                  </a>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploadingVideo}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploadingVideo
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                      : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                  >
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {uploadingVideo ? `Uploading... ${uploadProgress}%` : 'Click to upload video'}
                    </span>
                  </label>
                  {uploadingVideo && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: MP4, AVI, MOV (Max 100MB)
                  </p>
                </>
              )}
            </div>
          )}

          {/* Document Upload Section */}
          {moduleData.type === 'document' && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document
              </label>

              {moduleData.content.documentUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-green-700">Document uploaded successfully</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModuleData(prev => ({
                        ...prev,
                        content: { ...prev.content, documentUrl: undefined, documentCloudinaryId: undefined }
                      }))}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <a
                    href={moduleData.content.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline block"
                  >
                    View uploaded document
                  </a>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={handleDocumentUpload}
                    disabled={uploadingDocument}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploadingDocument
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                      : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                  >
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {uploadingDocument ? `Uploading... ${uploadProgress}%` : 'Click to upload document'}
                    </span>
                  </label>
                  {uploadingDocument && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT (Max 50MB)
                  </p>
                </>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={moduleData.isPreview}
                onChange={e => setModuleData(prev => ({ ...prev, isPreview: e.target.checked }))}
                className="w-4 h-4 text-[#7AC2F9] rounded"
              />
              <span className="text-sm font-medium">Free Preview</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={moduleData.isActive}
                onChange={e => setModuleData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-[#7AC2F9] rounded"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={uploadingVideo || uploadingDocument}
              className="flex-1 bg-[#7AC2F9] text-white px-4 py-2 rounded-lg hover:bg-[#6AB2E9] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Module
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
