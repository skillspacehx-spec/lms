import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Resource, User } from '@/models';
import { getCurrentUser } from '@/lib/auth';

// POST /api/resources - Upload/Create a downloadable resource
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

    // Only tutors and admins can create resources
    if (user.role !== 'tutor' && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only tutors can create resources' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      subcategory,
      targetAudience, // 'parent', 'student', 'both'
      resourceType, // 'pdf', 'worksheet', 'guide', 'template', 'video'
      fileUrl,
      fileSize,
      ageGroup, // 'early-years', 'primary', 'secondary', 'adult'
      difficulty, // 'beginner', 'intermediate', 'advanced'
      tags = [],
      price = 0, // Free by default
      isPublic = true
    } = body;

    // Validate required fields
    if (!title || !description || !category || !resourceType || !fileUrl) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create resource
    const resource = new Resource({
      title,
      description,
      category,
      subcategory,
      targetAudience,
      resourceType,
      fileUrl,
      fileSize,
      ageGroup,
      difficulty,
      tags,
      price,
      isPublic,
      
      // Author info
      createdBy: user.userId,
      
      // Analytics
      downloadCount: 0,
      viewCount: 0,
      rating: 0,
      reviewCount: 0,
      
      // Status
      isActive: true,
      isApproved: user.role === 'admin', // Auto-approve admin uploads
      
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await resource.save();

    // Populate for response
    await resource.populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Resource created successfully',
      resource
    });

  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating resource' },
      { status: 500 }
    );
  }
}

// GET /api/resources - Get downloadable resources
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const targetAudience = searchParams.get('audience');
    const resourceType = searchParams.get('type');
    const ageGroup = searchParams.get('age');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let filter: any = { 
      isActive: true,
      isApproved: true
    };

    // Public resources or user has access
    if (!user) {
      filter.isPublic = true;
      filter.price = 0; // Only free resources for non-authenticated users
    }

    // Apply filters
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (targetAudience) filter.targetAudience = { $in: [targetAudience, 'both'] };
    if (resourceType) filter.resourceType = resourceType;
    if (ageGroup) filter.ageGroup = ageGroup;
    if (difficulty) filter.difficulty = difficulty;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const resources = await Resource.find(filter)
      .populate('createdBy', 'name avatar')
      .select('-fileUrl') // Don't expose direct file URLs in listing
      .sort({ downloadCount: -1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Resource.countDocuments(filter);

    return NextResponse.json({
      success: true,
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching resources' },
      { status: 500 }
    );
  }
}

// Resource Schema (add this to models/index.ts)
export const ResourceSchema = `
const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Academic Support', 'Life Skills & Personal Development', 'Wellbeing & Safeguarding', 'Parent Support & SEND Education']
  },
  subcategory: {
    type: String,
    required: true
  },
  targetAudience: {
    type: String,
    required: true,
    enum: ['parent', 'student', 'both']
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['pdf', 'worksheet', 'guide', 'template', 'video', 'audio', 'presentation']
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    default: 0
  },
  ageGroup: {
    type: String,
    enum: ['early-years', 'primary', 'secondary', 'adult', 'all-ages'],
    default: 'all-ages'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  tags: [{
    type: String,
    trim: true
  }],
  price: {
    type: Number,
    default: 0 // Free by default
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Author
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Analytics
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
`;