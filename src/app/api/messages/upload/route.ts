import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { MediaService } from '@/lib/media';

// Max file size: 10MB for images, 25MB for documents, 50MB for videos
const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  document: 25 * 1024 * 1024, // 25MB
  video: 50 * 1024 * 1024, // 50MB
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Determine file type category
    let fileCategory: 'image' | 'document' | 'video';
    let resourceType: 'image' | 'raw' | 'video' = 'raw';

    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      fileCategory = 'image';
      resourceType = 'image';
    } else if (ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      fileCategory = 'document';
      resourceType = 'raw';
    } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
      fileCategory = 'video';
      resourceType = 'video';
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Allowed: images (jpg, png, gif, webp), documents (pdf, doc, docx, xls, xlsx, txt), videos (mp4, mov, webm)' 
        },
        { status: 400 }
      );
    }

    // Check file size
    const maxSize = MAX_FILE_SIZES[fileCategory];
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File too large. Maximum size for ${fileCategory}s is ${maxSize / (1024 * 1024)}MB` 
        },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary based on file type
    let uploadResult;
    try {
      if (resourceType === 'image') {
        uploadResult = await MediaService.uploadImage(buffer, {
          folder: `messages/${user.userId}`,
          public_id: undefined
        });
      } else if (resourceType === 'video') {
        uploadResult = await MediaService.uploadVideo(buffer, {
          folder: `messages/${user.userId}`,
          public_id: undefined
        });
      } else {
        // Document upload
        uploadResult = await MediaService.uploadDocument(buffer, {
          folder: `messages/${user.userId}`,
          public_id: undefined
        });
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return NextResponse.json(
        { success: false, error: 'File upload failed' },
        { status: 500 }
      );
    }

    if (!uploadResult || !uploadResult.secure_url) {
      return NextResponse.json(
        { success: false, error: 'File upload failed' },
        { status: 500 }
      );
    }

    // Prepare response
    const attachment = {
      url: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id || '',
      type: fileCategory,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date()
    };

    console.log(`✅ File uploaded by ${user.email}: ${file.name} (${fileCategory})`);

    return NextResponse.json({
      success: true,
      data: attachment,
      message: 'File uploaded successfully'
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'File upload failed');
    console.error('❌ File upload error:', message, error);
    return NextResponse.json(
      { 
        success: false, 
        error: message
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check upload limits
export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        limits: {
          image: {
            maxSize: MAX_FILE_SIZES.image,
            maxSizeMB: MAX_FILE_SIZES.image / (1024 * 1024),
            allowedTypes: ALLOWED_IMAGE_TYPES
          },
          document: {
            maxSize: MAX_FILE_SIZES.document,
            maxSizeMB: MAX_FILE_SIZES.document / (1024 * 1024),
            allowedTypes: ALLOWED_DOCUMENT_TYPES
          },
          video: {
            maxSize: MAX_FILE_SIZES.video,
            maxSizeMB: MAX_FILE_SIZES.video / (1024 * 1024),
            allowedTypes: ALLOWED_VIDEO_TYPES
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Get upload limits error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get upload limits' },
      { status: 500 }
    );
  }
}
