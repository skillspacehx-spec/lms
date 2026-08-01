// Central data store for the LMS application
export interface Language {
  id: string;
  name: string;
  flag: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Hobby {
  id: string;
  name: string;
  category: string;
}

export interface Subject {
  id: string;
  name: string;
  category: string;
  level: string[];
  description: string;
}

export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  subjects: string[];
  languages: string[];
  rating: number;
  reviews: number;
  hourlyRate: number;
  experience: number;
  education: string;
  description: string;
  availability: {
    day: string;
    slots: string[];
  }[];
  teachingStyle: string;
  specializations: string[];
  location: string;
  verified: boolean;
  responseTime: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'parent' | 'tutor';
  avatar?: string;
  preferences?: {
    languages: string[];
    goals: string[];
    hobbies: string[];
    subjects: string[];
  };
  children?: Child[];
}

export interface Child {
  id: string;
  name: string;
  age: number;
  gradeLevel: string;
  subjects: string[];
  learningStyle: string;
  specialNeeds?: string;
  goals: string[];
}

// Languages available
export const languages: Language[] = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'es', name: 'Spanish', flag: '🇪🇸' },
  { id: 'fr', name: 'French', flag: '🇫🇷' },
  { id: 'de', name: 'German', flag: '🇩🇪' },
  { id: 'it', name: 'Italian', flag: '🇮🇹' },
  { id: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { id: 'ru', name: 'Russian', flag: '🇷🇺' },
  { id: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { id: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { id: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

// Learning goals
export const goals: Goal[] = [
  {
    id: 'career',
    title: 'Career and business',
    description: 'Professional development and business skills',
    icon: '💼'
  },
  {
    id: 'kids',
    title: 'Lessons for kids',
    description: 'Age-appropriate learning for children',
    icon: '👶'
  },
  {
    id: 'exams',
    title: 'Exams and course work',
    description: 'Test preparation and academic support',
    icon: '📝'
  },
  {
    id: 'culture',
    title: 'Culture, travel and hobby',
    description: 'Personal interests and cultural learning',
    icon: '🎨'
  },
  {
    id: 'conversation',
    title: 'Conversation practice',
    description: 'Improve speaking and communication skills',
    icon: '💬'
  },
  {
    id: 'homework',
    title: 'Homework help',
    description: 'Daily academic assistance and support',
    icon: '📚'
  }
];

// Hobbies and interests
export const hobbies: Hobby[] = [
  // Arts & Creative
  { id: 'painting', name: 'Painting', category: 'Arts' },
  { id: 'photography', name: 'Photography', category: 'Arts' },
  { id: 'music', name: 'Music', category: 'Arts' },
  { id: 'drawing', name: 'Drawing', category: 'Arts' },
  { id: 'crafts', name: 'Crafts', category: 'Arts' },
  { id: 'writing', name: 'Creative Writing', category: 'Arts' },
  
  // Sports & Fitness
  { id: 'football', name: 'Football', category: 'Sports' },
  { id: 'basketball', name: 'Basketball', category: 'Sports' },
  { id: 'tennis', name: 'Tennis', category: 'Sports' },
  { id: 'swimming', name: 'Swimming', category: 'Sports' },
  { id: 'yoga', name: 'Yoga', category: 'Sports' },
  { id: 'running', name: 'Running', category: 'Sports' },
  
  // Technology
  { id: 'coding', name: 'Programming', category: 'Technology' },
  { id: 'gaming', name: 'Gaming', category: 'Technology' },
  { id: 'robotics', name: 'Robotics', category: 'Technology' },
  { id: 'web-design', name: 'Web Design', category: 'Technology' },
  
  // Science & Nature
  { id: 'astronomy', name: 'Astronomy', category: 'Science' },
  { id: 'gardening', name: 'Gardening', category: 'Nature' },
  { id: 'cooking', name: 'Cooking', category: 'Life Skills' },
  { id: 'reading', name: 'Reading', category: 'Education' },
  { id: 'chess', name: 'Chess', category: 'Games' },
  { id: 'traveling', name: 'Traveling', category: 'Culture' }
];

// Subjects available
export const subjects: Subject[] = [
  // Core Academics
  {
    id: 'mathematics',
    name: 'Mathematics',
    category: 'Core Academic',
    level: ['Primary', 'Secondary', 'A-Level', 'University'],
    description: 'Algebra, geometry, calculus, statistics, and more'
  },
  {
    id: 'english',
    name: 'English Language & Literature',
    category: 'Core Academic',
    level: ['Primary', 'Secondary', 'A-Level', 'University'],
    description: 'Reading, writing, grammar, literature analysis'
  },
  {
    id: 'science',
    name: 'General Science',
    category: 'Core Academic',
    level: ['Primary', 'Secondary'],
    description: 'Basic science concepts and experiments'
  },
  {
    id: 'physics',
    name: 'Physics',
    category: 'Science',
    level: ['Secondary', 'A-Level', 'University'],
    description: 'Mechanics, electricity, quantum physics'
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    category: 'Science',
    level: ['Secondary', 'A-Level', 'University'],
    description: 'Organic, inorganic, analytical chemistry'
  },
  {
    id: 'biology',
    name: 'Biology',
    category: 'Science',
    level: ['Secondary', 'A-Level', 'University'],
    description: 'Life sciences, anatomy, genetics'
  },
  
  // Languages
  {
    id: 'french',
    name: 'French',
    category: 'Languages',
    level: ['Beginner', 'Intermediate', 'Advanced'],
    description: 'Speaking, reading, writing, conversation'
  },
  {
    id: 'spanish',
    name: 'Spanish',
    category: 'Languages',
    level: ['Beginner', 'Intermediate', 'Advanced'],
    description: 'Speaking, reading, writing, conversation'
  },
  {
    id: 'german',
    name: 'German',
    category: 'Languages',
    level: ['Beginner', 'Intermediate', 'Advanced'],
    description: 'Speaking, reading, writing, conversation'
  },
  
  // Computer Science
  {
    id: 'programming',
    name: 'Computer Programming',
    category: 'Technology',
    level: ['Beginner', 'Intermediate', 'Advanced'],
    description: 'Python, JavaScript, Java, C++, web development'
  },
  {
    id: 'web-development',
    name: 'Web Development',
    category: 'Technology',
    level: ['Beginner', 'Intermediate', 'Advanced'],
    description: 'HTML, CSS, JavaScript, React, Node.js'
  },
  
  // Arts & Music
  {
    id: 'music-theory',
    name: 'Music Theory',
    category: 'Arts',
    level: ['Beginner', 'Intermediate', 'Advanced'],
    description: 'Music fundamentals, composition, analysis'
  },
  {
    id: 'piano',
    name: 'Piano',
    category: 'Arts',
    level: ['Beginner', 'Intermediate', 'Advanced'],
    description: 'Classical, contemporary, jazz piano'
  },
  {
    id: 'art-history',
    name: 'Art History',
    category: 'Arts',
    level: ['Secondary', 'A-Level', 'University'],
    description: 'Art movements, famous artists, analysis'
  },
  
  // Test Preparation
  {
    id: 'sat-prep',
    name: 'SAT Preparation',
    category: 'Test Prep',
    level: ['Secondary'],
    description: 'Math, English, essay writing strategies'
  },
  {
    id: 'ielts-prep',
    name: 'IELTS Preparation',
    category: 'Test Prep',
    level: ['Intermediate', 'Advanced'],
    description: 'Speaking, listening, reading, writing'
  },
  {
    id: 'gcse-prep',
    name: 'GCSE Preparation',
    category: 'Test Prep',
    level: ['Secondary'],
    description: 'All GCSE subjects and exam techniques'
  }
];

// Sample tutors - removed dummy data, will be fetched from API
export const tutors: Tutor[] = [];

// Helper functions
export const getTutorsBySubject = (subjectId: string): Tutor[] => {
  return tutors.filter(tutor => tutor.subjects.includes(subjectId));
};

export const getTutorsByLanguage = (languageId: string): Tutor[] => {
  return tutors.filter(tutor => tutor.languages.includes(languageId));
};

export const getSubjectsByCategory = (category: string): Subject[] => {
  return subjects.filter(subject => subject.category === category);
};

export const getHobbiesByCategory = (category: string): Hobby[] => {
  return hobbies.filter(hobby => hobby.category === category);
};

export const searchTutors = (query: string): Tutor[] => {
  const lowercaseQuery = query.toLowerCase();
  return tutors.filter(tutor => 
    tutor.name.toLowerCase().includes(lowercaseQuery) ||
    tutor.title.toLowerCase().includes(lowercaseQuery) ||
    tutor.subjects.some(subject => 
      subjects.find(s => s.id === subject)?.name.toLowerCase().includes(lowercaseQuery)
    ) ||
    tutor.specializations.some(spec => spec.toLowerCase().includes(lowercaseQuery))
  );
};

// Mock session data for dashboards
export interface Session {
  id: string;
  tutorId: string;
  studentId: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  zoomLink?: string;
  notes?: string;
  homework?: string;
  rating?: number;
}

export const mockSessions: Session[] = [
  {
    id: 'session-1',
    tutorId: 'tutor-1',
    studentId: 'student-1',
    subject: 'mathematics',
    date: '2025-01-02',
    time: '14:00',
    duration: 60,
    status: 'scheduled',
    zoomLink: 'https://zoom.us/j/123456789'
  },
  {
    id: 'session-2',
    tutorId: 'tutor-2',
    studentId: 'student-1',
    subject: 'english',
    date: '2025-01-01',
    time: '15:00',
    duration: 60,
    status: 'completed',
    notes: 'Great progress on essay writing techniques. Student showed excellent understanding of argumentative structure.',
    homework: 'Complete the argumentative essay draft on climate change (minimum 500 words)',
    rating: 5
  },
  {
    id: 'session-3',
    tutorId: 'tutor-1',
    studentId: 'student-1',
    subject: 'mathematics',
    date: '2024-12-28',
    time: '10:00',
    duration: 60,
    status: 'completed',
    notes: 'Covered quadratic equations and graphing. Student mastered vertex form.',
    homework: 'Practice problems 1-15 on quadratic equations worksheet',
    rating: 4
  },
  {
    id: 'session-4',
    tutorId: 'tutor-3',
    studentId: 'student-1',
    subject: 'physics',
    date: '2024-12-26',
    time: '16:00',
    duration: 60,
    status: 'completed',
    notes: 'Introduction to Newton\'s laws of motion. Good conceptual understanding.',
    homework: 'Read chapter 4 and complete practice questions 1-10',
    rating: 5
  },
  {
    id: 'session-5',
    tutorId: 'tutor-4',
    studentId: 'student-1',
    subject: 'chemistry',
    date: '2024-12-24',
    time: '11:00',
    duration: 60,
    status: 'completed',
    notes: 'Chemical bonding and molecular structures. Excellent participation.',
    homework: 'Complete the molecular geometry assignment',
    rating: 4
  },
  {
    id: 'session-6',
    tutorId: 'tutor-2',
    studentId: 'student-1',
    subject: 'english',
    date: '2025-01-05',
    time: '13:00',
    duration: 60,
    status: 'scheduled',
    zoomLink: 'https://zoom.us/j/987654321'
  },
  {
    id: 'session-7',
    tutorId: 'tutor-1',
    studentId: 'student-1',
    subject: 'mathematics',
    date: '2025-01-07',
    time: '14:00',
    duration: 60,
    status: 'scheduled',
    zoomLink: 'https://zoom.us/j/123456789'
  }
];