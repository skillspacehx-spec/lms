import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User document interface with methods
interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'parent' | 'tutor' | 'admin';
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  isVerified: boolean;
  subscription?: mongoose.Types.ObjectId;
  bio?: string;
  subjects?: string[];
  hourlyRate?: number;
  experience?: number;
  qualifications?: string[];
  subscriptionStatus?: string;
  stripeCustomerId?: string;
  subscriptionId?: mongoose.Types.ObjectId;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  calendarConnected?: boolean;
  calendarConnectedAt?: Date;
  availability?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  zoomUserId?: string;
  progress?: Array<{
    course: mongoose.Types.ObjectId;
    completedContent: mongoose.Types.ObjectId[];
    lastAccessed: Date;
    totalTimeSpent: number;
    completionPercentage: number;
    startedAt: Date;
    completedAt?: Date;
    certificates: string[];
  }>;
  children?: mongoose.Types.ObjectId[];
  preferences?: {
    subjects?: string[];
    learningGoals?: string;
    preferredSchedule?: string;
  };
  onboardingCompleted?: boolean;
  stats?: {
    averageRating?: number;
    totalReviews?: number;
    categoryRatings?: {
      communication: number;
      punctuality: number;
      knowledge: number;
      helpfulness: number;
    };
  };
  blockedUsers?: mongoose.Types.ObjectId[];
  blockedBy?: mongoose.Types.ObjectId[];
  editHistory?: Array<{
    content: string;
    rating: number;
    categories: any;
    editedAt: Date;
  }>;
  editedAt?: Date;
}

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

// User Schema
const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'parent', 'tutor', 'admin'],
    default: 'student'
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  verificationExpires: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  // For tutors
  bio: {
    type: String,
    default: ''
  },
  subjects: [{
    type: String
  }],
  hourlyRate: {
    type: Number,
    default: 0
  },
  experience: {
    type: Number,
    default: 0
  },
  qualifications: [{
    type: String
  }],
  
  // Subscription & Payment
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'trialing', 'past_due'],
    default: 'inactive'
  },
  stripeCustomerId: String,
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  
  // Calendar integration (for tutors)
  googleAccessToken: String,
  googleRefreshToken: String,
  calendarConnected: {
    type: Boolean,
    default: false
  },
  calendarConnectedAt: Date,
  
  // Tutor availability (weekly schedule)
  availability: {
    type: [{
      day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      startTime: {
        type: String,
        required: true,
        validate: {
          validator: function(v: string) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: (props: any) => `${props.value} is not a valid time format (HH:MM)!`
        }
      },
      endTime: {
        type: String,
        required: true,
        validate: {
          validator: function(v: string) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: (props: any) => `${props.value} is not a valid time format (HH:MM)!`
        }
      }
    }],
    default: []
  },
  
  // Zoom integration (for tutors)
  zoomUserId: {
    type: String,
    default: null
  },

  // Learning progress tracking
  progress: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    completedContent: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseContent'
    }],
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    totalTimeSpent: {
      type: Number,
      default: 0 // in minutes
    },
    completionPercentage: {
      type: Number,
      default: 0
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    certificates: [String]
  }],

  // For parents
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Onboarding preferences
  preferences: {
    subjects: [String],
    learningGoals: String,
    preferredSchedule: String
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  
  // Tutor statistics (for review system)
  stats: {
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    categoryRatings: {
      communication: { type: Number, default: 0 },
      punctuality: { type: Number, default: 0 },
      knowledge: { type: Number, default: 0 },
      helpfulness: { type: Number, default: 0 }
    }
  },
  
  // Blocking and reporting
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Course Category Schema
const courseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  subcategories: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Course Schema
const courseSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseCategory',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['live_session', 'recorded', 'lms_course', 'resource']
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  thumbnail: {
    type: String,
    default: ''
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all'
  },
  language: {
    type: String,
    default: 'English'
  },
  prerequisites: [String],
  learningOutcomes: [String],
  tags: [String],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  maxStudents: {
    type: Number,
    default: null // null for unlimited
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Note: Course content/modules are stored in separate CourseContent collection
  // Use CourseContent.find({ course: courseId }) to get modules
}, {
  timestamps: true
});

// Live Class Schedule Schema
const liveClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  subject: {
    type: String,
    default: 'General'
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60
  },
  maxStudents: {
    type: Number,
    default: 30
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date
  }],
  zoomMeetingId: {
    type: String,
    default: null
  },
  zoomJoinUrl: {
    type: String,
    default: null
  },
  zoomStartUrl: {
    type: String,
    default: null
  },
  recordingUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  isRecorded: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  recurringDays: [Number],
  recurringEndDate: Date,
  zoomMeetingPassword: String,
  notes: String
}, {
  timestamps: true
});

// Enhanced Announcement Schema
const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  shortMessage: {
    type: String,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['class_scheduled', 'class_reminder', 'general', 'system', 'promotion', 'maintenance', 'feature_update'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'parents', 'tutors', 'subscribers', 'specific_users'],
    default: 'all'
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  targetSubscriptionPlans: [String],
  relatedClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveClass'
  },
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  media: {
    imageUrl: String,
    imageCloudinaryId: String,
    videoUrl: String,
    videoCloudinaryId: String
  },
  actionButton: {
    text: String,
    url: String,
    type: { type: String, enum: ['link', 'internal', 'action'] }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: null
  },
  publishAt: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  clickCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    required: true,
    enum: ['basic', 'premium', 'family']
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  stripePriceId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'past_due', 'unpaid'],
    required: true
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Session/Booking Schema
const sessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  liveClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveClass'
  },
  type: {
    type: String,
    enum: ['one_on_one', 'group_class'],
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  zoomMeetingId: {
    type: String
  },
  zoomJoinUrl: {
    type: String
  },
  recordingUrl: {
    type: String
  },
  notes: {
    type: String,
    default: ''
  },
  rating: {
    student: Number,
    tutor: Number
  },
  feedback: {
    student: String,
    tutor: String
  }
}, {
  timestamps: true
});

// Course Content Schema (for detailed course modules)
const courseContentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'document', 'quiz', 'assignment', 'live_session'],
    required: true
  },
  content: {
    videoUrl: String,
    videoCloudinaryId: String,
    videoDuration: Number, // in seconds
    videoThumbnail: String,
    documentUrl: String,
    documentCloudinaryId: String,
    quizQuestions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      points: { type: Number, default: 1 }
    }],
    assignmentInstructions: String,
    assignmentDeadline: Date
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  accessLevel: {
    type: String,
    enum: ['free', 'premium', 'enrolled_only'],
    default: 'enrolled_only'
  }
}, {
  timestamps: true
});

// Video Records Schema
const videoRecordSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  originalFileName: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true,
    unique: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  fileSize: {
    type: Number, // in bytes
    default: 0
  },
  format: {
    type: String,
    default: 'mp4'
  },
  quality: {
    type: String,
    enum: ['1080p', '720p', '480p', '360p'],
    default: '720p'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  liveClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveClass'
  },
  courseContent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseContent'
  },
  tags: [String],
  isProcessed: {
    type: Boolean,
    default: false
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  accessLevel: {
    type: String,
    enum: ['public', 'enrolled_only', 'premium', 'private'],
    default: 'enrolled_only'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  downloadAllowed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Subscription Plans Schema
const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  stripePriceId: {
    type: String,
    required: true,
    unique: true
  },
  stripeProductId: {
    type: String,
    required: true
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true,
      default: 'GBP'
    },
    interval: {
      type: String,
      enum: ['month', 'year'],
      required: true
    }
  },
  features: [{
    name: String,
    description: String,
    included: { type: Boolean, default: true },
    limit: Number // null for unlimited
  }],
  limits: {
    liveSessions: { type: Number, default: null }, // null for unlimited
    coursesAccess: { type: Number, default: null },
    storageSpace: { type: Number, default: null }, // in MB
    recordingDownloads: { type: Number, default: null },
    supportLevel: {
      type: String,
      enum: ['basic', 'priority', 'premium'],
      default: 'basic'
    },
    // Progress meeting quotas
    progressMeetingsPerMonth: { type: Number, default: 0 }, // 0 for none, -1 for unlimited
    progressMeetingDuration: { type: Number, default: 30 }, // in minutes
    canScheduleRecurring: { type: Boolean, default: false }
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  trialDays: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Downloadable Resource Schema (for parent resources, guides, worksheets)
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

// Progress Meeting Schema (Parent-Tutor Meetings)
const progressMeetingSchema = new mongoose.Schema({
  // Participants
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Meeting details
  meetingType: {
    type: String,
    enum: ['progress_review', 'goal_setting', 'concerns', 'general'],
    default: 'progress_review'
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 30
  },
  
  // Meeting platform
  zoomMeetingId: {
    type: String
  },
  zoomJoinUrl: {
    type: String
  },
  zoomStartUrl: {
    type: String
  },
  recordingUrl: {
    type: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  
  // Agenda and notes
  agenda: [{
    item: String,
    completed: { type: Boolean, default: false }
  }],
  parentNotes: {
    type: String,
    default: ''
  },
  tutorNotes: {
    type: String,
    default: ''
  },
  
  // Progress report
  progressReport: {
    strengths: [String],
    areasForImprovement: [String],
    achievements: [String],
    recommendedGoals: [String],
    homeworkCompletion: Number, // percentage
    classParticipation: Number, // 1-5 rating
    overallProgress: Number, // 1-5 rating
    parentFeedback: String,
    nextSteps: [String]
  },
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  nextMeetingDate: Date,
  
  // Auto-scheduling for recurring meetings
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'none'],
    default: 'none'
  },
  
  // Ratings
  parentRating: {
    type: Number,
    min: 1,
    max: 5
  },
  tutorRating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Message Schema (For student-tutor messaging)
const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  attachments: [{
    url: String,
    cloudinaryId: String,
    type: String, // 'image', 'document', 'video'
    fileName: String,
    fileSize: Number,
    mimeType: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  deliveredAt: {
    type: Date,
    default: Date.now
  },
  editedAt: Date,
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isReported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Conversation Schema (Groups messages between two users)
const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isArchived: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  isMuted: {
    type: Map,
    of: Boolean,
    default: new Map()
  }
}, {
  timestamps: true
});

// Index for faster conversation lookup
conversationSchema.index({ participants: 1 });

// Review Schema (Student reviews for tutors)
const reviewSchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  categories: {
    communication: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    knowledge: { type: Number, min: 1, max: 5 },
    helpfulness: { type: Number, min: 1, max: 5 }
  },
  isVerified: {
    type: Boolean,
    default: true // True if from actual session
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  moderationStatus: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved'
  },
  moderationFlags: {
    containsProfanity: Boolean,
    detectedAt: Date,
    reason: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  },
  tutorResponse: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tutorResponseDate: Date,
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['helpful', 'not_helpful']
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster tutor review lookup
reviewSchema.index({ tutor: 1, createdAt: -1 });
reviewSchema.index({ student: 1, createdAt: -1 });

// Export models
export const User = mongoose.models.User as UserModel || mongoose.model<IUser, UserModel>('User', userSchema);
export const CourseCategory = mongoose.models.CourseCategory || mongoose.model('CourseCategory', courseCategorySchema);
export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export const CourseContent = mongoose.models.CourseContent || mongoose.model('CourseContent', courseContentSchema);
export const VideoRecord = mongoose.models.VideoRecord || mongoose.model('VideoRecord', videoRecordSchema);
export const SubscriptionPlan = mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
export const LiveClass = mongoose.models.LiveClass || mongoose.model('LiveClass', liveClassSchema);
export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
export const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
export const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
export const ProgressMeeting = mongoose.models.ProgressMeeting || mongoose.model('ProgressMeeting', progressMeetingSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);