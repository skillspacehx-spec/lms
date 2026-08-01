import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import { getCurrentUser } from '@/lib/auth';

// POST /api/users/children - Add children profiles for parent
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

    if (user.role !== 'parent') {
      return NextResponse.json(
        { success: false, message: 'Only parents can add children' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { children, familyInfo, preferences, tutorPreferences } = body;

    // Create child user accounts
    const childIds = [];
    for (const child of children) {
      // Create a student account for each child
      // Note: Store child-specific data (age, gradeLevel, learningStyle) in preferences
      const childUser = await User.create({
        name: child.name,
        email: `${child.name.toLowerCase().replace(/\s+/g, '')}@parent-${user.userId}.child`,
        password: Math.random().toString(36).slice(-12), // Random password
        role: 'student',
        subjects: child.subjects || [],
        preferences: {
          subjects: child.subjects || [],
          learningGoals: child.goals ? child.goals.join(', ') : '',
          preferredSchedule: child.learningStyle || ''
        },
        onboardingCompleted: true
      });
      
      childIds.push(childUser._id);
    }

    // Update parent user with children references and preferences
    const updatedParent = await User.findByIdAndUpdate(
      user.userId,
      {
        $set: {
          children: childIds,
          preferences: {
            ...preferences,
            subjects: preferences?.subjects || []
          },
          onboardingCompleted: true
        }
      },
      { new: true, runValidators: true }
    ).populate('children', 'name email subjects preferences');

    if (!updatedParent) {
      return NextResponse.json(
        { success: false, message: 'Parent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Children profiles created successfully',
      parent: {
        id: updatedParent._id,
        name: updatedParent.name,
        email: updatedParent.email,
        role: updatedParent.role,
        children: updatedParent.children,
        onboardingCompleted: updatedParent.onboardingCompleted
      }
    });
  } catch (error) {
    console.error('Error creating children profiles:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create children profiles' },
      { status: 500 }
    );
  }
}

// GET /api/users/children - Get all children for current parent
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'parent') {
      return NextResponse.json(
        { success: false, message: 'Only parents can view children' },
        { status: 403 }
      );
    }

    const parent = await User.findById(user.userId).populate('children', 'name age gradeLevel subjects learningStyle goals');

    if (!parent) {
      return NextResponse.json(
        { success: false, message: 'Parent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      children: parent.children || []
    });
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch children' },
      { status: 500 }
    );
  }
}
