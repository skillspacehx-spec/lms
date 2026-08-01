import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { Session, User } from '@/models';

interface Certificate {
  id: string;
  title: string;
  description: string;
  issuedDate: Date;
  certificateUrl?: string;
  type: 'course_completion' | 'milestone' | 'special';
  metadata?: {
    courseId?: string;
    courseName?: string;
    category?: string;
    completedAt?: Date;
    totalTimeSpent?: number;
  };
}

// GET /api/certificates - Get user's certificates
export async function GET() {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const certificates: Certificate[] = [];

    // Get completed sessions
    const completedSessions = await Session.find({
      student: user.userId,
      status: 'completed'
    }).lean();

    // Certificate for 10+ completed sessions
    if (completedSessions.length >= 10) {
      const tenthSession = completedSessions.sort((a, b) => 
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )[9];
      
      certificates.push({
        id: '10-sessions-cert',
        title: 'Dedicated Learner Certificate',
        description: 'Awarded for completing 10 tutoring sessions',
        issuedDate: new Date(tenthSession.scheduledAt),
        type: 'milestone'
      });
    }

    // Certificate for 25+ completed sessions
    if (completedSessions.length >= 25) {
      const session25 = completedSessions.sort((a, b) => 
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )[24];
      
      certificates.push({
        id: '25-sessions-cert',
        title: 'Learning Champion Certificate',
        description: 'Awarded for completing 25 tutoring sessions',
        issuedDate: new Date(session25.scheduledAt),
        type: 'milestone'
      });
    }

    // Certificate for 50+ completed sessions
    if (completedSessions.length >= 50) {
      const session50 = completedSessions.sort((a, b) => 
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )[49];
      
      certificates.push({
        id: '50-sessions-cert',
        title: 'Master Student Certificate',
        description: 'Awarded for completing 50 tutoring sessions',
        issuedDate: new Date(session50.scheduledAt),
        type: 'milestone'
      });
    }

    // Get course completions from user progress
    const userWithProgress = await User.findById(user.userId)
      .select('progress')
      .populate({
        path: 'progress.course',
        select: 'title category',
        populate: {
          path: 'category',
          select: 'name icon color'
        }
      })
      .lean();

    interface ProgressItem {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      course: any;
      completionPercentage: number;
      completedAt?: Date;
      totalTimeSpent?: number;
    }

    if (userWithProgress?.progress) {
      const completedCourses = (userWithProgress.progress as ProgressItem[]).filter(
        (p) => p.completionPercentage === 100 && p.completedAt
      );

      completedCourses.forEach((p) => {
        if (!p.course || !p.completedAt) return; // Skip if course was deleted or no completion date
        
        certificates.push({
          id: `course-${p.course._id}`,
          title: `${p.course.title} - Completion Certificate`,
          description: `Successfully completed the course "${p.course.title}"`,
          issuedDate: new Date(p.completedAt),
          certificateUrl: `/certificates/${p.course._id}`,
          type: 'course_completion',
          metadata: {
            courseId: p.course._id,
            courseName: p.course.title,
            category: p.course.category?.name || 'General',
            completedAt: p.completedAt,
            totalTimeSpent: p.totalTimeSpent || 0
          }
        });
      });
    }

    return NextResponse.json({
      success: true,
      certificates: certificates.sort((a, b) => b.issuedDate.getTime() - a.issuedDate.getTime()),
      stats: {
        totalCertificates: certificates.length,
        completedSessions: completedSessions.length
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching certificates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch certificates';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
