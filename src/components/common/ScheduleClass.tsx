'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  Save,
  X,
  AlertCircle,
  Check,
  Settings,
  Link,
  Copy,
  Eye
} from 'lucide-react';
import Button from './Button';
import CalendarComponent from './Calendar';

interface ScheduleFormData {
  title: string;
  description: string;
  courseId?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxStudents: number;
  price?: number;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
  zoomSettings: {
    requireRegistration: boolean;
    enableWaitingRoom: boolean;
    allowRecording: boolean;
    mutParticipantsOnEntry: boolean;
  };
}

interface Course {
  _id: string;
  title: string;
  category: string;
}

interface ScheduleClassProps {
  courses?: Course[];
  onSchedule?: (data: ScheduleFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ScheduleFormData>;
  isEdit?: boolean;
}

export default function ScheduleClass({
  courses = [],
  onSchedule,
  onCancel,
  initialData,
  isEdit = false
}: ScheduleClassProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: '',
    description: '',
    courseId: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: 60,
    maxStudents: 30,
    price: 0,
    isRecurring: false,
    zoomSettings: {
      requireRegistration: true,
      enableWaitingRoom: true,
      allowRecording: true,
      mutParticipantsOnEntry: true
    },
    ...initialData
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    // Auto-calculate end time when start time or duration changes
    if (formData.startTime && formData.duration) {
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate.getTime() + formData.duration * 60000);
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      
      setFormData(prev => ({ ...prev, endTime }));
    }
  }, [formData.startTime, formData.duration]);

  const handleInputChange = (field: keyof ScheduleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleZoomSettingsChange = (setting: keyof ScheduleFormData['zoomSettings'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      zoomSettings: {
        ...prev.zoomSettings,
        [setting]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (formData.duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes';
    }

    if (formData.maxStudents < 1) {
      newErrors.maxStudents = 'Maximum students must be at least 1';
    }

    // Check if date/time is in the future
    if (formData.date && formData.startTime) {
      const scheduledDateTime = new Date(`${formData.date}T${formData.startTime}`);
      if (scheduledDateTime <= new Date()) {
        newErrors.date = 'Schedule date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSchedule) {
        await onSchedule(formData);
      }
    } catch (error) {
      console.error('Error scheduling class:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRecurringSessions = () => {
    if (!formData.isRecurring || !formData.recurringPattern) return [];
    
    const sessions = [];
    const startDate = new Date(`${formData.date}T${formData.startTime}`);
    const endDate = formData.recurringPattern.endDate 
      ? new Date(formData.recurringPattern.endDate)
      : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months default

    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      sessions.push(new Date(currentDate));
      
      switch (formData.recurringPattern.frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + formData.recurringPattern.interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * formData.recurringPattern.interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + formData.recurringPattern.interval);
          break;
      }
    }

    return sessions.slice(0, 20); // Limit to 20 sessions
  };

  const getPreviewText = () => {
    const selectedCourse = courses.find(c => c._id === formData.courseId);
    const recuringSessions = formData.isRecurring ? generateRecurringSessions() : [];
    
    return {
      course: selectedCourse?.title || 'No course selected',
      dateTime: formData.date && formData.startTime 
        ? `${new Date(formData.date).toLocaleDateString()} at ${formData.startTime}`
        : 'No date/time set',
      duration: `${formData.duration} minutes`,
      capacity: `${formData.maxStudents} students`,
      recurring: formData.isRecurring 
        ? `${recuringSessions.length} sessions (${formData.recurringPattern?.frequency})`
        : 'Single session'
    };
  };

  const previewInfo = getPreviewText();

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit' : 'Schedule'} Live Class
            </h2>
            <p className="mt-1 text-gray-600">
              Create and schedule live video sessions for your students
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Title */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter class title"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Course (Optional)
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => handleInputChange('courseId', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent"
            >
              <option value="">No course selected</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Max Students */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Students *
            </label>
            <input
              type="number"
              value={formData.maxStudents}
              onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 0)}
              min="1"
              max="1000"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent ${
                errors.maxStudents ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.maxStudents && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.maxStudents}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe what students will learn in this class"
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.date}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time *
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent ${
                errors.startTime ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.startTime}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <select
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] focus:border-transparent ${
                errors.duration ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.duration}
              </p>
            )}
          </div>
        </div>

        {/* Recurring Options */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.isRecurring}
              onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
              className="w-4 h-4 text-[#7AC2F9] border-gray-300 rounded focus:ring-[#7AC2F9]"
            />
            <label htmlFor="recurring" className="ml-2 text-sm font-medium text-gray-700">
              Create recurring sessions
            </label>
          </div>

          {formData.isRecurring && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.recurringPattern?.frequency || 'weekly'}
                    onChange={(e) => handleInputChange('recurringPattern', {
                      ...formData.recurringPattern,
                      frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat every
                  </label>
                  <input
                    type="number"
                    value={formData.recurringPattern?.interval || 1}
                    onChange={(e) => handleInputChange('recurringPattern', {
                      ...formData.recurringPattern,
                      interval: parseInt(e.target.value) || 1
                    })}
                    min="1"
                    max="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End date
                  </label>
                  <input
                    type="date"
                    value={formData.recurringPattern?.endDate || ''}
                    onChange={(e) => handleInputChange('recurringPattern', {
                      ...formData.recurringPattern,
                      endDate: e.target.value
                    })}
                    min={formData.date}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#7AC2F9]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Settings */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-[#7AC2F9] hover:text-[#6AB4ED] font-medium"
          >
            <Settings className="w-5 h-5" />
            <span>Advanced Settings</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg space-y-4">
              <h4 className="font-medium text-gray-900">Zoom Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'requireRegistration', label: 'Require registration' },
                  { key: 'enableWaitingRoom', label: 'Enable waiting room' },
                  { key: 'allowRecording', label: 'Allow recording' },
                  { key: 'mutParticipantsOnEntry', label: 'Mute participants on entry' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center">
                    <input
                      type="checkbox"
                      id={setting.key}
                      checked={formData.zoomSettings[setting.key as keyof typeof formData.zoomSettings]}
                      onChange={(e) => handleZoomSettingsChange(setting.key as keyof typeof formData.zoomSettings, e.target.checked)}
                      className="w-4 h-4 text-[#7AC2F9] border-gray-300 rounded focus:ring-[#7AC2F9]"
                    />
                    <label htmlFor={setting.key} className="ml-2 text-sm text-gray-700">
                      {setting.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Class Preview
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-800">Course:</span>
              <span className="text-blue-900 font-medium">{previewInfo.course}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">Date & Time:</span>
              <span className="text-blue-900 font-medium">{previewInfo.dateTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">Duration:</span>
              <span className="text-blue-900 font-medium">{previewInfo.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">Capacity:</span>
              <span className="text-blue-900 font-medium">{previewInfo.capacity}</span>
            </div>
            <div className="flex justify-between md:col-span-2">
              <span className="text-blue-800">Recurring:</span>
              <span className="text-blue-900 font-medium">{previewInfo.recurring}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex space-x-3">
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={() => setShowCalendar(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>View Calendar</span>
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Scheduling...' : isEdit ? 'Update Class' : 'Schedule Class'}</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Class Schedule Calendar</h3>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <CalendarComponent
                events={[]}
                view="month"
                onEventClick={(event) => console.log('Event clicked:', event)}
                className="h-96"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}