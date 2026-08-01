'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  Video,
  Calendar as CalendarIcon,
  MapPin,
  Edit,
  Trash2,
  Eye,
  ExternalLink
} from 'lucide-react';
import Button from './Button';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'live_class' | 'meeting' | 'deadline' | 'reminder';
  instructor?: string;
  maxStudents?: number;
  enrolledCount?: number;
  zoomLink?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  color?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (date: Date) => void;
  onEventEdit?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  view?: 'month' | 'week' | 'day';
  editable?: boolean;
  className?: string;
}

export default function Calendar({
  events = [],
  onEventClick,
  onEventCreate,
  onEventEdit,
  onEventDelete,
  view = 'month',
  editable = false,
  className = ''
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentView, setCurrentView] = useState(view);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth - 1, prevMonthDays - i),
      isCurrentMonth: false
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth, day),
      isCurrentMonth: true
    });
  }
  
  // Next month days
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth + 1, day),
      isCurrentMonth: false
    });
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1));
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.start, date));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onEventCreate && editable) {
      onEventCreate(date);
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowEventModal(true);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.color) return event.color;
    
    switch (event.type) {
      case 'live_class':
        return event.status === 'live' ? 'bg-red-500' : 'bg-blue-500';
      case 'meeting':
        return 'bg-green-500';
      case 'deadline':
        return 'bg-orange-500';
      case 'reminder':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['month', 'week', 'day'].map((v) => (
              <button
                key={v}
                onClick={() => setCurrentView(v as any)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  currentView === v
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {editable && (
            <Button
              onClick={() => onEventCreate && onEventCreate(new Date())}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((calendarDay, index) => {
            const dayEvents = getEventsForDay(calendarDay.date);
            const isCurrentMonth = calendarDay.isCurrentMonth;
            const isTodayDate = isToday(calendarDay.date);
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(calendarDay.date)}
                className={`min-h-24 p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                } ${
                  isTodayDate ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                  } ${
                    isTodayDate ? 'text-blue-600' : ''
                  }`}
                >
                  {calendarDay.date.getDate()}
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${getEventColor(event)}`}
                      title={event.title}
                    >
                      <div className="flex items-center space-x-1">
                        {event.type === 'live_class' && <Video className="w-3 h-3" />}
                        {event.type === 'meeting' && <Users className="w-3 h-3" />}
                        {event.type === 'deadline' && <Clock className="w-3 h-3" />}
                        <span className="truncate">{formatTime(event.start)} {event.title}</span>
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getEventColor(selectedEvent)}`} />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedEvent.title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Event Details */}
                <div className="flex items-center space-x-3 text-gray-600">
                  <CalendarIcon className="w-5 h-5" />
                  <span>
                    {selectedEvent.start.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>
                    {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                  </span>
                </div>

                {selectedEvent.instructor && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>Instructor: {selectedEvent.instructor}</span>
                  </div>
                )}

                {selectedEvent.maxStudents && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>
                      {selectedEvent.enrolledCount || 0}/{selectedEvent.maxStudents} students
                    </span>
                  </div>
                )}

                {selectedEvent.zoomLink && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Video className="w-5 h-5" />
                    <a
                      href={selectedEvent.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <span>Join Meeting</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {selectedEvent.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedEvent.status === 'live'
                        ? 'bg-red-100 text-red-800'
                        : selectedEvent.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedEvent.status === 'cancelled'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  {editable && onEventEdit && (
                    <button
                      onClick={() => {
                        onEventEdit(selectedEvent);
                        setShowEventModal(false);
                      }}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  
                  {editable && onEventDelete && (
                    <button
                      onClick={() => {
                        onEventDelete(selectedEvent.id);
                        setShowEventModal(false);
                      }}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                <Button
                  onClick={() => setShowEventModal(false)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}