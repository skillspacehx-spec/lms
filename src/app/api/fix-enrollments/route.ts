/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Course, User } from '@/models';

// GET /api/fix-enrollments - Fix missing User.progress entries for enrolled students
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    console.log('🔧 Starting enrollment fix...');

    let fixed = 0;
    let skipped = 0;

    // Find all courses with enrolled students
    const courses = await Course.find({ 'enrolledStudents.0': { $exists: true } });

    for (const course of courses) {
      for (const studentId of course.enrolledStudents) {
        try {
          const user = await User.findById(studentId);
          
          if (!user) {
            console.log(`⚠️ Student ${studentId} not found, skipping`);
            skipped++;
            continue;
          }

          // Check if progress entry exists
          const hasProgress = user.progress?.some((p: any) => 
            p.course.toString() === course._id.toString()
          );

          if (!hasProgress) {
            // Add progress entry
            await User.findByIdAndUpdate(studentId, {
              $push: {
                progress: {
                  course: course._id,
                  completedContent: [],
                  lastAccessed: new Date(),
                  totalTimeSpent: 0,
                  completionPercentage: 0,
                  startedAt: new Date(),
                  certificates: []
                }
              }
            });

            console.log(`✅ Fixed enrollment for user ${user.email} in course ${course.title}`);
            fixed++;
          } else {
            skipped++;
          }
        } catch (error) {
          console.error(`❌ Error processing student ${studentId}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed} enrollments, ${skipped} already had progress`,
      details: {
        fixed,
        skipped,
        totalCoursesProcessed: courses.length
      }
    });

  } catch (error: any) {
    console.error('❌ Fix enrollments error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
