/* eslint-disable @next/next/no-assign-module-variable */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { CourseContent } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import mongoose from 'mongoose';

/**
 * GET /api/admin/courses/[id]/content - Get all course modules
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

    const modules = await CourseContent.find({ course: id })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      modules: modules.map(m => ({
        ...m,
        id: m._id.toString()
      }))
    });

  } catch (error) {
    logger.error('Error fetching course content', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course content' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/courses/[id]/content - Add new module to course
 */
export async function POST(
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

    const { id: courseId } = await params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      order,
      isPreview,
      isActive,
      accessLevel,
      content
    } = body;

    console.log('DEBUG: Creating module with data:', {
      title,
      type,
      hasContent: !!content,
      content,
      contentKeys: content ? Object.keys(content) : []
    });

    // Validate required fields
    if (!title || !description || !type) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: title, description, type' },
        { status: 400 }
      );
    }

    // Get highest order if not provided
    let moduleOrder = order;
    if (moduleOrder === undefined) {
      const lastModule = await CourseContent.findOne({ course: courseId })
        .sort({ order: -1 })
        .select('order');
      moduleOrder = lastModule ? lastModule.order + 1 : 0;
    }

    const module = new CourseContent({
      course: courseId,
      title,
      description,
      type,
      order: moduleOrder,
      isPreview: isPreview || false,
      isActive: isActive !== undefined ? isActive : true,
      accessLevel: accessLevel || 'enrolled_only',
      content: content || {}
    });

    // Mark content as modified to ensure nested object is saved
    if (content && Object.keys(content).length > 0) {
      module.markModified('content');
    }

    await module.save();

    console.log('DEBUG: Module created in DB:', {
      id: module._id,
      title: module.title,
      hasContent: !!module.content,
      content: module.content
    });

    logger.info('Course module created', {
      adminId: currentUser.userId,
      courseId,
      moduleId: module._id,
      title: module.title
    });

    return NextResponse.json({
      success: true,
      message: 'Module added successfully',
      module: {
        id: module._id.toString(),
        ...module.toObject()
      }
    }, { status: 201 });

  } catch (error) {
    logger.error('Error creating course module', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to create module' },
      { status: 500 }
    );
  }
}
