import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { Session } from '@/models';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: Date;
  category: 'sessions' | 'streak' | 'progress' | 'rating';
}

// GET /api/achievements - Get user's achievements
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

    const achievements: Achievement[] = [];

    // Get user's sessions
    const sessions = await Session.find({
      student: user.userId,
      status: 'completed'
    }).sort({ scheduledAt: 1 }).lean();

    const completedCount = sessions.length;

    // Achievement: First Session
    if (completedCount >= 1) {
      achievements.push({
        id: 'first-session',
        name: 'First Step',
        description: 'Completed your first tutoring session',
        icon: '🎯',
        earnedDate: sessions[0].scheduledAt,
        category: 'sessions'
      });
    }

    // Achievement: 5 Sessions
    if (completedCount >= 5) {
      achievements.push({
        id: '5-sessions',
        name: 'Getting Started',
        description: 'Completed 5 tutoring sessions',
        icon: '⭐',
        earnedDate: sessions[4].scheduledAt,
        category: 'sessions'
      });
    }

    // Achievement: 10 Sessions
    if (completedCount >= 10) {
      achievements.push({
        id: '10-sessions',
        name: 'Dedicated Learner',
        description: 'Completed 10 tutoring sessions',
        icon: '🏆',
        earnedDate: sessions[9].scheduledAt,
        category: 'sessions'
      });
    }

    // Achievement: 25 Sessions
    if (completedCount >= 25) {
      achievements.push({
        id: '25-sessions',
        name: 'Learning Champion',
        description: 'Completed 25 tutoring sessions',
        icon: '🥇',
        earnedDate: sessions[24].scheduledAt,
        category: 'sessions'
      });
    }

    // Achievement: 50 Sessions
    if (completedCount >= 50) {
      achievements.push({
        id: '50-sessions',
        name: 'Master Student',
        description: 'Completed 50 tutoring sessions',
        icon: '👑',
        earnedDate: sessions[49].scheduledAt,
        category: 'sessions'
      });
    }

    // Achievement: Perfect Attendance (7 consecutive days)
    let maxStreak = 0;
    let currentStreak = 0;
    let streakEndDate = null;
    
    for (let i = 0; i < sessions.length; i++) {
      if (i === 0) {
        currentStreak = 1;
        continue;
      }
      
      const prevDate = new Date(sessions[i - 1].scheduledAt);
      const currDate = new Date(sessions[i].scheduledAt);
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          streakEndDate = sessions[i].scheduledAt;
        }
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }

    if (maxStreak >= 7 && streakEndDate) {
      achievements.push({
        id: '7-day-streak',
        name: 'Perfect Week',
        description: 'Attended sessions for 7 consecutive days',
        icon: '🔥',
        earnedDate: new Date(streakEndDate),
        category: 'streak'
      });
    }

    // Achievement: High Ratings
    const ratedSessions = sessions.filter(s => s.rating?.student);
    const avgRating = ratedSessions.length > 0 
      ? ratedSessions.reduce((sum, s) => sum + (s.rating?.student || 0), 0) / ratedSessions.length 
      : 0;

    if (avgRating >= 4.5 && ratedSessions.length >= 5) {
      achievements.push({
        id: 'high-achiever',
        name: 'High Achiever',
        description: 'Maintained 4.5+ average rating across sessions',
        icon: '⚡',
        earnedDate: new Date(),
        category: 'rating'
      });
    }

    return NextResponse.json({
      success: true,
      achievements: achievements.sort((a, b) => b.earnedDate.getTime() - a.earnedDate.getTime()),
      stats: {
        totalAchievements: achievements.length,
        completedSessions: completedCount,
        maxStreak,
        averageRating: avgRating
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching achievements:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch achievements';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
