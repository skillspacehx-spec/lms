import { connectDB } from './database';
import { User, CourseCategory, Course } from '../models/index';
import bcrypt from 'bcryptjs';

// Realistic tutor data with avatars
export const realisticTutors = [
  {
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@tutors.com',
    password: 'password123',
    role: 'tutor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'PhD in Mathematics with 12+ years of teaching experience. Specialized in GCSE and A-Level mathematics. Former Cambridge University lecturer passionate about making complex concepts simple and accessible.',
    subjects: ['Mathematics', 'Statistics', 'Further Mathematics'],
    hourlyRate: 45,
    experience: 12,
    qualifications: [
      'PhD in Pure Mathematics - Cambridge University',
      'PGCE in Secondary Mathematics',
      'Qualified Teacher Status (QTS)',
      'Member of the Mathematical Association'
    ],
    isVerified: true
  },
  {
    name: 'James Chen',
    email: 'james.chen@tutors.com',
    password: 'password123',
    role: 'tutor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'Computer Science graduate from Imperial College London. 8 years of experience teaching programming and web development. Currently working as a senior software engineer while helping students achieve their coding goals.',
    subjects: ['Computer Science', 'Programming', 'Web Development', 'Python'],
    hourlyRate: 40,
    experience: 8,
    qualifications: [
      'MSc Computer Science - Imperial College London',
      'AWS Certified Solutions Architect',
      'Google Developer Certification',
      'Industry professional with 10+ years experience'
    ],
    isVerified: true
  },
  {
    name: 'Emma Thompson',
    email: 'emma.thompson@tutors.com',
    password: 'password123',
    role: 'tutor',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: 'English Literature specialist with a passion for creative writing and literary analysis. 10 years of experience helping students excel in GCSE and A-Level English. Published author and former examiner.',
    subjects: ['English Literature', 'English Language', 'Creative Writing'],
    hourlyRate: 38,
    experience: 10,
    qualifications: [
      'MA English Literature - Oxford University',
      'PGCE in Secondary English',
      'Former AQA A-Level English Examiner',
      'Published author of 3 novels'
    ],
    isVerified: true
  },
  {
    name: 'Dr. Rajesh Patel',
    email: 'rajesh.patel@tutors.com',
    password: 'password123',
    role: 'tutor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    bio: 'Physics PhD with extensive experience in teaching complex scientific concepts. Specialized in exam preparation for GCSE, A-Level, and university entrance. Former research scientist at CERN.',
    subjects: ['Physics', 'Chemistry', 'Science'],
    hourlyRate: 50,
    experience: 15,
    qualifications: [
      'PhD in Particle Physics - University of Manchester',
      'Former Research Scientist at CERN',
      'Chartered Physicist (CPhys)',
      '15+ years of teaching experience'
    ],
    isVerified: true
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@tutors.com',
    password: 'password123',
    role: 'tutor',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
    bio: 'Bilingual Spanish and French teacher with native fluency. 9 years of experience teaching languages at all levels. Lived in Madrid and Paris, bringing authentic cultural insights to lessons.',
    subjects: ['Spanish', 'French', 'Languages'],
    hourlyRate: 35,
    experience: 9,
    qualifications: [
      'BA Modern Languages - University of Edinburgh',
      'DELE Spanish Teaching Certificate',
      'DELF French Teaching Certificate',
      'Lived and worked in Spain and France for 6 years'
    ],
    isVerified: true
  },
  {
    name: 'Michael Roberts',
    email: 'michael.roberts@tutors.com',
    password: 'password123',
    role: 'tutor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    bio: 'History enthusiast and experienced educator specializing in British and European history. Interactive teaching style using multimedia and primary sources. Excellent track record in exam preparation.',
    subjects: ['History', 'Geography', 'Politics'],
    hourlyRate: 36,
    experience: 7,
    qualifications: [
      'MA History - University of Bristol',
      'PGCE in Humanities',
      'Historical Association Member',
      'Former museum education coordinator'
    ],
    isVerified: true
  },
  {
    name: 'Dr. Aisha Khan',
    email: 'aisha.khan@tutors.com',
    password: 'password123',
    role: 'tutor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    bio: 'Medical doctor turned Biology educator. Passionate about making science accessible and exciting. Specialized in A-Level Biology and medical school entrance preparation. 11 years of teaching experience.',
    subjects: ['Biology', 'Chemistry', 'Medicine'],
    hourlyRate: 48,
    experience: 11,
    qualifications: [
      'MBBS - Kings College London',
      'Medical Education Certificate',
      'UKCAT & BMAT Specialist',
      'GMC Registered Doctor'
    ],
    isVerified: true
  },
  {
    name: 'Thomas Williams',
    email: 'thomas.williams@tutors.com',
    password: 'password123',
    role: 'tutor',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    bio: 'Economics and Business Studies specialist with real-world experience. Former investment banker, now dedicated to education. Excellent at simplifying complex economic theories and business concepts.',
    subjects: ['Economics', 'Business Studies', 'Accounting'],
    hourlyRate: 42,
    experience: 9,
    qualifications: [
      'MSc Economics - LSE',
      'CFA Charterholder',
      '8 years in investment banking',
      'PGCE in Business Education'
    ],
    isVerified: true
  },
  {
    name: 'Sophie Martin',
    email: 'sophie.martin@tutors.com',
    password: 'password123',
    role: 'tutor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    bio: 'Creative and patient Art & Design tutor. Specialized in GCSE and A-Level Art, Photography, and Graphic Design. Professional artist with work exhibited in galleries across the UK.',
    subjects: ['Art', 'Design', 'Photography'],
    hourlyRate: 34,
    experience: 6,
    qualifications: [
      'BA Fine Art - Central Saint Martins',
      'Diploma in Art Education',
      'Professional practicing artist',
      'Featured in 15+ gallery exhibitions'
    ],
    isVerified: true
  },
  {
    name: 'David Lee',
    email: 'david.lee@tutors.com',
    password: 'password123',
    role: 'tutor',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    bio: 'Music teacher and professional musician with a passion for nurturing talent. Specialized in piano, music theory, and composition. Prepared 50+ students for ABRSM exams with excellent results.',
    subjects: ['Music', 'Piano', 'Music Theory'],
    hourlyRate: 38,
    experience: 10,
    qualifications: [
      'BMus Performance - Royal Academy of Music',
      'ABRSM Diploma (DipABRSM)',
      'Professional concert pianist',
      '100% ABRSM exam pass rate'
    ],
    isVerified: true
  }
];

// Course categories with proper structure
const categories = [
  {
    name: 'Mathematics',
    description: 'Comprehensive mathematics courses from basic arithmetic to advanced calculus',
    icon: '📐',
    color: '#3B82F6',
    subcategories: ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'GCSE Math', 'A-Level Math']
  },
  {
    name: 'Sciences',
    description: 'Physics, Chemistry, and Biology courses for all levels',
    icon: '🔬',
    color: '#10B981',
    subcategories: ['Physics', 'Chemistry', 'Biology', 'Environmental Science', 'GCSE Science', 'A-Level Science']
  },
  {
    name: 'Languages',
    description: 'Learn new languages with native and experienced tutors',
    icon: '🌍',
    color: '#F59E0B',
    subcategories: ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Arabic']
  },
  {
    name: 'Humanities',
    description: 'History, Geography, and Social Studies courses',
    icon: '📚',
    color: '#8B5CF6',
    subcategories: ['History', 'Geography', 'Politics', 'Philosophy', 'Religious Studies']
  },
  {
    name: 'Computer Science',
    description: 'Programming, web development, and computer science fundamentals',
    icon: '💻',
    color: '#EF4444',
    subcategories: ['Python', 'JavaScript', 'Web Development', 'Data Science', 'AI & ML', 'Cybersecurity']
  },
  {
    name: 'Business & Economics',
    description: 'Business studies, economics, and entrepreneurship',
    icon: '💼',
    color: '#06B6D4',
    subcategories: ['Economics', 'Business Studies', 'Accounting', 'Marketing', 'Entrepreneurship']
  },
  {
    name: 'Creative Arts',
    description: 'Art, design, music, and creative subjects',
    icon: '🎨',
    color: '#EC4899',
    subcategories: ['Art & Design', 'Photography', 'Graphic Design', 'Music', 'Drama', 'Film Studies']
  },
  {
    name: 'English',
    description: 'English language and literature courses',
    icon: '📖',
    color: '#14B8A6',
    subcategories: ['English Literature', 'English Language', 'Creative Writing', 'Essay Writing', 'Poetry']
  }
];

export async function seedRealisticData() {
  try {
    await connectDB();
    console.log('🌱 Starting realistic data seeding...');

    // Clear existing data
    console.log('🗑️  Clearing existing tutors, categories, and courses...');
    await User.deleteMany({ role: 'tutor' });
    await CourseCategory.deleteMany({});
    await Course.deleteMany({});

    // Create categories
    console.log('📁 Creating course categories...');
    const createdCategories = await CourseCategory.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create tutors
    console.log('👨‍🏫 Creating realistic tutors...');
    const tutorsToCreate = await Promise.all(
      realisticTutors.map(async (tutor) => ({
        ...tutor,
        password: await bcrypt.hash(tutor.password, 12)
      }))
    );
    
    const createdTutors = await User.insertMany(tutorsToCreate);
    console.log(`✅ Created ${createdTutors.length} tutors`);

    // Create courses for each tutor
    console.log('📚 Creating courses...');
    const courses = [];
    
    for (const tutor of createdTutors) {
      const tutorSubjects = tutor.subjects || [];
      
      for (const subject of tutorSubjects) {
        // Find matching category
        const category = createdCategories.find(cat => 
          cat.name.toLowerCase().includes(subject.toLowerCase()) ||
          cat.subcategories.some((sub: string) => sub.toLowerCase().includes(subject.toLowerCase())) ||
          subject.toLowerCase().includes(cat.name.toLowerCase())
        ) || createdCategories[0];

        courses.push({
          title: `${subject} Tutoring with ${tutor.name.split(' ')[0]}`,
          description: `Personalized ${subject} lessons designed to help you excel. ${tutor.bio.substring(0, 150)}...`,
          category: category._id,
          instructor: tutor._id,
          type: 'live_session',
          duration: 60,
          price: tutor.hourlyRate,
          thumbnail: tutor.avatar,
          isActive: true,
          maxStudents: 5,
          enrolledStudents: []
        });
      }
    }

    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ Created ${createdCourses.length} courses`);

    console.log('\n🎉 Realistic data seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Tutors: ${createdTutors.length}`);
    console.log(`   - Courses: ${createdCourses.length}`);
    console.log(`\n🔑 All tutors can login with password: password123`);

    return {
      success: true,
      categories: createdCategories.length,
      tutors: createdTutors.length,
      courses: createdCourses.length
    };
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}
