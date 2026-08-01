import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { Session } from '@/models';

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

    if (user.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'Only tutors can access this endpoint' },
        { status: 403 }
      );
    }

    // Get all sessions for this tutor
    const sessions = await Session.find({ tutor: user.userId })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ scheduledAt: -1 });

    // Group sessions by student
    const studentMap = new Map();

    sessions.forEach((session: any) => {
      if (!session.student) return;

      const studentId = session.student._id.toString();
      
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          _id: studentId,
          name: session.student.name,
          email: session.student.email,
          totalSessions: 0,
          completedSessions: 0,
          upcomingSessions: 0,
          totalHours: 0,
          lastSession: null,
          subjects: new Set()
        });
      }

      const student = studentMap.get(studentId);
      student.totalSessions++;
      
      if (session.status === 'completed') {
        student.completedSessions++;
        student.totalHours += session.duration / 60;
      }

      // Count upcoming sessions
      if (session.status === 'scheduled' && new Date(session.scheduledAt) > new Date()) {
        student.upcomingSessions++;
      }

      if (session.course?.title) {
        student.subjects.add(session.course.title);
      }

      if (!student.lastSession || new Date(session.scheduledAt) > new Date(student.lastSession)) {
        student.lastSession = session.scheduledAt;
      }
    });

    // Convert Map to Array and format subjects
    const students = Array.from(studentMap.values()).map((student: any) => ({
      ...student,
      subjects: Array.from(student.subjects),
      totalHours: Math.round(student.totalHours * 10) / 10
    }));

    return NextResponse.json({
      success: true,
      students,
      total: students.length
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
