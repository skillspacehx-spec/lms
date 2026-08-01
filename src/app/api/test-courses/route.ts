import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Course, CourseContent } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all courses without any filters
    const allCourses = await Course.find({})
      .populate('category', 'name')
      .populate('instructor', 'name email')
      .lean();

    console.log('Total courses found:', allCourses.length);

    // Get content for each course
    const coursesWithContent = await Promise.all(
      allCourses.map(async (course) => {
        const content = await CourseContent.find({ course: course._id }).lean();
        return {
          _id: course._id,
          title: course.title,
          description: course.description,
          category: course.category,
          instructor: course.instructor,
          type: course.type,
          price: course.price,
          isActive: course.isActive,
          isFeatured: course.isFeatured,
          enrolledStudents: course.enrolledStudents || [],
          enrolledCount: course.enrolledStudents?.length || 0,
          thumbnail: course.thumbnail,
          contentCount: content.length,
          content: content.map(c => ({
            _id: c._id,
            title: c.title,
            type: c.type,
            hasVideo: !!c.content?.videoUrl,
            hasDocument: !!c.content?.documentUrl,
            videoUrl: c.content?.videoUrl,
            isActive: c.isActive
          }))
        };
      })
    );

    return NextResponse.json({
      success: true,
      totalCourses: allCourses.length,
      courses: coursesWithContent,
      raw: allCourses
    });

  } catch (error) {
    console.error('Error fetching test courses:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
