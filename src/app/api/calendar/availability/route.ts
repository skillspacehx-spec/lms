import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/models';
import { checkAvailability, getTutorBusySlots, refreshToken } from '@/lib/google-calendar';

// GET /api/calendar/availability - Check tutor availability or get tutor's schedule
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const tutorId = searchParams.get('tutorId');
    const date = searchParams.get('date'); // YYYY-MM-DD format
    const startTime = searchParams.get('startTime'); // HH:MM format
    const duration = parseInt(searchParams.get('duration') || '60'); // minutes

    // If no tutorId, return current user's availability (for tutors managing their own schedule)
    if (!tutorId) {
      const user = await getCurrentUser();
      if (!user || user.role !== 'tutor') {
        return NextResponse.json(
          { success: false, message: 'Unauthorized - Tutor access required' },
          { status: 401 }
        );
      }

      // Get current tutor's availability
      const tutor = await User.findById(user.userId).select('availability');
      console.log('GET availability for tutor:', user.userId, 'Found:', tutor?.availability);
      
      // DEBUG: Check raw MongoDB data
      const rawUser = await User.collection.findOne({ _id: new (require('mongoose').Types.ObjectId)(user.userId) });
      console.log('RAW MongoDB data:', {
        _id: rawUser?._id,
        email: rawUser?.email,
        availability: rawUser?.availability,
        hasAvailability: !!rawUser?.availability,
        availabilityType: typeof rawUser?.availability
      });
      
      return NextResponse.json({
        success: true,
        availability: tutor?.availability || []
      });
    }

    // If only tutorId is provided, return tutor's actual weekly availability as bookable slots
    if (tutorId && (!date || !startTime)) {
      const tutor = await User.findById(tutorId).select('availability name email');
      
      if (!tutor) {
        return NextResponse.json(
          { success: false, message: 'Tutor not found' },
          { status: 404 }
        );
      }

      console.log('📅 Fetching availability for student booking - Tutor:', tutor.email);
      console.log('Tutor availability in DB:', tutor.availability);

      // Convert weekly availability to upcoming bookable slots (next 7 days)
      const slots = [];
      const daysMap: { [key: string]: number } = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
        'Thursday': 4, 'Friday': 5, 'Saturday': 6
      };

      if (tutor.availability && Array.isArray(tutor.availability) && tutor.availability.length > 0) {
        const today = new Date();
        
        // Generate slots for next 14 days
        for (let i = 0; i < 14; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dayName = Object.keys(daysMap).find(key => daysMap[key] === date.getDay());
          
          // Find availability for this day
          const dayAvailability = tutor.availability.filter((slot: any) => slot.day === dayName);
          
          if (dayAvailability.length > 0) {
            const times: string[] = [];
            
            // Generate hourly slots for each availability block
            dayAvailability.forEach((slot: any) => {
              const [startHour, startMin] = slot.startTime.split(':').map(Number);
              const [endHour, endMin] = slot.endTime.split(':').map(Number);
              
              // Generate hourly slots from start to end
              for (let hour = startHour; hour <= endHour; hour++) {
                // Skip if we've reached the end time
                if (hour === endHour && startMin === 0 && endMin === 0) break;
                
                const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                const ampm = hour >= 12 ? 'PM' : 'AM';
                times.push(`${displayHour}:00 ${ampm}`);
                
                // Also add :30 slot if not the last hour
                if (hour < endHour || (hour === endHour && endMin >= 30)) {
                  times.push(`${displayHour}:30 ${ampm}`);
                }
              }
            });
            
            if (times.length > 0) {
              slots.push({
                date: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
                times: times
              });
            }
          }
        }
      }

      console.log('Generated slots for booking:', slots.length, 'days');

      return NextResponse.json({
        success: true,
        slots: slots,
        hasAvailability: slots.length > 0
      });
    }

    if (!tutorId || !date || !startTime) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters: tutorId, date, startTime' },
        { status: 400 }
      );
    }

    // Get tutor details
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'Tutor not found' },
        { status: 404 }
      );
    }

    if (!tutor.calendarConnected || !tutor.googleAccessToken || !tutor.googleRefreshToken) {
      return NextResponse.json(
        { success: false, message: 'Tutor has not connected their calendar' },
        { status: 400 }
      );
    }

    // Parse date and time
    const sessionStart = new Date(`${date}T${startTime}:00.000Z`);
    const sessionEnd = new Date(sessionStart.getTime() + (duration * 60 * 1000));

    try {
      // Check availability
      const availability = await checkAvailability(
        tutor.googleAccessToken,
        tutor.googleRefreshToken,
        sessionStart,
        sessionEnd
      );

      return NextResponse.json({
        success: true,
        available: availability.available,
        conflictingEvents: availability.conflictingEvents,
        requestedSlot: {
          start: sessionStart,
          end: sessionEnd,
          duration
        }
      });

    } catch (calendarError: any) {
      console.error('Calendar API error:', calendarError);

      // If token expired, try to refresh
      if (calendarError.message.includes('token expired')) {
        try {
          const newTokens = await refreshToken(tutor.googleRefreshToken);
          
          if (!newTokens.access_token || !newTokens.refresh_token) {
            throw new Error('Invalid token refresh response');
          }
          
          // Update user with new tokens
          await User.findByIdAndUpdate(tutorId, {
            googleAccessToken: newTokens.access_token,
            googleRefreshToken: newTokens.refresh_token
          });

          // Retry availability check with new token
          const availability = await checkAvailability(
            newTokens.access_token,
            newTokens.refresh_token,
            sessionStart,
            sessionEnd
          );

          return NextResponse.json({
            success: true,
            available: availability.available,
            conflictingEvents: availability.conflictingEvents,
            requestedSlot: {
              start: sessionStart,
              end: sessionEnd,
              duration
            }
          });

        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          
          // Mark calendar as disconnected
          await User.findByIdAndUpdate(tutorId, {
            calendarConnected: false,
            googleAccessToken: null,
            googleRefreshToken: null
          });

          return NextResponse.json(
            { success: false, message: 'Calendar connection expired. Tutor needs to reconnect.' },
            { status: 401 }
          );
        }
      }

      return NextResponse.json(
        { success: false, message: calendarError.message || 'Failed to check availability' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to check availability' },
      { status: 500 }
    );
  }
}

// POST /api/calendar/availability - Save or check availability
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Check if this is a save availability request (has availability array)
    if (body.availability && Array.isArray(body.availability)) {
      // SAVE AVAILABILITY
      if (user.role !== 'tutor') {
        return NextResponse.json(
          { success: false, message: 'Only tutors can set availability' },
          { status: 403 }
        );
      }

      try {
        console.log('=== SAVE AVAILABILITY API DEBUG ===');
        console.log('User ID:', user.userId);
        console.log('User role:', user.role);
        console.log('Request body:', JSON.stringify(body, null, 2));
        console.log('Availability array:', body.availability);
        console.log('Availability length:', body.availability.length);
        console.log('First slot (if exists):', body.availability[0]);
        
        // Validate availability data
        if (!Array.isArray(body.availability)) {
          console.error('❌ Availability is not an array!');
          return NextResponse.json(
            { success: false, message: 'Availability must be an array' },
            { status: 400 }
          );
        }

        // Find user first to verify it exists
        const existingUser = await User.findById(user.userId);
        if (!existingUser) {
          console.error('❌ User not found:', user.userId);
          return NextResponse.json(
            { success: false, message: 'User not found' },
            { status: 404 }
          );
        }

        console.log('✅ User found:', existingUser.email);
        console.log('Current availability in DB:', existingUser.availability);
        console.log('Field type:', typeof existingUser.availability);
        console.log('Is array?:', Array.isArray(existingUser.availability));
        
        // CRITICAL: Use findByIdAndUpdate with $set to force MongoDB field creation
        const updatedUser = await User.findByIdAndUpdate(
          user.userId,
          { 
            $set: { availability: body.availability }
          },
          { 
            new: true,
            runValidators: true,
            strict: false // Allow field creation even if not in old document
          }
        ).select('availability email');

        if (!updatedUser) {
          console.error('❌ Update failed - user not found');
          return NextResponse.json(
            { success: false, message: 'Failed to update user' },
            { status: 500 }
          );
        }

        // Verify with raw MongoDB query
        const verifyRaw = await User.collection.findOne({ _id: new (require('mongoose').Types.ObjectId)(user.userId) });
        console.log('VERIFICATION - Raw MongoDB after save:', {
          availability: verifyRaw?.availability,
          exists: !!verifyRaw?.availability,
          length: verifyRaw?.availability?.length
        });

        console.log('Database save result:');
        console.log('- Save successful:', !!updatedUser);
        console.log('- Saved availability:', updatedUser.availability);
        console.log('- Saved availability length:', updatedUser.availability?.length || 0);
        console.log('- Full saved data:', JSON.stringify(updatedUser.availability, null, 2));

        return NextResponse.json({
          success: true,
          message: 'Availability saved successfully',
          availability: updatedUser.availability,
          debug: {
            userId: user.userId,
            savedCount: updatedUser.availability?.length || 0,
            fieldExists: !!updatedUser.availability
          }
        });
      } catch (saveError: any) {
        console.error('Error saving availability:', saveError);
        return NextResponse.json(
          { success: false, message: 'Failed to save availability' },
          { status: 500 }
        );
      }
    }

    // CHECK AVAILABILITY (bulk check for date range)
    const { tutorId, startDate, endDate } = body;

    if (!tutorId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get tutor details
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'Tutor not found' },
        { status: 404 }
      );
    }

    if (!tutor.calendarConnected || !tutor.googleAccessToken || !tutor.googleRefreshToken) {
      return NextResponse.json({
        success: true,
        busySlots: [],
        message: 'Calendar not connected - assuming available'
      });
    }

    try {
      // Get busy slots for the date range
      const busySlots = await getTutorBusySlots(
        tutor.googleAccessToken,
        tutor.googleRefreshToken,
        new Date(startDate),
        new Date(endDate)
      );

      return NextResponse.json({
        success: true,
        busySlots
      });

    } catch (calendarError: any) {
      console.error('Calendar API error:', calendarError);

      // Handle token expiration
      if (calendarError.message.includes('token expired')) {
        try {
          const newTokens = await refreshToken(tutor.googleRefreshToken);
          
          if (!newTokens.access_token || !newTokens.refresh_token) {
            throw new Error('Invalid token refresh response');
          }
          
          await User.findByIdAndUpdate(tutorId, {
            googleAccessToken: newTokens.access_token,
            googleRefreshToken: newTokens.refresh_token
          });

          const busySlots = await getTutorBusySlots(
            newTokens.access_token,
            newTokens.refresh_token,
            new Date(startDate),
            new Date(endDate)
          );

          return NextResponse.json({
            success: true,
            busySlots
          });

        } catch (refreshError) {
          await User.findByIdAndUpdate(tutorId, {
            calendarConnected: false,
            googleAccessToken: null,
            googleRefreshToken: null
          });

          return NextResponse.json({
            success: true,
            busySlots: [],
            warning: 'Calendar connection expired'
          });
        }
      }

      return NextResponse.json(
        { success: false, message: calendarError.message || 'Failed to fetch busy slots' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Bulk availability error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}