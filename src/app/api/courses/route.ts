import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Course, CourseCategory, User } from '@/models';
import { getCurrentUser } from '@/lib/auth';

// GET /api/courses - Get all courses
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const instructor = searchParams.get('instructor');
    const featured = searchParams.get('featured');
    const tags = searchParams.get('tags');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    let filter: any = { isActive: true };
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (instructor) filter.instructor = instructor;
    if (featured === 'true') filter.isFeatured = true;
    if (tags) filter.tags = { $in: tags.split(',').map((t: string) => new RegExp(t.trim(), 'i')) };

    const courses = await Course
      .find(filter)
      .populate('category', 'name icon color')
      .populate('instructor', 'name avatar bio hourlyRate')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Course.countDocuments(filter);

    return NextResponse.json({
      success: true,
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching courses' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create new course
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

    if (user.role !== 'tutor' && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only tutors and admins can create courses' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      type,
      duration,
      price,
      thumbnail,
      maxStudents,
      isActive,
      content,
      isDraft
    } = body;

    // Validate required fields
    if (!title || !description || !category || !type || !duration) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate category exists
    const categoryExists = await CourseCategory.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, message: 'Invalid category' },
        { status: 400 }
      );
    }

    // Create course
    const course = new Course({
      title,
      description,
      category,
      instructor: user.userId,
      type,
      duration,
      price: price || 0,
      thumbnail: thumbnail || '',
      content: content || {
        modules: [],
        resources: []
      },
      isActive: isDraft ? false : (isActive !== undefined ? isActive : true),
      maxStudents: maxStudents || null,
      enrolledStudents: []
    });

    await course.save();

    // Populate for response
    await course.populate([
      { path: 'category', select: 'name icon color' },
      { path: 'instructor', select: 'name avatar bio' }
    ]);

    return NextResponse.json({
      success: true,
      message: isDraft ? 'Course saved as draft' : 'Course created successfully',
      course
    });

  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating course' },
      { status: 500 }
    );
  }
}