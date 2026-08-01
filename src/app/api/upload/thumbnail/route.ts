import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { MediaService } from '@/lib/media';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin' && user.role !== 'tutor') {
      return NextResponse.json(
        { success: false, message: 'Only admins and tutors can upload thumbnails' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    // Accept file under 'image', 'file', or 'thumbnail'
    const file = (formData.get('image') || formData.get('file') || formData.get('thumbnail')) as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No image file provided' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Uploaded file must be an image' },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using MediaService
    const uploadResult = await MediaService.uploadImage(buffer, {
      folder: 'learning-hub/thumbnails',
    });

    console.log('Thumbnail upload success:', uploadResult.secure_url);

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      imageUrl: uploadResult.secure_url,
      image: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      },
      message: 'Thumbnail uploaded successfully'
    });
  } catch (error: any) {
    console.error('Error uploading thumbnail:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload thumbnail' },
      { status: 500 }
    );
  }
}
