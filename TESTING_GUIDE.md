# Testing Guide - Missing Features Implementation
**Date**: February 3, 2026  
**Features**: Phase 1 & Phase 2 implementations

---

## 🎯 Test Overview

Testing 6 newly implemented features:
1. ✅ Zoom webhook database updates
2. ✅ Course completion certificates
3. ✅ Invoice download (Stripe receipts)
4. ✅ Review notifications to tutors
5. ✅ Message notifications
6. ✅ Meeting cancellation emails

---

## 🔧 Pre-Test Setup

### 1. Environment Check
```bash
# Verify environment variables
✓ MONGODB_URI
✓ JWT_SECRET
✓ STRIPE_SECRET_KEY
✓ STRIPE_WEBHOOK_SECRET
✓ ZOOM_WEBHOOK_SECRET_TOKEN
✓ RESEND_API_KEY (or SMTP settings)
✓ NEXT_PUBLIC_APP_URL
```

### 2. Database Connection
```bash
# Check MongoDB is running
✓ MongoDB connected
✓ Models loaded
```

### 3. Test Accounts
Use `/api/test-users` to create test accounts:
- `student@example.com` (password: `password123`)
- `parent@example.com` (password: `password123`)
- `tutor@example.com` (password: `password123`)
- `admin@example.com` (password: `password123`)

---

## 📝 Test Plan

### Test 1: Zoom Webhook Database Updates

**Endpoint**: `POST /api/webhooks/zoom`

#### Test 1.1: Meeting Started Event
```bash
# Setup
1. Login as student
2. Book a session with tutor
3. Note the Session ID and Zoom Meeting ID

# Simulate Zoom webhook
curl -X POST http://localhost:3000/api/webhooks/zoom \
  -H "Content-Type: application/json" \
  -H "x-zm-request-timestamp: $(date +%s)" \
  -H "x-zm-signature: v0=YOUR_SIGNATURE" \
  -d '{
    "event": "meeting.started",
    "payload": {
      "object": {
        "id": "ZOOM_MEETING_ID"
      }
    }
  }'

# Verify
- Check Session status changed to 'in_progress'
- Query: db.sessions.find({zoomMeetingId: "ZOOM_MEETING_ID"})
- Expected: status: 'in_progress'
```

**Expected Results**:
- ✅ Session status: `scheduled` → `in_progress`
- ✅ LiveClass status: `scheduled` → `live`
- ✅ Console log: "✅ Updated session/class status to in_progress/live"

#### Test 1.2: Meeting Ended Event
```bash
# Simulate meeting end
curl -X POST http://localhost:3000/api/webhooks/zoom \
  -d '{
    "event": "meeting.ended",
    "payload": {
      "object": {
        "id": "ZOOM_MEETING_ID",
        "end_time": "2026-02-03T15:30:00Z"
      }
    }
  }'

# Verify
- Session status: 'completed'
- updatedAt: matches end_time
```

**Expected Results**:
- ✅ Session status: `in_progress` → `completed`
- ✅ Console log: "✅ Updated session/class status to completed"

#### Test 1.3: Recording Completed Event
```bash
# Simulate recording completion
curl -X POST http://localhost:3000/api/webhooks/zoom \
  -d '{
    "event": "recording.completed",
    "payload": {
      "object": {
        "id": "RECORDING_ID",
        "topic": "Math Tutoring Session",
        "start_time": "2026-02-03T14:00:00Z",
        "host_id": "TUTOR_USER_ID",
        "recording_files": [
          {
            "id": "FILE_ID_1",
            "file_name": "recording.mp4",
            "file_type": "MP4",
            "file_size": 52428800,
            "download_url": "https://zoom.us/recording/download/xxx",
            "recording_start": "2026-02-03T14:00:00Z",
            "recording_end": "2026-02-03T15:00:00Z"
          }
        ]
      }
    }
  }'

# Verify
db.videorecords.find({cloudinaryId: "FILE_ID_1"})
```

**Expected Results**:
- ✅ VideoRecord created with:
  - `title`: "Math Tutoring Session"
  - `cloudinaryUrl`: Download URL
  - `duration`: 3600 seconds (1 hour)
  - `processingStatus`: "completed"
  - `isProcessed`: true
- ✅ Console log: "✅ Saved 1 recording(s) to database"

---

### Test 2: Course Completion Certificates

**Endpoint**: `GET /api/certificates`

#### Test 2.1: Session Milestone Certificates
```bash
# Setup
1. Login as student@example.com
2. Ensure student has 10+ completed sessions

# Test
curl http://localhost:3000/api/certificates \
  -H "Cookie: token=YOUR_JWT_TOKEN"

# Expected response
{
  "success": true,
  "certificates": [
    {
      "id": "10-sessions-cert",
      "title": "Dedicated Learner Certificate",
      "description": "Awarded for completing 10 tutoring sessions",
      "issuedDate": "2026-01-15T...",
      "type": "milestone"
    }
  ],
  "stats": {
    "totalCertificates": 1,
    "completedSessions": 12
  }
}
```

**Expected Results**:
- ✅ 10 sessions → "Dedicated Learner Certificate"
- ✅ 25 sessions → "Learning Champion Certificate"
- ✅ 50 sessions → "Master Student Certificate"

#### Test 2.2: Course Completion Certificates
```bash
# Setup
1. Login as student
2. Complete a course 100% (set completionPercentage: 100, completedAt: Date.now())

# Update user progress manually (for testing)
db.users.updateOne(
  { email: "student@example.com" },
  { 
    $push: { 
      progress: {
        course: ObjectId("COURSE_ID"),
        completionPercentage: 100,
        completedAt: new Date(),
        totalTimeSpent: 180, // 3 hours
        certificates: []
      }
    }
  }
)

# Test
GET /api/certificates

# Expected
{
  "certificates": [
    {
      "id": "course-COURSE_ID",
      "title": "Introduction to Python - Completion Certificate",
      "description": "Successfully completed the course...",
      "type": "course_completion",
      "metadata": {
        "courseId": "COURSE_ID",
        "courseName": "Introduction to Python",
        "category": "Programming",
        "totalTimeSpent": 180
      }
    }
  ]
}
```

**Expected Results**:
- ✅ Course certificates appear
- ✅ Metadata includes course details
- ✅ Sorted by issue date (newest first)

---

### Test 3: Invoice Download

**Endpoint**: Frontend - `/payments/history`

#### Test 3.1: Stripe Hosted Receipt
```bash
# Setup
1. Login as any user with subscription
2. Navigate to /payments/history

# Test
1. Click "Download" button on any payment
2. Verify Stripe receipt URL opens in new tab

# Manual verification
- New tab opens with Stripe-hosted receipt
- Receipt shows correct amount, date, description
- No error alerts
```

**Expected Results**:
- ✅ `window.open(payment.receiptUrl, '_blank')` called
- ✅ Stripe receipt page loads
- ✅ No "coming soon" alert

#### Test 3.2: Fallback for Missing Receipt
```bash
# Test with payment without receiptUrl
# Expected: Alert "Receipt not available..."
```

---

### Test 4: Review Notifications to Tutors

**Endpoint**: `POST /api/reviews`

#### Test 4.1: Submit Review
```bash
# Setup
1. Login as student@example.com
2. Complete a session with tutor@example.com

# Submit review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Cookie: token=STUDENT_JWT" \
  -d '{
    "tutorId": "TUTOR_ID",
    "sessionId": "SESSION_ID",
    "rating": 5,
    "comment": "Excellent tutor! Very helpful and patient.",
    "categories": {
      "communication": 5,
      "punctuality": 5,
      "knowledge": 5,
      "helpfulness": 5
    }
  }'

# Expected response
{
  "success": true,
  "review": { ... }
}
```

**Expected Results**:
- ✅ Review created in database
- ✅ Announcement notification created for tutor
- ✅ Tutor's `stats.averageRating` updated
- ✅ Tutor's `stats.totalReviews` incremented
- ✅ Tutor's `stats.categoryRatings` recalculated

#### Test 4.2: Verify Tutor Notification
```bash
# Login as tutor@example.com
GET /api/notifications

# Expected
{
  "notifications": [
    {
      "title": "New Review Received ⭐",
      "message": "Student Name left you a 5-star review",
      "shortMessage": "5⭐ from Student Name",
      "type": "general",
      "priority": "normal",
      "actionButton": {
        "text": "View Review",
        "url": "/dashboard/tutor/reviews"
      }
    }
  ]
}
```

#### Test 4.3: Verify Rating Aggregation
```bash
# Check tutor's updated stats
db.users.findOne(
  { email: "tutor@example.com" },
  { stats: 1 }
)

# Expected
{
  "stats": {
    "averageRating": 4.85,
    "totalReviews": 12,
    "categoryRatings": {
      "communication": 4.9,
      "punctuality": 4.7,
      "knowledge": 4.95,
      "helpfulness": 4.85
    }
  }
}
```

**Expected Results**:
- ✅ Low rating (1-3 stars) → priority: "high"
- ✅ Good rating (4-5 stars) → priority: "normal"
- ✅ Ratings recalculated correctly

---

### Test 5: Message Notifications

**Endpoint**: `POST /api/messages`

#### Test 5.1: Send Message
```bash
# Setup
1. Login as student@example.com
2. Start conversation with tutor@example.com

# Send message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: token=STUDENT_JWT" \
  -d '{
    "receiverId": "TUTOR_ID",
    "content": "Hi! I have a question about today's homework."
  }'

# Expected response
{
  "success": true,
  "message": {
    "sender": { "name": "Student Name", "role": "student" },
    "receiver": { "name": "Tutor Name", "role": "tutor" },
    "content": "Hi! I have a question...",
    "createdAt": "..."
  }
}
```

**Expected Results**:
- ✅ Message created
- ✅ Conversation updated with lastMessage
- ✅ unreadCount incremented for receiver

#### Test 5.2: Verify In-App Notification
```bash
# Login as tutor@example.com
GET /api/notifications

# Expected
{
  "notifications": [
    {
      "title": "New Message 💬",
      "message": "Student Name sent you a message",
      "shortMessage": "Hi! I have a question about today's homework.",
      "actionButton": {
        "text": "View Message",
        "url": "/dashboard/tutor/messages?conversation=CONVERSATION_ID"
      }
    }
  ]
}
```

#### Test 5.3: Verify Email Notification
```bash
# Check email service logs
# Expected email sent to tutor@example.com

# Email should contain:
- Subject: "💬 New message from Student Name"
- Message preview (first 100 chars)
- "View Message" button linking to conversation
```

**Expected Results**:
- ✅ Email sent asynchronously (doesn't block API response)
- ✅ Email template uses proper formatting
- ✅ Link directs to correct conversation

---

### Test 6: Meeting Cancellation Emails

**Endpoint**: `DELETE /api/meetings/[id]`

#### Test 6.1: Cancel Meeting as Parent
```bash
# Setup
1. Login as parent@example.com
2. Schedule a progress meeting with tutor
3. Note the meeting ID

# Cancel meeting
curl -X DELETE http://localhost:3000/api/meetings/MEETING_ID \
  -H "Cookie: token=PARENT_JWT"

# Expected response
{
  "success": true,
  "message": "Meeting cancelled successfully"
}
```

**Expected Results**:
- ✅ Meeting status: `scheduled` → `cancelled`
- ✅ Meeting populated with tutor, parent, student details
- ✅ 2 emails sent (parent + tutor)
- ✅ Zoom meeting deleted (if exists)

#### Test 6.2: Verify Cancellation Emails
```bash
# Check email logs for both emails

# Email to parent@example.com
Subject: "❌ Progress Meeting Cancelled - Monday, 3 February 2026"
- Recipient type: parent
- Cancelled by: Parent
- Meeting details shown
- "Schedule New Meeting" button included

# Email to tutor@example.com
Subject: "❌ Progress Meeting Cancelled - Monday, 3 February 2026"
- Recipient type: tutor
- Cancelled by: Parent
- Meeting details shown
- No action button (tutor can't reschedule)
```

**Expected Results**:
- ✅ Both emails sent in parallel
- ✅ Proper date/time formatting (UK format)
- ✅ Correct cancelled by info
- ✅ Professional HTML template

#### Test 6.3: Verify Zoom Cleanup
```bash
# If meeting had zoomMeetingId
# Check Zoom API logs

# Expected
- ZoomService.deleteMeeting(meetingId) called
- Zoom meeting deleted (or error logged if fails)
- Meeting deletion doesn't block response
```

---

## 🧪 Integration Tests

### End-to-End Flow Tests

#### Flow 1: Complete Learning Journey
```bash
1. Student books session → Session created
2. Tutor starts Zoom meeting → Webhook updates status to 'in_progress'
3. Meeting ends → Webhook updates to 'completed'
4. Recording ready → Webhook saves recording to VideoRecord
5. Student leaves review → Tutor gets notification
6. Tutor responds via message → Student gets notification + email
7. Student reaches 10 sessions → Certificate generated
8. Student downloads invoice → Stripe receipt opens
```

#### Flow 2: Parent-Tutor Communication
```bash
1. Parent schedules progress meeting → Meeting created + Zoom meeting
2. Parent cancels meeting → Emails sent + Zoom deleted
3. Tutor messages parent → Parent gets notification + email
4. Parent views child's certificates → Course + session certificates shown
```

---

## ✅ Test Checklist

### Phase 1 Features
- [ ] Zoom webhook - meeting.started updates database
- [ ] Zoom webhook - meeting.ended updates database
- [ ] Zoom webhook - recording.completed saves VideoRecord
- [ ] Course completion certificates generated
- [ ] Session milestone certificates (10, 25, 50)
- [ ] Invoice download with Stripe receipts
- [ ] Fallback alert for missing receipts

### Phase 2 Features
- [ ] Review notification created for tutor
- [ ] Tutor rating aggregation works
- [ ] Category ratings calculated correctly
- [ ] Message notification (in-app) created
- [ ] Message email sent to recipient
- [ ] Meeting cancellation emails sent to both parties
- [ ] Zoom meeting cleanup on cancellation

### Database Integrity
- [ ] User.stats field populated correctly
- [ ] VideoRecord documents created properly
- [ ] Session status transitions valid
- [ ] Announcement notifications linked correctly
- [ ] No orphaned records

### Error Handling
- [ ] Invalid Zoom webhook signature rejected
- [ ] Missing user returns 401
- [ ] Invalid meeting ID returns 404
- [ ] Permission denied returns 403
- [ ] Email failures logged but don't block responses

### Performance
- [ ] Email sending is asynchronous
- [ ] Zoom cleanup doesn't block
- [ ] Database queries optimized
- [ ] No N+1 query issues

---

## 🐛 Known Issues / Edge Cases

### Edge Case 1: Course Deleted After Completion
- Certificate handles missing course: `if (!p.course) return;`
- ✅ Skips deleted courses gracefully

### Edge Case 2: Zoom Meeting Without Session
- Webhook logs but doesn't fail
- ✅ No error thrown

### Edge Case 3: Email Service Down
- Error logged: "Failed to send message email"
- ✅ API response still succeeds
- ✅ In-app notification still created

### Edge Case 4: First Review for Tutor
- Division by zero avoided
- ✅ Properly initializes stats

---

## 📊 Test Results Template

```markdown
## Test Results - [Date]

### Phase 1 Tests
| Feature | Status | Notes |
|---------|--------|-------|
| Zoom - meeting.started | ✅ | Status updated correctly |
| Zoom - meeting.ended | ✅ | Timestamp saved |
| Zoom - recording | ✅ | 2 recordings saved |
| Course certificates | ✅ | Metadata populated |
| Session certificates | ✅ | All 3 milestones work |
| Invoice download | ✅ | Stripe receipt opens |

### Phase 2 Tests
| Feature | Status | Notes |
|---------|--------|-------|
| Review notification | ✅ | Tutor notified |
| Rating aggregation | ✅ | Math correct |
| Message notification | ✅ | In-app + email |
| Cancellation emails | ✅ | Both parties received |
| Zoom cleanup | ✅ | Meeting deleted |

### Issues Found
- None

### Performance
- Average API response: 150ms
- Email delivery: ~2s (async)
- Zoom webhook processing: <100ms
```

---

## 🚀 Next Steps After Testing

1. **If tests pass**:
   - Mark Phase 1 & 2 as complete ✅
   - Move to Phase 3 (Tutor Availability)
   - Deploy to staging

2. **If tests fail**:
   - Document failing tests
   - Fix issues
   - Re-run affected tests
   - Update implementation

3. **Production checklist**:
   - Update Zoom webhook URL in Zoom dashboard
   - Verify email templates in production
   - Test with real Stripe payments
   - Monitor error logs

---

**Testing Status**: Ready to test  
**Last Updated**: February 3, 2026  
**Next Review**: After Phase 3 implementation
