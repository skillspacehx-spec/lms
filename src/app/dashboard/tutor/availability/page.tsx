"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Clock, Plus, Trash2, Save, AlertCircle, CheckCircle2, Eye } from 'lucide-react';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  _id?: string;
}

export default function TutorAvailability() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  // Helper to check if a day has availability
  const getDayAvailability = (day: string) => {
    return availability.filter(slot => slot.day === day);
  };

  // Helper to format time range
  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  // Validate time slot
  const validateTimeSlot = (slot: TimeSlot): string | null => {
    if (!slot.day || !slot.startTime || !slot.endTime) {
      return 'All fields are required';
    }
    
    const [startHour] = slot.startTime.split(':').map(Number);
    const [endHour] = slot.endTime.split(':').map(Number);
    
    if (startHour >= endHour) {
      return 'End time must be after start time';
    }
    
    return null;
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== 'tutor')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'tutor') {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      console.log('Fetching availability...');
      const response = await fetch('/api/calendar/availability', {
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Availability data:', data);
        setAvailability(data.availability || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch availability:', errorData);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const addTimeSlot = () => {
    const newSlot = { day: 'Monday', startTime: '09:00', endTime: '17:00' };
    console.log('=== ADD TIME SLOT DEBUG ===');
    console.log('New slot to add:', newSlot);
    console.log('Current availability before add:', availability);
    const updatedAvailability = [...availability, newSlot];
    console.log('Updated availability after add:', updatedAvailability);
    setAvailability(updatedAvailability);
    setHasChanges(true);
  };

  const removeTimeSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
    setHasChanges(true);
  };

  const saveAvailability = async () => {
    // Validate all slots
    for (let i = 0; i < availability.length; i++) {
      const error = validateTimeSlot(availability[i]);
      if (error) {
        setMessage(`Slot ${i + 1}: ${error}`);
        setMessageType('error');
        setTimeout(() => setMessage(''), 5000);
        return;
      }
    }

    setIsSaving(true);
    setMessage('');

    console.log('=== SAVE AVAILABILITY DEBUG ===');
    console.log('Current availability state:', availability);
    console.log('Availability length:', availability.length);
    console.log('First slot (if exists):', availability[0]);
    
    const payload = { availability };
    console.log('Payload to send:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('/api/calendar/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      console.log('Save response status:', response.status);
      const data = await response.json();
      console.log('Save response data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        setMessage('✓ Availability saved successfully! Students can now book during these times.');
        setMessageType('success');
        setHasChanges(false);
        // Refresh data from server to confirm
        await fetchAvailability();
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage('Failed to save availability: ' + (data.message || 'Unknown error'));
        setMessageType('error');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      setMessage('Error saving availability. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Manage Your Availability
            </h1>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              <Eye className="w-5 h-5" />
              {showPreview ? 'Hide' : 'Show'} Calendar Preview
            </button>
          </div>
          <p className="text-lg text-gray-600">
            Set your weekly recurring schedule for student bookings
          </p>
          {hasChanges && (
            <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              You have unsaved changes
            </div>
          )}
        </div>

        {/* Message Alert */}
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
          {/* Left Column: Time Slots Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Time Slots */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
                  <p className="text-sm text-gray-500 mt-1">Add time blocks for each day you&apos;re available</p>
                </div>
                <button
                  onClick={addTimeSlot}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7AC2F9] to-[#5AA3D9] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Add Time Slot
                </button>
              </div>

              {availability.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold mb-2 text-lg">No availability set yet</p>
                  <p className="text-gray-500 mb-6 text-sm">Add your first time slot to start accepting bookings</p>
                  <button
                    onClick={addTimeSlot}
                    className="px-6 py-3 bg-gradient-to-r from-[#7AC2F9] to-[#5AA3D9] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    Add Your First Time Slot
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {availability.map((slot, index) => {
                    const error = validateTimeSlot(slot);
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                          error 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Day</label>
                            <select
                              value={slot.day}
                              onChange={(e) => updateTimeSlot(index, 'day', e.target.value)}
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                            >
                              {daysOfWeek.map(day => (
                                <option key={day} value={day}>{day}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <select
                                value={slot.startTime}
                                onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                              >
                                {timeSlots.map(time => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">End Time</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <select
                                value={slot.endTime}
                                onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                              >
                                {timeSlots.map(time => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeTimeSlot(index)}
                          className="p-3 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                          title="Remove slot"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Save Actions */}
            {availability.length > 0 && (
              <div className="flex justify-between items-center gap-4 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{availability.length} time slot{availability.length !== 1 ? 's' : ''} configured</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.back()}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveAvailability}
                    disabled={isSaving || !hasChanges}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#7AC2F9] to-[#5AA3D9] text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Calendar Preview & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Calendar Preview */}
            {showPreview && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Weekly Overview
                </h3>
                <div className="space-y-2">
                  {daysOfWeek.map(day => {
                    const daySlots = getDayAvailability(day);
                    return (
                      <div key={day} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900 text-sm">{day}</span>
                          {daySlots.length > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {daySlots.length > 0 ? (
                          <div className="space-y-1">
                            {daySlots.map((slot, idx) => (
                              <div key={idx} className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeRange(slot.startTime, slot.endTime)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Not available</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex gap-3">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-2 text-lg">How it works</h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Set your weekly recurring availability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Students can only book during these times</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Add multiple slots for the same day if needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>Update anytime to reflect your schedule changes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Stats Box */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Availability Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Days Available</span>
                  <span className="text-xl font-bold text-blue-600">
                    {new Set(availability.map(s => s.day)).size}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Time Slots</span>
                  <span className="text-xl font-bold text-green-600">
                    {availability.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Hours per Week</span>
                  <span className="text-xl font-bold text-purple-600">
                    {availability.reduce((total, slot) => {
                      const [startH] = slot.startTime.split(':').map(Number);
                      const [endH] = slot.endTime.split(':').map(Number);
                      return total + (endH - startH);
                    }, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
