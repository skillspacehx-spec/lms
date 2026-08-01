import axios from 'axios';

// Zoom API configuration using Server-to-Server OAuth
const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_DEFAULT_USER_ID = process.env.ZOOM_DEFAULT_USER_ID; // Your Zoom user email

interface ZoomMeetingConfig {
  topic: string;
  type: number; // 1: Instant, 2: Scheduled, 3: Recurring (no fixed time), 8: Recurring (fixed time)
  start_time?: string; // UTC datetime
  duration?: number; // Duration in minutes
  timezone?: string;
  password?: string;
  agenda?: string;
  settings?: {
    host_video?: boolean;
    participant_video?: boolean;
    cn_meeting?: boolean;
    in_meeting?: boolean;
    join_before_host?: boolean;
    mute_upon_entry?: boolean;
    watermark?: boolean;
    use_pmi?: boolean;
    approval_type?: number; // 0: Automatically approve, 1: Manually approve, 2: No registration required
    audio?: string; // 'both', 'telephony', 'voip'
    auto_recording?: string; // 'local', 'cloud', 'none'
    enforce_login?: boolean;
    registrants_email_notification?: boolean;
    waiting_room?: boolean;
    allow_multiple_devices?: boolean;
  };
}

interface ZoomMeetingResponse {
  id: number;
  uuid: string;
  host_id: string;
  topic: string;
  type: number;
  status: string;
  start_time: string;
  duration: number;
  timezone: string;
  agenda: string;
  created_at: string;
  start_url: string;
  join_url: string;
  password: string;
  h323_password: string;
  pstn_password: string;
  encrypted_password: string;
  settings: unknown;
  pre_schedule: boolean;
}

// OAuth Access Token Cache
let accessTokenCache: { token: string; expiresAt: number } | null = null;

// Get OAuth Access Token using Server-to-Server OAuth
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 minute buffer)
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.token;
  }

  if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET || !ZOOM_ACCOUNT_ID) {
    throw new Error('Zoom credentials not configured. Please set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET in .env');
  }

  try {
    const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(
      'https://zoom.us/oauth/token',
      `grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, expires_in } = response.data;

    // Cache token with 5 minute buffer before expiry
    accessTokenCache = {
      token: access_token,
      expiresAt: Date.now() + (expires_in - 300) * 1000
    };

    console.log('✅ Zoom access token obtained successfully');
    return access_token;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error getting Zoom access token:', error.response?.data || error.message);
      throw new Error(`Failed to authenticate with Zoom: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('Failed to authenticate with Zoom');
  }
}

// Create axios instance with dynamic auth
async function getZoomAPI() {
  const token = await getAccessToken();
  return axios.create({
    baseURL: ZOOM_API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export class ZoomService {
  // Create a new Zoom meeting
  static async createMeeting(userId: string | undefined, meetingConfig: ZoomMeetingConfig): Promise<ZoomMeetingResponse> {
    try {
      // Use provided userId or fall back to default
      const zoomUserId = userId || ZOOM_DEFAULT_USER_ID;
      
      if (!zoomUserId) {
        throw new Error('Zoom user ID not provided and ZOOM_DEFAULT_USER_ID not set in environment');
      }

      const api = await getZoomAPI();
      const response = await api.post(`/users/${zoomUserId}/meetings`, meetingConfig);
      
      console.log(`✅ Zoom meeting created: ${response.data.id}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error creating Zoom meeting:', error.response?.data || error.message);
        throw new Error(`Failed to create Zoom meeting: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to create Zoom meeting');
    }
  }

  // Get meeting details
  static async getMeeting(meetingId: string): Promise<ZoomMeetingResponse> {
    try {
      const api = await getZoomAPI();
      const response = await api.get(`/meetings/${meetingId}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching Zoom meeting:', error.response?.data || error.message);
        throw new Error(`Failed to fetch Zoom meeting: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to fetch Zoom meeting');
    }
  }

  // Update a meeting
  static async updateMeeting(meetingId: string, meetingConfig: Partial<ZoomMeetingConfig>): Promise<void> {
    try {
      const api = await getZoomAPI();
      await api.patch(`/meetings/${meetingId}`, meetingConfig);
      console.log(`✅ Zoom meeting updated: ${meetingId}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error updating Zoom meeting:', error.response?.data || error.message);
        throw new Error(`Failed to update Zoom meeting: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to update Zoom meeting');
    }
  }

  // Delete a meeting
  static async deleteMeeting(meetingId: string): Promise<void> {
    try {
      const api = await getZoomAPI();
      await api.delete(`/meetings/${meetingId}`);
      console.log(`✅ Zoom meeting deleted: ${meetingId}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error deleting Zoom meeting:', error.response?.data || error.message);
        throw new Error(`Failed to delete Zoom meeting: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to delete Zoom meeting');
    }
  }

  // List user's meetings
  static async listMeetings(userId: string, type: 'scheduled' | 'live' | 'upcoming' = 'scheduled'): Promise<unknown> {
    try {
      const api = await getZoomAPI();
      const response = await api.get(`/users/${userId}/meetings?type=${type}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error listing Zoom meetings:', error.response?.data || error.message);
        throw new Error(`Failed to list Zoom meetings: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to list Zoom meetings');
    }
  }

  // Get meeting recordings
  static async getMeetingRecordings(meetingId: string): Promise<unknown> {
    try {
      const api = await getZoomAPI();
      const response = await api.get(`/meetings/${meetingId}/recordings`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching meeting recordings:', error.response?.data || error.message);
        throw new Error(`Failed to fetch meeting recordings: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to fetch meeting recordings');
    }
  }

  // Delete meeting recordings
  static async deleteMeetingRecordings(meetingId: string): Promise<void> {
    try {
      const api = await getZoomAPI();
      await api.delete(`/meetings/${meetingId}/recordings`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error deleting meeting recordings:', error.response?.data || error.message);
        throw new Error(`Failed to delete meeting recordings: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to delete meeting recordings');
    }
  }

  // Get user info
  static async getUserInfo(userId: string): Promise<unknown> {
    try {
      const api = await getZoomAPI();
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching user info:', error.response?.data || error.message);
        throw new Error(`Failed to fetch user info: ${error.response?.data?.message || error.message}`);
      }
      throw new Error('Failed to fetch user info');
    }
  }

  // Create a scheduled class meeting with default settings
  static async createClassMeeting(
    teacherEmail: string,
    className: string,
    description: string,
    startTime: Date,
    duration: number = 60
  ): Promise<ZoomMeetingResponse> {
    const meetingConfig: ZoomMeetingConfig = {
      topic: className,
      type: 2, // Scheduled meeting
      start_time: startTime.toISOString(),
      duration: duration,
      timezone: 'UTC',
      agenda: description,
      settings: {
        host_video: true,
        participant_video: false,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        approval_type: 0, // Automatically approve
        audio: 'both',
        auto_recording: 'cloud', // Record to cloud
        waiting_room: true, // Enable waiting room for security
        allow_multiple_devices: false,
        registrants_email_notification: true,
      },
    };

    return await this.createMeeting(teacherEmail, meetingConfig);
  }

  // Create instant meeting for 1:1 tutoring
  static async createInstantTutoringSession(
    teacherEmail: string,
    sessionTitle: string,
    studentName: string
  ): Promise<ZoomMeetingResponse> {
    const meetingConfig: ZoomMeetingConfig = {
      topic: `1:1 Tutoring: ${sessionTitle} with ${studentName}`,
      type: 1, // Instant meeting
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: false,
        watermark: false,
        approval_type: 0,
        audio: 'both',
        auto_recording: 'cloud',
        waiting_room: false, // No waiting room for 1:1 sessions
        allow_multiple_devices: false,
      },
    };

    return await this.createMeeting(teacherEmail, meetingConfig);
  }
}

// Export types for use in other files
export type { ZoomMeetingConfig, ZoomMeetingResponse };