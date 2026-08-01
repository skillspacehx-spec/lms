import { google } from 'googleapis';

// Google Calendar OAuth Configuration
export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Get Google Calendar instance with authentication
export function getCalendar(accessToken: string, refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

// Generate authorization URL
export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent screen to get refresh token
  });
}

// Refresh access token if needed
export async function refreshToken(refreshTokenValue: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshTokenValue
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return {
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token || refreshTokenValue
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw new Error('Failed to refresh access token');
  }
}

// Check tutor availability for a specific date/time
export async function checkAvailability(
  accessToken: string,
  refreshToken: string,
  startTime: Date,
  endTime: Date
) {
  try {
    const calendar = getCalendar(accessToken, refreshToken);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    // If there are any events in this time slot, tutor is busy
    return {
      available: events.length === 0,
      conflictingEvents: events.map(event => ({
        id: event.id,
        title: event.summary,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date
      }))
    };

  } catch (error: any) {
    console.error('Error checking availability:', error);
    
    // If token is expired, try to refresh
    if (error.code === 401) {
      throw new Error('Calendar access token expired. Please reconnect your calendar.');
    }
    
    throw new Error('Failed to check calendar availability');
  }
}

// Create calendar event for a tutoring session
export async function createCalendarEvent(
  accessToken: string,
  refreshToken: string,
  eventData: {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    attendeeEmail?: string;
    location?: string;
  }
) {
  try {
    const calendar = getCalendar(accessToken, refreshToken);

    const event = {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: eventData.endTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: eventData.attendeeEmail ? [{ email: eventData.attendeeEmail }] : [],
      location: eventData.location,
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: false
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: event,
      sendUpdates: 'all'
    });

    return {
      eventId: response.data.id,
      meetingLink: response.data.hangoutLink || response.data.htmlLink,
      htmlLink: response.data.htmlLink
    };

  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    
    if (error.code === 401) {
      throw new Error('Calendar access token expired. Please reconnect your calendar.');
    }
    
    throw new Error('Failed to create calendar event');
  }
}

// Get tutor's busy slots for a date range
export async function getTutorBusySlots(
  accessToken: string,
  refreshToken: string,
  startDate: Date,
  endDate: Date
) {
  try {
    const calendar = getCalendar(accessToken, refreshToken);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    return events.map(event => ({
      id: event.id,
      title: event.summary,
      start: new Date(event.start?.dateTime || event.start?.date || ''),
      end: new Date(event.end?.dateTime || event.end?.date || ''),
      allDay: !!event.start?.date // If date instead of dateTime, it's all day
    }));

  } catch (error: any) {
    console.error('Error fetching busy slots:', error);
    
    if (error.code === 401) {
      throw new Error('Calendar access token expired. Please reconnect your calendar.');
    }
    
    throw new Error('Failed to fetch calendar events');
  }
}