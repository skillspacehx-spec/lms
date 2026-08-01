import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/models';
import { getOAuth2Client } from '@/lib/google-calendar';

// GET /api/calendar/callback - Handle OAuth callback from Google
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getCurrentUser();
    if (!user) {
      // Use localhost for development
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL 
        : 'http://localhost:3000';
      return NextResponse.redirect(new URL('/login', baseUrl));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    // Get correct base URL for redirects
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_APP_URL 
      : 'http://localhost:3000';

    if (error) {
      console.error('Calendar OAuth error:', error);
      return NextResponse.redirect(
        new URL('/dashboard/tutor?calendar=error&message=' + encodeURIComponent(error), baseUrl)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/tutor?calendar=error&message=No authorization code', baseUrl)
      );
    }

    try {
      const oauth2Client = getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to obtain access tokens');
      }

      // Update user with calendar tokens
      await User.findByIdAndUpdate(user.userId, {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        calendarConnected: true,
        calendarConnectedAt: new Date()
      });

      return NextResponse.redirect(
        new URL('/dashboard/tutor?calendar=connected', baseUrl)
      );

    } catch (tokenError: any) {
      console.error('Error exchanging code for tokens:', tokenError);
      return NextResponse.redirect(
        new URL('/dashboard/tutor?calendar=error&message=Failed to connect calendar', baseUrl)
      );
    }

  } catch (error: any) {
    console.error('Calendar callback error:', error);
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_APP_URL 
      : 'http://localhost:3000';
    return NextResponse.redirect(
      new URL('/dashboard/tutor?calendar=error&message=Connection failed', baseUrl)
    );
  }
}