/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  GripVertical,
  Trash2
} from 'lucide-react';

interface Module {
  _id?: string; // Existing modules have an ID
  title: string;
  description: string;
  type: 'video' | 'document' | 'quiz' | 'assignment';
  accessLevel: 'free' | 'enrolled_only' | 'premium';
  isPreview: boolean;
  isActive: boolean;
  order: number;
  isNew?: boolean; // Flag for newly added modules
  isDeleted?: boolean; // Flag for modules to be deleted
  content?: {
    videoUrl?: string;
    videoCloudinaryId?: string;
    videoDuration?: number;
    documentUrl?: string;
    documentCloudinaryId?: string;
  };
}

interface FormData {
  title: string;
  description: string;
  category: string;
  instructor: string;
  type: 'lms_course' | 'recorded' | 'live_session' | 'resource';
  duration: number;
  price: number;
  thumbnail: string;
  level: 'all' | 'beginner' | 'intermediate' | 'advanced';
  language: string;
  maxStudents: number | null;
  isActive: boolean;
  isFeatured: boolean;
  prerequisites: string[];
  learningOutcomes: string[];
  tags: string[];
}

interface ModuleModalProps {
  onClose: () => void;
  onSave: (module: Module) => void;
  editingModule?: Module | null;
}

const ModuleModal = ({ onClose, onSave, editingModule }: ModuleModalProps) => {
  const [moduleData, setModuleData] = useState<Module>({
    title: editingModule?.title || '',
    description: editingModule?.description || '',
    type: editingModule?.type || 'video',
    accessLevel: editingModule?.accessLevel || 'enrolled_only',
    isPreview: editingModule?.isPreview || false,
    isActive: editingModule?.isActive !== undefined ? editingModule.isActive : true,
    order: editingModule?.order || 0,
    _id: editingModule?._id,
    isNew: editingModule?.isNew,
    content: editingModule?.content || {}
  });

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
      xhr.send(formData);

    } catch (error) {
      console.error('Document upload error:', error);
      alert('Failed to upload document');
      setUploadingDocument(false);
      setUploadProgress(0);
    }
  };

  const handleSave = () => {
    if (!moduleData.title || !moduleData.description) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(moduleData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingModule ? 'Edit Module' : 'Add Module'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Module Title *
              </label>
              <input
                type="text"
                value={moduleData.title}
                onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Introduction to Variables"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={moduleData.description}
                onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of what this module covers"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={moduleData.type}
                onChange={(e) => setModuleData({ ...moduleData, type: e.target.value as Module['type'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Access Level
              </label>
              <select
                value={moduleData.accessLevel}
                onChange={(e) => setModuleData({ ...moduleData, accessLevel: e.target.value as Module['accessLevel'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="free">Free (Anyone can view)</option>
                <option value="enrolled_only">Enrolled Only</option>
                <option value="premium">Premium (Subscription)</option>
              </select>
            </div>

            {/* Video Upload Section */}
            {moduleData.type === 'video' && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Video
                </label>

                {moduleData.content?.videoUrl ? (
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
                      id="video-upload-edit"
                    />
                    <label
                      htmlFor="video-upload-edit"
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

                {moduleData.content?.documentUrl ? (
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
                      id="document-upload-edit"
                    />
                    <label
                      htmlFor="document-upload-edit"
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

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={moduleData.isPreview}
                  onChange={(e) => setModuleData({ ...moduleData, isPreview: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Free Preview Module
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={moduleData.isActive}
                  onChange={(e) => setModuleData({ ...moduleData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={uploadingVideo || uploadingDocument}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingModule ? 'Update Module' : 'Add Module'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EditCoursePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    instructor: '',
    type: 'lms_course',
    duration: 60,
    price: 0,
    thumbnail: '',
    level: 'all',
    language: 'English',
    maxStudents: null,
    isActive: true,
    isFeatured: false,
    prerequisites: [],
    learningOutcomes: [],
    tags: []
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCourse();
      fetchCategories();
      fetchTutors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, courseId]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        credentials: 'include'
      });

      const data = await response.json();

      console.log('DEBUG Edit Page: Full API response:', data);
      console.log('DEBUG Edit Page: Course data:', data.course);
      console.log('DEBUG Edit Page: Modules:', data.course?.modules);

      if (data.success && data.course) {
        const course = data.course;
        setFormData({
          title: course.title || '',
          description: course.description || '',
          category: course.category?._id || '',
          instructor: course.instructor?._id || '',
          type: course.type || 'lms_course',
          duration: course.duration || 60,
          price: course.price || 0,
          thumbnail: course.thumbnail || '',
          level: course.level || 'all',
          language: course.language || 'English',
          maxStudents: course.maxStudents || null,
          isActive: course.isActive !== undefined ? course.isActive : true,
          isFeatured: course.isFeatured || false,
          prerequisites: course.prerequisites || [],
          learningOutcomes: course.learningOutcomes || [],
          tags: course.tags || []
        });

        // Load existing modules - FIX: modules are inside course.modules, not data.modules
        if (course.modules && course.modules.length > 0) {
          console.log('DEBUG Edit Page: Loading', course.modules.length, 'modules');
          setModules(course.modules.map((m: any) => ({
            _id: m._id,
            title: m.title,
            description: m.description,
            type: m.type,
            accessLevel: m.accessLevel,
            isPreview: m.isPreview,
            isActive: m.isActive,
            order: m.order,
            content: m.content || {},
            isNew: false,
            isDeleted: false
          })));
        } else {
          console.log('DEBUG Edit Page: No modules found in course');
        }
      } else {
        alert('Failed to load course');
        router.push('/dashboard/admin/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Failed to load course');
      router.push('/dashboard/admin/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await fetch('/api/users?role=tutor', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setTutors(data.users);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingThumbnail(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setFormData(prev => ({ ...prev, thumbnail: data.imageUrl }));
        alert('Thumbnail uploaded successfully!');
      } else {
        alert(data.message || 'Failed to upload thumbnail');
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert('Failed to upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const addModule = (module: Module) => {
    console.log('DEBUG addModule: Received module', {
      title: module.title,
      type: module.type,
      hasContent: !!module.content,
      content: module.content
    });

    if (editingModule) {
      // Update existing module
      setModules(modules.map(m =>
        m.order === editingModule.order ? {
          ...module,
          _id: editingModule._id,
          order: editingModule.order,
          isNew: editingModule.isNew !== undefined ? editingModule.isNew : !editingModule._id
        } : m
      ));
    } else {
      // Add new module
      setModules([...modules, { ...module, order: modules.length, isNew: true }]);
    }
    setShowModuleModal(false);
    setEditingModule(null);
  };

  const deleteModule = (moduleToDelete: Module) => {
    if (!confirm('Are you sure you want to delete this module?')) return;

    if (moduleToDelete._id && !moduleToDelete.isNew) {
      // Mark existing module for deletion (will be deleted on submit)
      setModules(modules.map(m =>
        m._id === moduleToDelete._id ? { ...m, isDeleted: true } : m
      ));
    } else {
      // Remove new module from list
      setModules(modules.filter(m => m.order !== moduleToDelete.order));
      // Re-index orders
      setModules(prev => prev.map((m, i) => ({ ...m, order: i })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚀 DEBUG handleSubmit: FORM SUBMITTED - UPDATE COURSE BUTTON CLICKED');
    console.log('DEBUG: Total modules to process:', modules.length);
    modules.forEach((m, idx) => {
      console.log(`DEBUG: Module ${idx + 1}:`, {
        title: m.title,
        type: m.type,
        isNew: m.isNew,
        isDeleted: m.isDeleted,
        hasContent: !!m.content,
        content: m.content
      });
    });

    if (!formData.title || !formData.description || !formData.category || !formData.duration) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // Update course
      const courseResponse = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const courseData = await courseResponse.json();

      if (!courseData.success) {
        alert(courseData.message || 'Failed to update course');
        return;
      }

      // Handle module changes
      const visibleModules = modules.filter(m => !m.isDeleted);

      // Delete marked modules
      const deletedModules = modules.filter(m => m.isDeleted && m._id);
      for (const courseModule of deletedModules) {
        try {
          await fetch(`/api/admin/courses/${courseId}/content/${courseModule._id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
        } catch (error) {
          console.error('Error deleting module:', error);
        }
      }

      // Update existing modules or create new ones
      for (const courseModule of visibleModules) {
        const modulePayload = {
          title: courseModule.title,
          description: courseModule.description,
          type: courseModule.type,
          accessLevel: courseModule.accessLevel,
          isPreview: courseModule.isPreview,
          isActive: courseModule.isActive,
          order: courseModule.order,
          content: courseModule.content || {}
        };

        console.log('DEBUG: Saving module with content:', {
          title: courseModule.title,
          hasContent: !!courseModule.content,
          content: courseModule.content
        });

        if (courseModule.isNew) {
          // Create new module
          const response = await fetch(`/api/admin/courses/${courseId}/content`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modulePayload)
          });
          const result = await response.json();
          console.log('DEBUG: Create module response:', result);
        } else if (courseModule._id) {
          // Update existing module
          const response = await fetch(`/api/admin/courses/${courseId}/content/${courseModule._id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modulePayload)
          });
          const result = await response.json();
          console.log('DEBUG: Update module response:', result);
        }
      }

      alert('Course updated successfully!');
      router.push('/dashboard/admin/courses');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const visibleModules = modules.filter(m => !m.isDeleted);

  console.log('DEBUG Edit Page Render:');
  console.log('- Form title:', formData.title);
  console.log('- Form category:', formData.category);
  console.log('- Form instructor:', formData.instructor);
  console.log('- Total modules:', modules.length);
  console.log('- Visible modules:', visibleModules.length);
  console.log('- Categories loaded:', categories.length);
  console.log('- Tutors loaded:', tutors.length);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/admin/courses"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-600 mt-2">Update course information and modules</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              📝 Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Complete Python Programming Course"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter course description..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as FormData['type'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lms_course">LMS Course</option>
                    <option value="recorded">Recorded Course</option>
                    <option value="live_session">Live Session</option>
                    <option value="resource">Resource</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instructor
                  </label>
                  <select
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select instructor</option>
                    {tutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as FormData['level'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thumbnail
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingThumbnail ? 'Uploading...' : 'Upload Thumbnail'}
                  </label>
                  {formData.thumbnail && (
                    <div className="flex items-center gap-2">
                      <img
                        src={formData.thumbnail}
                        alt="Thumbnail preview"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, thumbnail: '' })}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Settings */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              💰 Pricing & Settings
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (£) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Students
                </label>
                <input
                  type="number"
                  value={formData.maxStudents || ''}
                  onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured
                </span>
              </label>
            </div>
          </div>

          {/* Course Modules */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                📚 Course Modules
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingModule(null);
                  setShowModuleModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Module
              </button>
            </div>

            {visibleModules.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No modules added yet. Click &quot;Add Module&quot; to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleModules.map((module, index) => (
                  <div
                    key={module._id || module.order}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 mb-1">
                              {index + 1}. {module.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                                {module.type}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-semibold">
                                {module.accessLevel.replace('_', ' ')}
                              </span>
                              {module.isPreview && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                                  Free Preview
                                </span>
                              )}
                              {!module.isActive && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                                  Inactive
                                </span>
                              )}
                              {module.isNew && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingModule(module);
                                setShowModuleModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteModule(module)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating Course...' : 'Update Course'}
            </button>
            <Link
              href="/dashboard/admin/courses"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-center"
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
