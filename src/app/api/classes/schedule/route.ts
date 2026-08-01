import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { LiveClass, Announcement, User } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { ZoomService } from '@/lib/zoom';

// POST /api/classes/schedule - Schedule a new live class
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

    // Only tutors and admins can schedule classes
    if (user.role !== 'tutor' && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only tutors can schedule classes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      subject,
      scheduledAt,
      duration = 60,
      maxStudents = 30,
      isRecurring = false,
      recurringDays,
      recurringEndDate
    } = body;

    // Validate required fields
    if (!title || !description || !subject || !scheduledAt) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: title, description, subject, scheduledAt' },
        { status: 400 }
      );
    }

    const classDate = new Date(scheduledAt);
    
    // Validate that the class is scheduled for future
    if (classDate <= new Date()) {
      return NextResponse.json(
        { success: false, message: 'Class must be scheduled for future date/time' },
        { status: 400 }
      );
    }

    // Get teacher's email for Zoom meeting creation
    const teacher = await User.findById(user.userId).select('email name');
    if (!teacher) {
      return NextResponse.json(
        { success: false, message: 'Teacher not found' },
        { status: 404 }
      );
    }

    try {
      // Create Zoom meeting
      const zoomMeeting = await ZoomService.createClassMeeting(
        teacher.email,
        title,
        description,
        classDate,
        duration
      );

      // Create live class record
      const liveClass = new LiveClass({
        title,
        description,
        instructor: user.userId,
        subject,
        scheduledAt: classDate,
        duration,
        maxStudents,
        isRecurring,
        recurringDays: isRecurring ? recurringDays : undefined,
        recurringEndDate: isRecurring ? new Date(recurringEndDate) : undefined,
        zoomMeetingId: zoomMeeting.id.toString(),
        zoomJoinUrl: zoomMeeting.join_url,
        zoomStartUrl: zoomMeeting.start_url,
        zoomMeetingPassword: zoomMeeting.password,
        status: 'scheduled',
        enrolledStudents: [],
        isActive: true
      });

      await liveClass.save();

      // Auto-create announcement for the scheduled class
      const announcement = new Announcement({
        title: `📚 New Live Class Scheduled: ${title}`,
        message: `${teacher.name} has scheduled a new live class "${title}" for ${subject}. 
                 
📅 Date: ${classDate.toLocaleDateString()}
⏰ Time: ${classDate.toLocaleTimeString()}
⏱️ Duration: ${duration} minutes
👥 Max Students: ${maxStudents}

${description}

Join the class from your dashboard when it's time!`,
        shortMessage: `New live class: ${title} on ${classDate.toLocaleDateString()} at ${classDate.toLocaleTimeString()}`,
        type: 'class_scheduled',
        priority: 'high',
        targetAudience: 'students',
        relatedClass: liveClass._id,
        createdBy: user.userId,
        isPinned: true,
        expiresAt: new Date(classDate.getTime() + (duration * 60 * 1000)), // Expire after class ends
        isActive: true,
        readBy: [],
        clickCount: 0,
        actionButton: {
          text: 'View Class Details',
          url: `/classes/${liveClass._id}`
        }
      });

      await announcement.save();

      // If recurring class, create announcements for each occurrence
      if (isRecurring && recurringDays && recurringDays.length > 0) {
        const recurringEnd = new Date(recurringEndDate);
        const recurringClasses = [];
        const recurringAnnouncements = [];

        let currentDate = new Date(classDate);
        currentDate.setDate(currentDate.getDate() + 7); // Start from next week

        while (currentDate <= recurringEnd) {
          if (recurringDays.includes(currentDate.getDay())) {
            // Create Zoom meeting for recurring session
            const recurringZoomMeeting = await ZoomService.createClassMeeting(
              teacher.email,
              `${title} (Recurring)`,
              description,
              currentDate,
              duration
            );

            // Create recurring class record
            const recurringClass = new LiveClass({
              title: `${title} (Recurring)`,
              description,
              instructor: user.userId,
              subject,
              scheduledAt: new Date(currentDate),
              duration,
              maxStudents,
              isRecurring: true,
              parentClassId: liveClass._id,
              zoomMeetingId: recurringZoomMeeting.id.toString(),
              zoomJoinUrl: recurringZoomMeeting.join_url,
              zoomStartUrl: recurringZoomMeeting.start_url,
              zoomMeetingPassword: recurringZoomMeeting.password,
              status: 'scheduled',
              enrolledStudents: [],
              isActive: true
            });

            recurringClasses.push(recurringClass);

            // Create announcement for recurring class
            const recurringAnnouncement = new Announcement({
              title: `📚 Recurring Class: ${title}`,
              message: `Recurring class "${title}" for ${subject} is scheduled.
                       
📅 Date: ${currentDate.toLocaleDateString()}
⏰ Time: ${currentDate.toLocaleTimeString()}
⏱️ Duration: ${duration} minutes

Join from your dashboard when it's time!`,
              shortMessage: `Recurring class: ${title} on ${currentDate.toLocaleDateString()}`,
              type: 'class_scheduled',
              priority: 'normal',
              targetAudience: 'students',
              relatedClass: recurringClass._id,
              createdBy: user.userId,
              isPinned: false,
              expiresAt: new Date(currentDate.getTime() + (duration * 60 * 1000)),
              isActive: true,
              readBy: [],
              clickCount: 0,
              actionButton: {
                text: 'View Class Details',
                url: `/classes/${recurringClass._id}`
              }
            });

            recurringAnnouncements.push(recurringAnnouncement);
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Save all recurring classes and announcements
        if (recurringClasses.length > 0) {
          await LiveClass.insertMany(recurringClasses);
          await Announcement.insertMany(recurringAnnouncements);
        }
      }

      // Populate the class data for response
      await liveClass.populate([
        { path: 'instructor', select: 'name email' },
      ]);

      return NextResponse.json({
        success: true,
        message: 'Live class scheduled successfully and announcement created',
        class: liveClass,
        zoomMeeting: {
          id: zoomMeeting.id,
          join_url: zoomMeeting.join_url,
          start_url: zoomMeeting.start_url,
          password: zoomMeeting.password
        }
      });

    } catch (zoomError: any) {
      console.error('Zoom API Error:', zoomError);
      
      // If Zoom fails, still create the class but without Zoom integration
      const liveClass = new LiveClass({
        title,
        description,
        instructor: user.userId,
        subject,
        scheduledAt: classDate,
        duration,
        maxStudents,
        isRecurring,
        recurringDays: isRecurring ? recurringDays : undefined,
        recurringEndDate: isRecurring ? new Date(recurringEndDate) : undefined,
        status: 'scheduled',
        enrolledStudents: [],
        isActive: true,
        notes: 'Zoom meeting creation failed - manual setup required'
      });

      await liveClass.save();

      // Still create announcement even if Zoom fails
      const announcement = new Announcement({
        title: `📚 Live Class Scheduled: ${title}`,
        message: `${teacher.name} has scheduled a new live class "${title}" for ${subject}. 
                 
📅 Date: ${classDate.toLocaleDateString()}
⏰ Time: ${classDate.toLocaleTimeString()}
⏱️ Duration: ${duration} minutes

${description}

Note: Meeting link will be provided closer to class time.`,
        shortMessage: `New class: ${title} on ${classDate.toLocaleDateString()}`,
        type: 'class_scheduled',
        priority: 'high',
        targetAudience: 'students',
        relatedClass: liveClass._id,
        createdBy: user.userId,
        isPinned: true,
        expiresAt: new Date(classDate.getTime() + (duration * 60 * 1000)),
        isActive: true,
        readBy: [],
        clickCount: 0
      });

      await announcement.save();

      return NextResponse.json({
        success: true,
        message: 'Live class scheduled successfully (Zoom setup pending)',
        class: liveClass,
        warning: 'Zoom meeting creation failed - please set up manually'
      });
    }

  } catch (error) {
    console.error('Error scheduling live class:', error);
    return NextResponse.json(
      { success: false, message: 'Error scheduling live class' },
      { status: 500 }
    );
  }
}

// GET /api/classes/schedule - Get scheduled classes
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const subject = searchParams.get('subject');
    const instructorId = searchParams.get('instructor');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let filter: any = {};

    // Filter by status
    if (status !== 'all') {
      filter.status = status;
    }

    // Filter by subject
    if (subject) {
      filter.subject = subject;
    }

    // Filter by instructor
    if (instructorId) {
      filter.instructor = instructorId;
    }

    // For tutors, only show their own classes
    if (user.role === 'tutor') {
      filter.instructor = user.userId;
    }

    // Get upcoming classes for students and parents
    if (user.role === 'student' || user.role === 'parent') {
      filter.scheduledAt = { $gte: new Date() };
    }

    console.log('🔍 Fetching classes with filter:', JSON.stringify(filter, null, 2));
    console.log('🔍 User details:', { userId: user.userId, role: user.role });

    const classes = await LiveClass.find(filter)
      .populate('instructor', 'name email bio avatar')
      .sort({ scheduledAt: 1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    console.log('🔍 Found classes:', classes.length);
    console.log('🔍 Classes data:', JSON.stringify(classes, null, 2));

    const total = await LiveClass.countDocuments(filter);
    
    console.log('🔍 Total count:', total);

    return NextResponse.json({
      success: true,
      classes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching scheduled classes:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching scheduled classes' },
      { status: 500 }
    );
  }
}