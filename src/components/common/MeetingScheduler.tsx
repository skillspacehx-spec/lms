'use client';

import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';

interface MeetingSchedulerProps {
  tutorId: string;
  tutorName: string;
  studentId: string;
  studentName: string;
  onSchedule: (meetingData: MeetingData) => Promise<void>;
  onCancel: () => void;
}

export interface MeetingData {
  tutorId: string;
  studentId: string;
  scheduledAt: string;
  duration: number;
  meetingType: string;
  agenda: { item: string; completed: boolean }[];
  isRecurring: boolean;
  recurrencePattern: string;
}

const MEETING_TYPES = [
  { value: 'progress_review', label: 'Progress Review' },
  { value: 'goal_setting', label: 'Goal Setting' },
  { value: 'concerns', label: 'Discuss Concerns' },
  { value: 'general', label: 'General Check-in' }
];

const DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes' }
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'One-time meeting' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' }
];

export default function MeetingScheduler({
  tutorId,
  tutorName,
  studentId,
  studentName,
  onSchedule,
  onCancel
}: MeetingSchedulerProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [meetingType, setMeetingType] = useState('progress_review');
  const [recurrence, setRecurrence] = useState('none');
  const [agenda, setAgenda] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Generate next 14 days (excluding weekends for default availability)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends for default availability
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const availableDates = generateAvailableDates();

  const addAgendaItem = () => {
    setAgenda([...agenda, '']);
  };

  const updateAgendaItem = (index: number, value: string) => {
    const newAgenda = [...agenda];
    newAgenda[index] = value;
    setAgenda(newAgenda);
  };

  const removeAgendaItem = (index: number) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`).toISOString();
      
      const meetingData: MeetingData = {
        tutorId,
        studentId,
        scheduledAt,
        duration,
        meetingType,
        agenda: agenda.filter(item => item.trim()).map(item => ({ item, completed: false })),
        isRecurring: recurrence !== 'none',
        recurrencePattern: recurrence
      };

      await onSchedule(meetingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#191919]">
              Schedule Progress Meeting
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              With {tutorName} for {studentName}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-[#7AC2F9] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-20 h-1 mx-2 ${
                      step > s ? 'bg-[#7AC2F9]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-2 text-xs text-gray-600">
            <span>Date & Time</span>
            <span>Meeting Details</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Date and Time */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableDates.map((date) => {
                    const dateObj = new Date(date);
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = dateObj.getDate();
                    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
                    
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          selectedDate === date
                            ? 'border-[#7AC2F9] bg-[#7AC2F9]/10'
                            : 'border-gray-200 hover:border-[#7AC2F9]/50'
                        }`}
                      >
                        <div className="text-xs text-gray-600">{dayName}</div>
                        <div className="text-lg font-bold text-[#191919]">{dayNum}</div>
                        <div className="text-xs text-gray-600">{monthName}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg border-2 text-sm transition-all ${
                        selectedTime === time
                          ? 'border-[#7AC2F9] bg-[#7AC2F9]/10 font-medium'
                          : 'border-gray-200 hover:border-[#7AC2F9]/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map((dur) => (
                    <button
                      key={dur.value}
                      onClick={() => setDuration(dur.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        duration === dur.value
                          ? 'border-[#7AC2F9] bg-[#7AC2F9]/10 font-medium'
                          : 'border-gray-200 hover:border-[#7AC2F9]/50'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Meeting Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Type
                </label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#7AC2F9] focus:outline-none"
                >
                  {MEETING_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recurrence
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#7AC2F9] focus:outline-none"
                >
                  {RECURRENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {recurrence !== 'none' && (
                  <p className="text-xs text-gray-600 mt-2">
                    This will automatically schedule {recurrence} meetings at the same time
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Agenda Items (Optional)
                  </label>
                  <button
                    onClick={addAgendaItem}
                    className="text-sm text-[#7AC2F9] hover:text-[#6AB4ED] flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {agenda.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateAgendaItem(index, e.target.value)}
                        placeholder={`Agenda item ${index + 1}`}
                        className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-[#7AC2F9] focus:outline-none"
                      />
                      {agenda.length > 1 && (
                        <button
                          onClick={() => removeAgendaItem(index)}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-[#191919]">Meeting Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tutor:</span>
                    <span className="font-medium">{tutorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student:</span>
                    <span className="font-medium">{studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">
                      {MEETING_TYPES.find(t => t.value === meetingType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recurrence:</span>
                    <span className="font-medium">
                      {RECURRENCE_OPTIONS.find(r => r.value === recurrence)?.label}
                    </span>
                  </div>
                </div>

                {agenda.some(item => item.trim()) && (
                  <div>
                    <h4 className="font-medium text-[#191919] mb-2">Agenda:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {agenda.filter(item => item.trim()).map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-[#7AC2F9] mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  📧 You and the tutor will receive email confirmations with calendar invites.
                  A Zoom meeting link will be provided 24 hours before the meeting.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-between">
          <button
            onClick={() => {
              if (step > 1) setStep(step - 1);
              else onCancel();
            }}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else handleSubmit();
            }}
            disabled={loading || (step === 1 && (!selectedDate || !selectedTime))}
            className="px-8 py-3 bg-[#7AC2F9] text-white rounded-lg hover:bg-[#6AB4ED] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Scheduling...' : step === 3 ? 'Confirm & Schedule' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
