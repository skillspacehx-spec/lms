import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { MediaService } from '@/lib/media';

// POST /api/upload/document - Upload document (PDF, etc.)
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

    // Only tutors and admins can upload documents
    if (!['tutor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Only tutors and admins can upload documents' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('document') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No document file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const buffer = Buffer.from(await file.arrayBuffer());
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    const validation = MediaService.validateFile(buffer, allowedTypes, maxSize);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // Upload document to Cloudinary
    const uploadResult = await MediaService.uploadDocument(buffer, {
      folder: `learning-hub/documents/${category || 'general'}`,
      public_id: `doc_${Date.now()}_${user.userId}`,
      format: file.name.split('.').pop()
    });

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        size: uploadResult.bytes,
        format: uploadResult.format,
        title,
        description,
        category: category || 'general',
        uploadedBy: user.userId,
        uploadedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}

// DELETE /api/upload/document - Delete document
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

    // Delete document from Cloudinary
    await MediaService.deleteFile(publicId, 'raw');

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error: any) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}