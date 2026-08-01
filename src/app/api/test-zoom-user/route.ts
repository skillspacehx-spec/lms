import { NextResponse } from 'next/server';
import axios from 'axios';

// GET /api/test-zoom-user - Get your Zoom user ID
export async function GET() {
  try {
    const credentials = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString('base64');
    
    // Get access token
    const tokenResponse = await axios.post(
      'https://zoom.us/oauth/token',
      `grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get current user
    const userResponse = await axios.get('https://api.zoom.us/v2/users/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    return NextResponse.json({
      success: true,
      message: 'Copy this user ID to ZOOM_DEFAULT_USER_ID in .env file',
      user: {
        id: userResponse.data.id,
        email: userResponse.data.email,
        firstName: userResponse.data.first_name,
        lastName: userResponse.data.last_name,
        type: userResponse.data.type,
        status: userResponse.data.status
      },
      instruction: `Add this to .env: ZOOM_DEFAULT_USER_ID="${userResponse.data.id}"`
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json({
        success: false,
        error: error.response?.data || error.message,
        message: 'Make sure ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET are set correctly in .env'
      }, { status: 500 });
    }
    return NextResponse.json({
      success: false,
      error: 'Unknown error occurred'
    }, { status: 500 });
  }
}
