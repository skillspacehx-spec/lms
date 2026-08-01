/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Course, CourseCategory, CourseContent } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/courses - Get all courses (admin only, includes inactive)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // all, active, inactive
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filter
    interface CourseFilter {
      isActive?: boolean;
      category?: string;
      $or?: Array<{ title?: { $regex: string; $options: string } }>;
    }
    
    const filter: CourseFilter = {};
    
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch courses with populated fields
    const [courses, totalCourses] = await Promise.all([
      Course.find(filter)
        .populate('category', 'name icon color')
        .populate('instructor', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter)
    ]);

    console.log('DEBUG: Courses found:', courses.length);
    console.log('DEBUG: Total courses:', totalCourses);
    console.log('DEBUG: Filter used:', JSON.stringify(filter));
    console.log('DEBUG: Sample course:', courses[0] ? {
      id: courses[0]._id,
      title: courses[0].title,
      hasEnrolledStudents: !!courses[0].enrolledStudents,
      enrolledCount: courses[0].enrolledStudents?.length
    } : 'No courses');

    // Get module counts for each course
    const coursesWithModules = await Promise.all(
      courses.map(async (course) => {
        const moduleCount = await CourseContent.countDocuments({ 
          course: course._id
          // Don't filter by isActive - count all modules
        });
        console.log(`DEBUG: Course "${course.title}" has ${moduleCount} modules`);
        return {
          ...course,
          moduleCount
        };
      })
    );

    // Calculate stats
    const stats = {
      total: await Course.countDocuments(),
      active: await Course.countDocuments({ isActive: true }),
      inactive: await Course.countDocuments({ isActive: false }),
      revenue: courses
        .filter((c: any) => c.isActive && c.enrolledStudents?.length > 0)
        .reduce((sum: number, c: any) => sum + (c.price * c.enrolledStudents.length), 0)
    };

    logger.info('Admin courses fetched', {
      adminId: currentUser.userId,
      totalCourses: courses.length,
      filter
    });

    const responseData = {
      success: true,
      courses: coursesWithModules.map((course: any) => ({
        id: course._id.toString(),
        title: course.title || 'Untitled Course',
        description: course.description || '',
        category: course.category || null,
        instructor: course.instructor || null,
        type: course.type || 'lms_course',
        price: course.price || 0,
        duration: course.duration || 0,
        thumbnail: course.thumbnail || '',
        level: course.level || 'all',
        isActive: course.isActive !== undefined ? course.isActive : true,
        isFeatured: course.isFeatured || false,
        enrolledCount: course.enrolledStudents?.length || 0,
        moduleCount: course.moduleCount || 0,
        rating: course.rating || { average: 0, count: 0 },
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      })),
      stats,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCourses / limit),
        totalCourses
      }
    };

    console.log('DEBUG: Returning courses:', responseData.courses.length);
    console.log('DEBUG: Sample response course:', responseData.courses[0]);

    return NextResponse.json(responseData);

  } catch (error) {
    logger.error('Error fetching admin courses', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/courses - Create new course (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      instructor,
      type,
      duration,
      price,
      thumbnail,
      level,
      language,
      prerequisites,
      learningOutcomes,
      tags,
      maxStudents,
      isActive,
      isFeatured
    } = body;

    // Validate required fields
    if (!title || !description || !category || !type || !duration) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: title, description, category, type, duration' },
        { status: 400 }
      );
    }

    // Validate category exists
    const categoryExists = await CourseCategory.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Create course
    const course = new Course({
      title,
      description,
      category,
      instructor: instructor || currentUser.userId,
      type,
      duration: parseInt(duration),
      price: parseFloat(price) || 0,
      thumbnail: thumbnail || '',
      level: level || 'all',
      language: language || 'English',
      prerequisites: prerequisites || [],
      learningOutcomes: learningOutcomes || [],
      tags: tags || [],
      maxStudents: maxStudents ? parseInt(maxStudents) : null,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      enrolledStudents: []
    });

    await course.save();

    await course.populate([
      { path: 'category', select: 'name icon color' },
      { path: 'instructor', select: 'name email avatar bio' }
    ]);

    logger.info('Course created by admin', {
      adminId: currentUser.userId,
      courseId: course._id,
      title: course.title
    });

    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      course: {
        id: course._id.toString(),
        title: course.title,
        description: course.description,
        category: course.category,
        instructor: course.instructor,
        type: course.type,
        price: course.price,
        thumbnail: course.thumbnail,
        isActive: course.isActive,
        isFeatured: course.isFeatured
      }
    }, { status: 201 });

  } catch (error) {
    logger.error('Error creating course', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to create course' },
      { status: 500 }
    );
  }
}
