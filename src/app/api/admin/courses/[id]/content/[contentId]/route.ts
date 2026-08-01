/* eslint-disable prefer-rest-params */
/* eslint-disable @next/next/no-assign-module-variable */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { CourseContent } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { MediaService } from '@/lib/media';
import mongoose from 'mongoose';

/**
 * GET /api/admin/courses/[id]/content/[contentId] - Get single module
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contentId: string }> }
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

    const { contentId } = await params;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid content ID' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @next/next/no-assign-module-variable
    const module = await CourseContent.findById(contentId).lean();

    if (!module) {
      return NextResponse.json(
        { success: false, message: 'Module not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      module: {
        ...module,
        id: module._id.toString()
      }
    });

  } catch (error) {
    logger.error('Error fetching module', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch module' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/courses/[id]/content/[contentId] - Update module
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contentId: string }> }
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

    const { contentId } = await params;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid content ID' },
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

    console.log('DEBUG: Updating module with data:', {
      title,
      type,
      hasContent: !!content,
      content,
      contentKeys: content ? Object.keys(content) : []
    });

    // Fetch the module first
    const module = await CourseContent.findById(contentId);

    if (!module) {
      return NextResponse.json(
        { success: false, message: 'Module not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (title !== undefined) module.title = title;
    if (description !== undefined) module.description = description;
    if (type !== undefined) module.type = type;
    if (order !== undefined) module.order = parseInt(order);
    if (isPreview !== undefined) module.isPreview = isPreview;
    if (isActive !== undefined) module.isActive = isActive;
    if (accessLevel !== undefined) module.accessLevel = accessLevel;
    
    // Update content object - Mongoose needs explicit marking for nested objects
    if (content !== undefined) {
      module.content = content;
      module.markModified('content'); // CRITICAL: Tell Mongoose this nested field changed
    }

    console.log('DEBUG: Module before save:', {
      id: module._id,
      title: module.title,
      hasContent: !!module.content,
      content: module.content
    });

    // Save the module
    await module.save();

    console.log('DEBUG: Module after save:', {
      id: module._id,
      title: module.title,
      hasContent: !!module.content,
      content: module.content
    });

    if (!module) {
      return NextResponse.json(
        { success: false, message: 'Module not found' },
        { status: 404 }
      );
    }

    logger.info('Module updated', {
      adminId: currentUser.userId,
      moduleId: contentId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updates: Object.keys({ title, description, type, order, isPreview, isActive, accessLevel, content }).filter(k => (arguments as any)[0] !== undefined)
    });

    return NextResponse.json({
      success: true,
      message: 'Module updated successfully',
      module
    });

  } catch (error) {
    logger.error('Error updating module', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to update module' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/courses/[id]/content/[contentId] - Delete module
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contentId: string }> }
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

    const { contentId } = await params;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid content ID' },
        { status: 400 }
      );
    }

    const module = await CourseContent.findById(contentId);

    if (!module) {
      return NextResponse.json(
        { success: false, message: 'Module not found' },
        { status: 404 }
      );
    }

    // Delete associated media from Cloudinary if exists
    if (module.content?.videoCloudinaryId) {
      try {
        await MediaService.deleteFile(module.content.videoCloudinaryId, 'video');
      } catch (err) {
        logger.warn('Failed to delete video from Cloudinary', { error: err });
      }
    }

    if (module.content?.documentCloudinaryId) {
      try {
        await MediaService.deleteFile(module.content.documentCloudinaryId, 'raw');
      } catch (err) {
        logger.warn('Failed to delete document from Cloudinary', { error: err });
      }
    }

    await CourseContent.findByIdAndDelete(contentId);

    logger.info('Module deleted', {
      adminId: currentUser.userId,
      moduleId: contentId,
      title: module.title
    });

    return NextResponse.json({
      success: true,
      message: 'Module deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting module', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete module' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/courses/[id]/content/[contentId] - Toggle module active status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contentId: string }> }
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

    const { contentId } = await params;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid content ID' },
        { status: 400 }
      );
    }

    const module = await CourseContent.findById(contentId);

    if (!module) {
      return NextResponse.json(
        { success: false, message: 'Module not found' },
        { status: 404 }
      );
    }

    module.isActive = !module.isActive;
    await module.save();

    logger.info(`Module ${module.isActive ? 'activated' : 'deactivated'}`, {
      adminId: currentUser.userId,
      moduleId: contentId,
      newStatus: module.isActive
    });

    return NextResponse.json({
      success: true,
      message: `Module ${module.isActive ? 'activated' : 'deactivated'} successfully`,
      module: {
        id: module._id.toString(),
        title: module.title,
        isActive: module.isActive
      }
    });

  } catch (error) {
    logger.error('Error toggling module status', error as Error);
    return NextResponse.json(
      { success: false, message: 'Failed to toggle module status' },
      { status: 500 }
    );
  }
}
