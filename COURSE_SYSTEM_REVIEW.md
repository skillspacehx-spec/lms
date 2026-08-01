# 📚 Course System - Complete Review & Implementation Plan

## 🔍 Current Schema Analysis

### 1. **Course Schema** (`courseSchema`)
```typescript
Course {
  // Basic Info
  title: String (required)
  description: String (required)
  category: ObjectId → CourseCategory (required)
  instructor: ObjectId → User (required)
  type: 'live_session' | 'recorded' | 'lms_course' | 'resource'
  
  // Pricing & Access
  price: Number (default: 0)
  duration: Number (in minutes, required)
  level: 'beginner' | 'intermediate' | 'advanced' | 'all'
  
  // Media
  thumbnail: String (Cloudinary URL)
  
  // Enrollment
  maxStudents: Number (null = unlimited)
  enrolledStudents: [ObjectId] → User[]
  
  // Status & Features
  isActive: Boolean (default: true) ✓ Already exists!
  isFeatured: Boolean (default: false)
  
  // Course Content
  prerequisites: [String]
  learningOutcomes: [String]
  tags: [String]
  
  // Ratings
  rating: {
    average: Number
    count: Number
  }
  
  timestamps: true
}
```

### 2. **CourseContent Schema** (Modules/Lessons)
```typescript
CourseContent {
  course: ObjectId → Course (required)
  
  // Module Info
  title: String (required)
  description: String (required)
  type: 'video' | 'document' | 'quiz' | 'assignment' | 'live_session'
  order: Number (required, default: 0)
  
  // Access Control
  isPreview: Boolean (default: false) ← FREE PREVIEW!
  isActive: Boolean (default: true) ← CAN LOCK/UNLOCK!
  accessLevel: 'free' | 'premium' | 'enrolled_only' ← WHO CAN ACCESS!
  
  // Content Data
  content: {
    // Video Content
    videoUrl: String (Cloudinary URL)
    videoCloudinaryId: String
    videoDuration: Number (seconds)
    videoThumbnail: String (Cloudinary URL)
    
    // Document Content
    documentUrl: String (Cloudinary URL)
    documentCloudinaryId: String
    
    // Quiz Content
    quizQuestions: [{
      question: String
      options: [String]
      correctAnswer: Number
      points: Number
    }]
    
    // Assignment Content
    assignmentInstructions: String
    assignmentDeadline: Date
  }
  
  timestamps: true
}
```

---

## ✅ What Already Exists

### 1. **Course APIs**
- ✅ `GET /api/courses` - List all courses (with `isActive: true` filter)
- ✅ `POST /api/courses` - Create course (tutors & admins only)
- ✅ `GET /api/courses/[id]` - Get course details with modules
- ❌ `PUT /api/courses/[id]` - Update course (MISSING)
- ❌ `DELETE /api/courses/[id]` - Delete course (MISSING)
- ❌ `PATCH /api/courses/[id]/status` - Toggle active/inactive (MISSING)

### 2. **Upload APIs**
- ✅ `POST /api/upload/video` - Upload videos to Cloudinary
- ✅ `DELETE /api/upload/video` - Delete videos from Cloudinary
- ✅ `POST /api/upload/document` - Upload documents
- ✅ `POST /api/upload/profile-image` - Upload images

### 3. **Cloudinary Integration**
- ✅ MediaService class with methods:
  - `uploadImage()` - Upload & optimize images
  - `uploadVideo()` - Upload & optimize videos (auto-convert to MP4)
  - `uploadDocument()` - Upload PDFs, documents
  - `deleteFile()` - Delete from Cloudinary
  - `generateVideoThumbnail()` - Auto-generate thumbnails at 5s
  - `getOptimizedVideoUrl()` - Get CDN-optimized URLs

---

## 🚀 What Needs to Be Created

### 1. **Admin Course Management API**
Create: `/api/admin/courses/`

**Required Endpoints:**
```
GET    /api/admin/courses              - List ALL courses (active + inactive)
POST   /api/admin/courses              - Create course
PUT    /api/admin/courses/[id]         - Update course
DELETE /api/admin/courses/[id]         - Delete course
PATCH  /api/admin/courses/[id]/toggle  - Toggle isActive (activate/deactivate)
```

### 2. **Admin Course Content Management**
Create: `/api/admin/courses/[id]/content/`

**Required Endpoints:**
```
GET    /api/admin/courses/[id]/content              - List all modules
POST   /api/admin/courses/[id]/content              - Add module/lesson
PUT    /api/admin/courses/[id]/content/[contentId]  - Update module
DELETE /api/admin/courses/[id]/content/[contentId]  - Delete module
PATCH  /api/admin/courses/[id]/content/[contentId]/toggle  - Toggle active/inactive
PATCH  /api/admin/courses/[id]/content/reorder      - Reorder modules
```

### 3. **Admin Dashboard Course Page**
Create: `/dashboard/admin/courses/page.tsx`

**Features:**
- List all courses (active + inactive)
- Filter: All / Active / Inactive
- Search by title/instructor
- Stats: Total, Active, Inactive, Revenue
- Actions:
  - ✏️ Edit course
  - 🗑️ Delete course
  - 👁️ Toggle Active/Inactive
  - ➕ Create new course
  - 📊 View analytics

### 4. **Course Create/Edit Page**
Create: `/dashboard/admin/courses/create/page.tsx`
Create: `/dashboard/admin/courses/[id]/edit/page.tsx`

**Features:**
- **Basic Info:**
  - Title, Description
  - Category dropdown
  - Course type
  - Instructor (for admin, can assign to any tutor)
  - Thumbnail upload (Cloudinary)

- **Pricing & Access:**
  - Price input (£)
  - Duration (hours/minutes)
  - Level selection
  - Max students (optional)
  - Featured toggle

- **Course Modules:**
  - Add/Edit/Delete modules
  - Drag-drop reorder
  - For each module:
    - Title, Description
    - Type: Video / Document / Quiz / Assignment
    - Upload video/document (Cloudinary)
    - Access level: Free / Premium / Enrolled Only
    - Preview toggle (free for all to see)
    - Active/Inactive toggle

- **Preview:**
  - Show how course looks to students
  - Free content preview
  - Locked content indication

---

## 💰 Course Pricing & Access Levels

### **Recommended Structure:**

#### **Course-Level Pricing:**
```typescript
Course {
  price: 0     → FREE course (all content accessible after enrollment)
  price: 25    → £25 course (one-time payment)
  price: 99    → £99 premium course
}
```

#### **Module-Level Access:**
```typescript
CourseContent {
  // Option 1: Free Preview
  accessLevel: 'free'
  isPreview: true
  → Available to everyone (not enrolled)
  → Usually first 1-2 lessons
  
  // Option 2: Enrolled Only
  accessLevel: 'enrolled_only'
  isPreview: false
  → Must enroll in course (pay price)
  → Majority of content
  
  // Option 3: Premium
  accessLevel: 'premium'
  isPreview: false
  → Requires active subscription (Basic/Premium/Family)
  → Bonus content for subscribers
  
  // Option 4: Locked
  isActive: false
  → Module exists but not accessible yet
  → "Coming soon" content
}
```

### **Example Course Structure:**

**"Complete Python Programming" - £49**
```
Module 1: Introduction (FREE PREVIEW)
├─ Video: "What is Python?" (5 min) → accessLevel: 'free', isPreview: true
├─ Video: "Installing Python" (8 min) → accessLevel: 'free', isPreview: true
└─ Document: "Setup Guide.pdf" → accessLevel: 'free'

Module 2: Python Basics (LOCKED - Need to Enroll)
├─ Video: "Variables & Data Types" (15 min) → accessLevel: 'enrolled_only'
├─ Video: "Operators" (12 min) → accessLevel: 'enrolled_only'
├─ Quiz: "Basics Quiz" → accessLevel: 'enrolled_only'
└─ Assignment: "First Program" → accessLevel: 'enrolled_only'

Module 3: Functions (LOCKED - Need to Enroll)
├─ Video: "Defining Functions" (20 min) → accessLevel: 'enrolled_only'
├─ Video: "Parameters & Return" (18 min) → accessLevel: 'enrolled_only'
└─ Document: "Function Reference.pdf" → accessLevel: 'enrolled_only'

Module 4: Advanced Topics (PREMIUM - Requires Subscription)
├─ Video: "Decorators" (25 min) → accessLevel: 'premium'
├─ Video: "Generators" (22 min) → accessLevel: 'premium'
└─ Document: "Advanced Patterns.pdf" → accessLevel: 'premium'

Module 5: Bonus Content (COMING SOON)
├─ Video: "Django Framework" → isActive: false
└─ Video: "Flask Basics" → isActive: false
```

**Access Logic:**
- **Not Enrolled + Not Subscribed**: See only Module 1 (free preview)
- **Enrolled (Paid £49) + Not Subscribed**: Modules 1, 2, 3 accessible
- **Enrolled + Subscribed (Premium)**: All modules 1-4 accessible
- **Module 5**: Hidden for everyone until admin activates

---

## 📊 Admin Course Management UI Mockup

### **Course List View:**
```
┌──────────────────────────────────────────────────────────────┐
│ Admin Dashboard > Courses                      [+ New Course] │
├──────────────────────────────────────────────────────────────┤
│ Search: [______________]  Filter: [All ▼] [Active] [Inactive]│
├──────────────────────────────────────────────────────────────┤
│ 📊 Stats                                                      │
│ ┌──────────┬──────────┬──────────┬──────────┐                │
│ │  Total   │  Active  │ Inactive │ Revenue  │                │
│ │    24    │    18    │     6    │  £4,580  │                │
│ └──────────┴──────────┴──────────┴──────────┘                │
├──────────────────────────────────────────────────────────────┤
│ Courses List:                                                 │
│                                                               │
│ [🖼️ Thumbnail] Complete Python Programming       [Active ✓]  │
│               By: John Doe | £49 | 45 students                │
│               8 modules | 12 hours                            │
│               [✏️ Edit] [👁️ Deactivate] [🗑️ Delete]          │
│               ─────────────────────────────────────           │
│                                                               │
│ [🖼️ Thumbnail] Advanced JavaScript              [Inactive ✗] │
│               By: Jane Smith | £79 | 23 students              │
│               12 modules | 20 hours                           │
│               [✏️ Edit] [👁️ Activate] [🗑️ Delete]            │
│               ─────────────────────────────────────           │
└──────────────────────────────────────────────────────────────┘
```

### **Course Create/Edit View:**
```
┌──────────────────────────────────────────────────────────────┐
│ Create New Course                                 [Save Draft]│
│                                            [Publish Course] │
├──────────────────────────────────────────────────────────────┤
│ 📝 Basic Information                                          │
│ Title: [_____________________________]                        │
│ Description: [_______________________________________]        │
│ Category: [Programming ▼]  Type: [LMS Course ▼]              │
│ Instructor: [John Doe ▼]   Level: [Intermediate ▼]           │
│                                                               │
│ Thumbnail: [📤 Upload Image] [🖼️ preview.jpg]                 │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│ 💰 Pricing & Settings                                         │
│ Price: £ [___] Duration: [__] hours [__] minutes              │
│ Max Students: [___] (leave empty for unlimited)              │
│ [✓] Featured Course  [✓] Active                              │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│ 📚 Course Modules                          [+ Add Module]     │
│                                                               │
│ ⋮ Module 1: Introduction (FREE PREVIEW)      [Edit] [Delete] │
│   │  Video: What is Python? (5 min)                          │
│   │  Video: Installing Python (8 min)                        │
│   └─ Document: Setup Guide.pdf                               │
│                                                               │
│ ⋮ Module 2: Python Basics                    [Edit] [Delete] │
│   │  🔒 Video: Variables (15 min)                             │
│   │  🔒 Video: Operators (12 min)                             │
│   └─ 🔒 Quiz: Basics Quiz                                     │
│                                                               │
│ ⋮ Module 3: Advanced  [INACTIVE]             [Edit] [Delete] │
│   └─ 🔒 [Coming Soon]                                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### **Module Add/Edit Modal:**
```
┌──────────────────────────────────────┐
│ Add Module                      [✕]  │
├──────────────────────────────────────┤
│ Title: [_____________________]       │
│ Description: [__________________]    │
│ Order: [__]                          │
│                                      │
│ Type: [Video ▼]                      │
│                                      │
│ 🎥 Upload Video:                     │
│ [📤 Choose File] [video.mp4]         │
│ or YouTube URL: [________________]   │
│                                      │
│ Access Level:                        │
│ ○ Free (Preview - anyone can view)  │
│ ● Enrolled Only (after purchase)    │
│ ○ Premium (requires subscription)   │
│                                      │
│ [✓] Active  [ ] Preview              │
│                                      │
│         [Cancel] [Save Module]       │
└──────────────────────────────────────┘
```

---

## 🎯 Implementation Priority

### **Phase 1: Core Admin Course CRUD** (High Priority)
1. Create `/api/admin/courses/route.ts` - List/Create
2. Create `/api/admin/courses/[id]/route.ts` - Get/Update/Delete
3. Create `/api/admin/courses/[id]/toggle/route.ts` - Activate/Deactivate
4. Create `/dashboard/admin/courses/page.tsx` - Course list UI

### **Phase 2: Course Content Management** (High Priority)
5. Create `/api/admin/courses/[id]/content/route.ts` - Module CRUD
6. Create `/api/admin/courses/[id]/content/[contentId]/route.ts` - Single module
7. Update course edit page with module management

### **Phase 3: Media Upload Integration** (Medium Priority)
8. Integrate Cloudinary upload for thumbnails
9. Integrate video upload for modules
10. Integrate document upload
11. Add progress indicators for uploads

### **Phase 4: Access Control & Preview** (Medium Priority)
12. Implement free preview logic
13. Implement enrolled-only logic
14. Implement premium subscription check
15. Add "Coming Soon" locked content UI

### **Phase 5: Student View** (Low Priority - Later)
16. Course detail page showing free preview
17. Locked content indicators
18. Enrollment flow
19. Video player with progress tracking

---

## 🔐 Access Control Matrix

| User Type | Action | Permission |
|-----------|--------|------------|
| Admin | Create course | ✅ Yes |
| Admin | Edit any course | ✅ Yes |
| Admin | Delete any course | ✅ Yes |
| Admin | Toggle active/inactive | ✅ Yes |
| Admin | Add/edit modules | ✅ Yes |
| Tutor | Create own course | ✅ Yes |
| Tutor | Edit own course | ✅ Yes |
| Tutor | Delete own course | ✅ Yes (if no enrollments) |
| Tutor | Edit other's course | ❌ No |
| Student | View active courses | ✅ Yes |
| Student | View free preview | ✅ Yes |
| Student | View enrolled content | ✅ Yes (if enrolled) |
| Student | Edit course | ❌ No |
| Not logged in | View active courses | ✅ Yes |
| Not logged in | View free preview | ✅ Yes |

---

## 📝 Next Steps

**Ready to implement?** I can now create:

1. ✅ **Review complete** - This document
2. 🚀 **Create admin course management APIs**
3. 🎨 **Build admin course dashboard UI**
4. 📤 **Integrate Cloudinary uploads**
5. 🔒 **Implement access control logic**
6. 🎥 **Build course content viewer for students**

**Let me know which phase to start with!**

Recommended: Start with **Phase 1 (Core Admin CRUD)** to get the foundation in place.
