/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Course, CourseContent } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import mongoose from 'mongoose';

/**
 * GET /api/admin/courses/[id] - Get single course details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const course = await Course.findById(id)
      .populate('category', 'name icon color')
      .populate('instructor', 'name email avatar bio')
      .populate('enrolledStudents', 'name email avatar')
      .lean();

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Get modules
    const modules = await CourseContent.find({ course: id })
      .sort({ order: 1 })
      .lean();

    console.log('DEBUG Admin Course Detail API:');
    console.log('- Course ID:', id);
    console.log('- Course title:', course.title);
    console.log('- Modules found:', modules.length);
    console.log('- Sample module:', modules[0] ? {
      id: modules[0]._id,
      title: modules[0].title,
      type: modules[0].type,
      accessLevel: modules[0].accessLevel
    } : 'No modules');

    const response = {
      success: true,
      course: {
        ...course,
        id: course._id.toString(),
        modules
      }
    };

    console.log('- Response structure has course.modules:', !!response.course.modules);
    console.log('- Response modules length:', response.course.modules.length);

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Error fetching course', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/courses/[id] - Update course
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid course ID' },
        { status: 400 }
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
      isFeatured,
      webinarData
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (instructor !== undefined) updateData.instructor = instructor;
    if (type !== undefined) updateData.type = type;
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (level !== undefined) updateData.level = level;
    if (language !== undefined) updateData.language = language;
    if (prerequisites !== undefined) updateData.prerequisites = prerequisites;
    if (learningOutcomes !== undefined) updateData.learningOutcomes = learningOutcomes;
    if (tags !== undefined) updateData.tags = tags;
    if (maxStudents !== undefined) updateData.maxStudents = maxStudents ? parseInt(maxStudents) : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (webinarData !== undefined) updateData.webinarData = webinarData;

    const course = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate([
      { path: 'category', select: 'name icon color' },
      { path: 'instructor', select: 'name email avatar' }
    ]);

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    logger.info('Course updated', {
      adminId: currentUser.userId,
      courseId: id,
      updates: Object.keys(updateData)
    });

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      course
    });

  } catch (error) {
    logger.error('Error updating course', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to update course' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/courses/[id] - Delete course
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if course has enrollments
    if (course.enrolledStudents && course.enrolledStudents.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot delete course with ${course.enrolledStudents.length} enrolled students. Please deactivate instead.` 
        },
        { status: 400 }
      );
    }

    // Delete all course content/modules
    await CourseContent.deleteMany({ course: id });

    // Delete course
    await Course.findByIdAndDelete(id);

    logger.info('Course deleted', {
      adminId: currentUser.userId,
      courseId: id,
      title: course.title
    });

    return NextResponse.json({
      success: true,
      message: 'Course and all its content deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting course', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
