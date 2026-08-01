import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import { generateToken } from '@/lib/auth';
import { rateLimit, getClientIP, sanitizeInput, isValidEmail } from '@/lib/security';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  
  try {
    // Rate limiting
    if (!rateLimit(`login_${clientIP}`, 5, 15 * 60 * 1000)) {
      logger.warn('Login rate limit exceeded', { ip: clientIP });
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    await connectDB();
    
    const body = await request.json();
    const { email, password } = body;

    // Validate and sanitize input
    if (!email || !password) {
      logger.warn('Login attempt with missing credentials', { ip: clientIP });
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    
    if (!isValidEmail(sanitizedEmail)) {
      logger.warn('Login attempt with invalid email format', { email: sanitizedEmail, ip: clientIP });
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: sanitizedEmail })
      .select('+password +onboardingCompleted +preferences');
    
    if (!user) {
      logger.authEvent('failed_login', undefined, clientIP, { reason: 'user_not_found', email: sanitizedEmail });
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.authEvent('failed_login', user._id.toString(), clientIP, { reason: 'invalid_password', email: sanitizedEmail });
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if email is verified — admins are exempt from this requirement
    if (user.role !== 'admin' && !user.isEmailVerified) {
      logger.authEvent('failed_login', user._id.toString(), clientIP, { reason: 'email_not_verified', email: sanitizedEmail });
      return NextResponse.json(
        { success: false, error: 'Please verify your email address to continue. Check your inbox for the verification link.' },
        { status: 403 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Create response with user data
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified
    };

    // Check if user has completed onboarding (with debug logging)
    const hasCompletedOnboarding = user.onboardingCompleted === true;
    
    // Debug log
    console.log('🔍 Login Debug:', {
      email: user.email,
      onboardingCompleted: user.onboardingCompleted,
      hasCompletedOnboarding,
      preferences: user.preferences
    });

    // Determine redirect URL - only new users go to onboarding
    const redirectTo = !hasCompletedOnboarding && (user.role === 'student' || user.role === 'parent' || user.role === 'tutor')
      ? `/onboarding/${user.role}`
      : `/dashboard/${user.role}`;

    // Log successful login
    logger.authEvent('login', user._id.toString(), clientIP, { email: user.email, role: user.role });

    // Set httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      redirectTo
    }, { status: 200 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error: any) {
    logger.error('Login API error', error, { ip: clientIP });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}