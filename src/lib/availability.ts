import { Session, LiveClass, ProgressMeeting, User } from '@/models';
import mongoose from 'mongoose';

// Cache for tutor availability (5-minute TTL)
interface CacheEntry {
  isAvailable: boolean;
  timestamp: number;
  availableSlots?: TimeSlot[];
}

interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string;
  duration: number; // in minutes
}

interface AvailabilityOptions {
  date?: Date;
  duration?: number; // Session duration in minutes
  includeTimeSlots?: boolean;
}

const availabilityCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Check if a tutor is available now or at a specific time
 */
export async function checkTutorAvailability(
  tutorId: string,
  options: AvailabilityOptions = {}
): Promise<{ isAvailable: boolean; availableSlots?: TimeSlot[] }> {
  const {
    date = new Date(),
    duration = 60,
    includeTimeSlots = false
  } = options;

  // Check cache first
  const cacheKey = `${tutorId}-${date.toISOString().split('T')[0]}`;
  const cached = availabilityCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      isAvailable: cached.isAvailable,
      availableSlots: includeTimeSlots ? cached.availableSlots : undefined
    };
  }

  // Get tutor's availability schedule
  const tutor = await User.findById(tutorId)
    .select('availability')
    .lean();

  if (!tutor || !tutor.availability || tutor.availability.length === 0) {
    // No availability schedule set
    const result = { isAvailable: false };
    availabilityCache.set(cacheKey, {
      isAvailable: false,
      timestamp: Date.now()
    });
    return result;
  }

  // Get day of week
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  const daySchedule = tutor.availability.find(a => a.day === dayOfWeek);

  if (!daySchedule) {
    // Tutor not available on this day
    const result = { isAvailable: false };
    availabilityCache.set(cacheKey, {
      isAvailable: false,
      timestamp: Date.now()
    });
    return result;
  }

  // Get all bookings for this tutor on this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const [sessions, liveClasses, progressMeetings] = await Promise.all([
    Session.find({
      tutor: new mongoose.Types.ObjectId(tutorId),
      scheduledAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'in_progress'] }
    })
      .select('scheduledAt duration')
      .lean(),
    
    LiveClass.find({
      instructor: new mongoose.Types.ObjectId(tutorId),
      scheduledAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'live'] }
    })
      .select('scheduledAt duration')
      .lean(),
    
    ProgressMeeting.find({
      tutor: new mongoose.Types.ObjectId(tutorId),
      scheduledAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'in_progress'] }
    })
      .select('scheduledAt duration')
      .lean()
  ]);

  // Convert all bookings to time slots
  const bookedSlots: Array<{ start: Date; end: Date }> = [];

  sessions.forEach(session => {
    const start = new Date(session.scheduledAt);
    const end = new Date(start.getTime() + (session.duration || 60) * 60 * 1000);
    bookedSlots.push({ start, end });
  });

  liveClasses.forEach(liveClass => {
    const start = new Date(liveClass.scheduledAt);
    const end = new Date(start.getTime() + (liveClass.duration || 60) * 60 * 1000);
    bookedSlots.push({ start, end });
  });

  progressMeetings.forEach(meeting => {
    const start = new Date(meeting.scheduledAt);
    const end = new Date(start.getTime() + (meeting.duration || 30) * 60 * 1000);
    bookedSlots.push({ start, end });
  });

  // Calculate available time slots
  const availableSlots = calculateAvailableSlots(
    daySchedule.startTime,
    daySchedule.endTime,
    bookedSlots,
    duration,
    date
  );

  const isAvailable = availableSlots.length > 0;

  // Cache the result
  availabilityCache.set(cacheKey, {
    isAvailable,
    timestamp: Date.now(),
    availableSlots
  });

  return {
    isAvailable,
    availableSlots: includeTimeSlots ? availableSlots : undefined
  };
}

/**
 * Calculate available time slots based on schedule and bookings
 */
function calculateAvailableSlots(
  startTime: string,
  endTime: string,
  bookedSlots: Array<{ start: Date; end: Date }>,
  requiredDuration: number,
  date: Date
): TimeSlot[] {
  const availableSlots: TimeSlot[] = [];
  
  // Parse start and end times (format: "HH:MM")
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Create datetime objects for the schedule
  const scheduleStart = new Date(date);
  scheduleStart.setHours(startHour, startMinute, 0, 0);
  
  const scheduleEnd = new Date(date);
  scheduleEnd.setHours(endHour, endMinute, 0, 0);
  
  // If checking for today, don't include past time slots
  const now = new Date();
  const effectiveStart = date.toDateString() === now.toDateString() && now > scheduleStart
    ? now
    : scheduleStart;
  
  // Sort booked slots by start time
  const sortedBookings = bookedSlots.sort((a, b) => a.start.getTime() - b.start.getTime());
  
  // Find gaps between bookings
  let currentTime = effectiveStart;
  
  for (const booking of sortedBookings) {
    // Check if there's a gap before this booking
    const gapDuration = (booking.start.getTime() - currentTime.getTime()) / (60 * 1000); // in minutes
    
    if (gapDuration >= requiredDuration) {
      // Add all possible slots in this gap
      const gapEnd = booking.start;
      let slotStart = currentTime;
      
      while (slotStart.getTime() + requiredDuration * 60 * 1000 <= gapEnd.getTime()) {
        availableSlots.push({
          startTime: formatTime(slotStart),
          endTime: formatTime(new Date(slotStart.getTime() + requiredDuration * 60 * 1000)),
          duration: requiredDuration
        });
        
        // Move to next 15-minute interval
        slotStart = new Date(slotStart.getTime() + 15 * 60 * 1000);
      }
    }
    
    // Move current time to end of this booking
    currentTime = booking.end > currentTime ? booking.end : currentTime;
  }
  
  // Check for availability after the last booking
  const remainingTime = (scheduleEnd.getTime() - currentTime.getTime()) / (60 * 1000);
  
  if (remainingTime >= requiredDuration) {
    let slotStart = currentTime;
    
    while (slotStart.getTime() + requiredDuration * 60 * 1000 <= scheduleEnd.getTime()) {
      availableSlots.push({
        startTime: formatTime(slotStart),
        endTime: formatTime(new Date(slotStart.getTime() + requiredDuration * 60 * 1000)),
        duration: requiredDuration
      });
      
      // Move to next 15-minute interval
      slotStart = new Date(slotStart.getTime() + 15 * 60 * 1000);
    }
  }
  
  return availableSlots;
}

/**
 * Format time to HH:MM
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Check if a specific time slot has a conflict
 */
export async function hasConflict(
  tutorId: string,
  startTime: Date,
  duration: number
): Promise<boolean> {
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
  
  const [sessionConflict, liveClassConflict, meetingConflict] = await Promise.all([
    Session.findOne({
      tutor: new mongoose.Types.ObjectId(tutorId),
      status: { $in: ['scheduled', 'in_progress'] },
      $or: [
        // New session starts during existing session
        {
          scheduledAt: { $lte: startTime },
          $expr: {
            $gte: [
              { $add: ['$scheduledAt', { $multiply: ['$duration', 60000] }] },
              startTime
            ]
          }
        },
        // New session ends during existing session
        {
          scheduledAt: { $lt: endTime, $gte: startTime }
        }
      ]
    }).lean(),
    
    LiveClass.findOne({
      instructor: new mongoose.Types.ObjectId(tutorId),
      status: { $in: ['scheduled', 'live'] },
      $or: [
        {
          scheduledAt: { $lte: startTime },
          $expr: {
            $gte: [
              { $add: ['$scheduledAt', { $multiply: ['$duration', 60000] }] },
              startTime
            ]
          }
        },
        {
          scheduledAt: { $lt: endTime, $gte: startTime }
        }
      ]
    }).lean(),
    
    ProgressMeeting.findOne({
      tutor: new mongoose.Types.ObjectId(tutorId),
      status: { $in: ['scheduled', 'in_progress'] },
      $or: [
        {
          scheduledAt: { $lte: startTime },
          $expr: {
            $gte: [
              { $add: ['$scheduledAt', { $multiply: ['$duration', 60000] }] },
              startTime
            ]
          }
        },
        {
          scheduledAt: { $lt: endTime, $gte: startTime }
        }
      ]
    }).lean()
  ]);
  
  return !!(sessionConflict || liveClassConflict || meetingConflict);
}

/**
 * Get available time slots for a tutor on a specific date
 */
export async function getAvailableTimeSlots(
  tutorId: string,
  date: Date,
  duration: number = 60
): Promise<TimeSlot[]> {
  const result = await checkTutorAvailability(tutorId, {
    date,
    duration,
    includeTimeSlots: true
  });
  
  return result.availableSlots || [];
}

/**
 * Clear cache for a specific tutor (useful after booking)
 */
export function clearAvailabilityCache(tutorId: string): void {
  const keysToDelete: string[] = [];
  
  availabilityCache.forEach((_, key) => {
    if (key.startsWith(tutorId)) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => availabilityCache.delete(key));
}

/**
 * Clear all availability cache (for admin/maintenance)
 */
export function clearAllAvailabilityCache(): void {
  availabilityCache.clear();
}
