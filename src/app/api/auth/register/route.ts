import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models';
import { generateToken } from '@/lib/auth';
import { rateLimit, getClientIP, sanitizeInput, isValidEmail, isStrongPassword } from '@/lib/security';
import { logger } from '@/lib/logger';
import { EmailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting for registration attempts
    if (!rateLimit(`register_${clientIP}`, 5, 60 * 60 * 1000)) { // 3 attempts per hour
      logger.warn('Registration rate limit exceeded', { ip: clientIP });
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }
    await connectDB();
    
    const body = await request.json();
    const { name, email, password, role = 'student' } = body;

    // Validate and sanitize input
    if (!name?.trim() || !email?.trim() || !password) {
      logger.warn('Registration attempt with missing fields', { ip: clientIP });
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      logger.warn('Registration attempt with invalid email', { email: sanitizedEmail, ip: clientIP });
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordStrength = isStrongPassword(password);
    if (!passwordStrength.isValid) {
      logger.warn('Registration attempt with weak password', { email: sanitizedEmail, ip: clientIP });
      return NextResponse.json(
        { success: false, error: passwordStrength.message },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['student', 'parent', 'tutor', 'admin'];
    if (!validRoles.includes(role)) {
      logger.warn('Registration attempt with invalid role', { role, email: sanitizedEmail, ip: clientIP });
      return NextResponse.json(
        { success: false, error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      logger.warn('Registration attempt with existing email', { email: sanitizedEmail, ip: clientIP });
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate email verification token
    const verificationToken = crypto.randomUUID();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = new User({
      name: sanitizedName,
      email: sanitizedEmail,
      password,
      role,
      isEmailVerified: false,
      verificationToken,
      verificationExpires,
      isVerified: role === 'tutor' ? false : true, // Tutors must be approved by admin before becoming visible
      // Set default tutor data if role is tutor
      ...(role === 'tutor' && {
        bio: `Professional ${sanitizedName.split(' ')[0]} ready to help students achieve their goals`,
        subjects: ['General Studies'],
        hourlyRate: 35,
        experience: 1,
        qualifications: ['Qualified Tutor']
      })
    });

    await user.save();

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;
    
    // Log the URL for local testing since emails might not send without an API key
    console.log('\n=======================================');
    console.log('✅ TEST VERIFICATION URL:');
    console.log(verifyUrl);
    console.log('=======================================\n');
    
    try {
      await EmailService.sendVerificationEmail(user.email, {
        name: user.name,
        verifyUrl
      });
    } catch (emailError) {
      logger.error('Failed to send verification email during registration', emailError as Error, { email: user.email });
      // We log it but still return success so the user is created. They can request another email later if needed.
    }

    // Log successful registration
    logger.authEvent('register', user._id.toString(), clientIP, { 
      email: user.email, 
      role: user.role,
      name: user.name 
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: false
    });

    const redirectTo = role === 'tutor' ? '/onboarding/tutor' : '/verify-pending';

    const response = NextResponse.json({
      success: true,
      message: 'User created successfully.',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      redirectTo
    }, { status: 201 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error('Registration API error', error, { ip: clientIP });
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}