import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
  duration?: number; // for video files
  width?: number;
  height?: number;
  created_at: string;
}

export class MediaService {
  
  // Upload image to Cloudinary
  static async uploadImage(
    file: Buffer | string, 
    options: {
      folder?: string;
      public_id?: string;
      transformation?: any;
    } = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const uploadOptions: any = {
        resource_type: 'image',
        folder: options.folder || 'learning-hub/images',
      };

      if (options.public_id) uploadOptions.public_id = options.public_id;
      if (options.transformation) uploadOptions.transformation = options.transformation;

      const dataURI = typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`;

      const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

      return result as CloudinaryUploadResult;
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  // Upload video to Cloudinary
  static async uploadVideo(
    file: Buffer | string,
    options: {
      folder?: string;
      public_id?: string;
    } = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const uploadOptions: any = {
        resource_type: 'video',
        folder: options.folder || 'learning-hub/videos',
      };

      if (options.public_id) uploadOptions.public_id = options.public_id;

      const dataURI = typeof file === 'string' ? file : `data:video/mp4;base64,${file.toString('base64')}`;

      const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

      return result as CloudinaryUploadResult;
    } catch (error: any) {
      console.error('Video upload error:', error);
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }

  // Upload document (PDF, etc.) to Cloudinary
  static async uploadDocument(
    file: Buffer | string,
    options: {
      folder?: string;
      public_id?: string;
    } = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const uploadOptions: any = {
        resource_type: 'raw',
        folder: options.folder || 'learning-hub/documents',
      };

      if (options.public_id) uploadOptions.public_id = options.public_id;

      const dataURI = typeof file === 'string' ? file : `data:application/pdf;base64,${file.toString('base64')}`;

      const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

      return result as CloudinaryUploadResult;
    } catch (error: any) {
      console.error('Document upload error:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  // Delete file from Cloudinary
  static async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error: any) {
      console.error('File deletion error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Generate video thumbnail
  static async generateVideoThumbnail(videoPublicId: string): Promise<string> {
    try {
      return cloudinary.url(videoPublicId, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [
          {
            start_offset: '5' // Take thumbnail at 5 seconds
          }
        ]
      });
    } catch (error: any) {
      console.error('Thumbnail generation error:', error);
      throw new Error(`Failed to generate thumbnail: ${error.message}`);
    }
  }

  // Get optimized image URL
  static getOptimizedImageUrl(
    publicId: string, 
    options: {
      width?: number;
      height?: number;
      quality?: string | number;
      format?: string;
    } = {}
  ): string {
    return cloudinary.url(publicId, {
      resource_type: 'image',
      width: options.width,
      height: options.height,
      quality: options.quality || 'auto:good',
      format: options.format || 'jpg',
      crop: 'fill'
    });
  }

  // Get optimized video URL with adaptive streaming
  static getOptimizedVideoUrl(
    publicId: string,
    options: {
      quality?: string;
      format?: string;
    } = {}
  ): string {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      quality: options.quality || 'auto:good',
      format: options.format || 'mp4',
      transformation: [
        {
          streaming_profile: 'hd',
          format: 'auto'
        }
      ]
    });
  }

  // Convert file buffer to base64 URL for upload
  static fileToBase64Url(buffer: Buffer, mimeType: string): string {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  }

  // Validate file type and size
  static validateFile(
    buffer: Buffer,
    allowedTypes: string[],
    maxSize: number // in bytes
  ): { valid: boolean; error?: string } {
    if (buffer.length > maxSize) {
      return { 
        valid: false, 
        error: `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB` 
      };
    }

    // Basic file type detection (you might want to use a more sophisticated library)
    const header = buffer.toString('hex', 0, 4).toUpperCase();
    const fileTypeMap: { [key: string]: string } = {
      'FFD8': 'image/jpeg',
      '8950': 'image/png',
      '4749': 'image/gif',
      '2550': 'application/pdf',
      '0000': 'video/mp4', // Simplified - MP4 detection is more complex
    };

    const detectedType = Object.entries(fileTypeMap).find(([magic]) => 
      header.startsWith(magic)
    )?.[1];

    if (!detectedType || !allowedTypes.includes(detectedType)) {
      return { 
        valid: false, 
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` 
      };
    }

    return { valid: true };
  }

  // Get file info from Cloudinary
  static async getFileInfo(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') {
    try {
      const result = await cloudinary.api.resource(publicId, { resource_type: resourceType });
      return result;
    } catch (error: any) {
      console.error('Get file info error:', error);
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  // List files in a folder
  static async listFiles(
    folder: string, 
    resourceType: 'image' | 'video' | 'raw' = 'image',
    options: {
      maxResults?: number;
      nextCursor?: string;
    } = {}
  ) {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: resourceType,
        prefix: folder,
        max_results: options.maxResults || 100,
        next_cursor: options.nextCursor
      });
      return result;
    } catch (error: any) {
      console.error('List files error:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }
}