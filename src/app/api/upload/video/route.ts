import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { MediaService } from '@/lib/media';

// POST /api/upload/video - Upload video content
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

    // Only tutors and admins can upload videos
    if (!['tutor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Only tutors and admins can upload videos' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('video') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const courseId = formData.get('courseId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No video file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const buffer = Buffer.from(await file.arrayBuffer());
    const maxSize = 500 * 1024 * 1024; // 500MB limit
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];

    const validation = MediaService.validateFile(buffer, allowedTypes, maxSize);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // Upload video to Cloudinary
    const uploadResult = await MediaService.uploadVideo(buffer, {
      folder: `learning-hub/course-videos/${courseId}`,
      public_id: `video_${Date.now()}_${user.userId}`,
      quality: 'auto:good',
      format: 'mp4'
    });

    // Generate thumbnail
    const thumbnailUrl = await MediaService.generateVideoThumbnail(uploadResult.public_id);

    // Get optimized video URL
    const optimizedUrl = MediaService.getOptimizedVideoUrl(uploadResult.public_id);

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      video: {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        optimizedUrl,
        thumbnailUrl,
        duration: uploadResult.duration,
        size: uploadResult.bytes,
        format: uploadResult.format,
        title,
        description,
        uploadedBy: user.userId,
        uploadedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload video' },
      { status: 500 }
    );
  }
}

// DELETE /api/upload/video - Delete video
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['tutor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json(
        { success: false, message: 'Public ID required' },
        { status: 400 }
      );
    }

    // Delete video from Cloudinary
    await MediaService.deleteFile(publicId, 'video');

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error: any) {
    console.error('Video deletion error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete video' },
      { status: 500 }
    );
  }
}