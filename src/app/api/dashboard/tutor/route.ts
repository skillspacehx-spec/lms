import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Session, User, Review } from '@/models';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user || user.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Tutor access required' },
        { status: 401 }
      );
    }

    // Get current tutor's data
    const tutor = await User.findById(user.userId)
      .select('name email bio subjects hourlyRate experience qualifications avatar calendarConnected calendarConnectedAt')
      .lean();

    if (!tutor) {
      return NextResponse.json(
        { success: false, message: 'Tutor not found' },
        { status: 404 }
      );
    }

    // Get tutor's upcoming sessions (next 7 days)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    console.log('🔍 Fetching sessions for tutor:', user.userId);
    console.log('🔍 Date range - Now:', now, 'Next Week:', nextWeek);

    // Get upcoming sessions (next 7 days)
    const todaySessions = await Session.find({
      tutor: user.userId,
      scheduledAt: {
        $gte: now,
        $lt: nextWeek
      },
      status: { $in: ['scheduled', 'in_progress'] }
    })
    .populate('student', 'name email')
    .populate('course', 'title')
    .sort({ scheduledAt: 1 })
    .lean();

    console.log('🔍 Found upcoming sessions:', todaySessions.length);

    // Get this week's sessions
    const weekSessions = await Session.find({
      tutor: user.userId,
      scheduledAt: {
        $gte: weekStart,
        $lt: weekEnd
      },
      status: { $in: ['scheduled', 'in_progress', 'completed'] }
    })
    .lean();

    // Calculate total hours this week
    const hoursThisWeek = weekSessions.reduce((total, session) => {
      return total + (session.duration || 60) / 60; // Convert minutes to hours
    }, 0);

    // Get total active students (students with upcoming or recent sessions)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 30); // Last 30 days

    const activeStudents = await Session.distinct('student', {
      tutor: user.userId,
      scheduledAt: { $gte: recentDate },
      status: { $in: ['scheduled', 'completed', 'in_progress'] }
    });

    // Get average rating
    const reviews = await Review.find({ tutor: user.userId });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    // Get total earnings this month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const completedSessionsThisMonth = await Session.find({
      tutor: user.userId,
      scheduledAt: { $gte: monthStart },
      status: 'completed'
    }).lean();

    const earningsThisMonth = completedSessionsThisMonth.reduce((total, session) => {
      const hours = (session.duration || 60) / 60;
      return total + (hours * (tutor.hourlyRate || 0));
    }, 0);

    const responseData = {
      success: true,
      data: {
        tutor,
        stats: {
          activeStudents: activeStudents.length,
          hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
          averageRating: Math.round(averageRating * 10) / 10,
          earningsThisMonth: Math.round(earningsThisMonth * 100) / 100
        },
        todaySessions: todaySessions.map(session => ({
          id: session._id,
          student: session.student?.name || 'Unknown Student',
          subject: session.course?.title || 'General Tutoring',
          scheduledAt: session.scheduledAt,
          duration: session.duration || 60,
          type: session.type === 'one_on_one' ? 'One-on-One' : 'Group Class',
          status: session.status,
          zoomJoinUrl: session.zoomJoinUrl
        })),
        weekSessions: weekSessions.length,
        totalReviews: reviews.length
      }
    };

    console.log('🔍 Response todaySessions count:', responseData.data.todaySessions.length);

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Error fetching tutor dashboard data:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching dashboard data' },
      { status: 500 }
    );
  }
}