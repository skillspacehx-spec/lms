import { connectDB } from './database';
import { Course, CourseContent, CourseCategory, User } from '@/models';

export async function seedCourses() {
  try {
    await connectDB();

    console.log('Clearing existing courses and content...');
    await Course.deleteMany({});
    await CourseContent.deleteMany({});
    console.log('Cleared old data');

    // Ensure categories exist
    let academicCategory = await CourseCategory.findOne({ name: 'Academic Support' });
    if (!academicCategory) {
      academicCategory = await CourseCategory.create({
        name: 'Academic Support',
        description: 'GCSE, A-Level and general academic tutoring support',
        icon: '📚',
        color: '#3B82F6',
        subcategories: ['GCSE Maths', 'GCSE English', 'GCSE Science', 'A-Level'],
        isActive: true
      });
    }

    let lifeSkillsCategory = await CourseCategory.findOne({ name: 'Life Skills & Personal Development' });
    if (!lifeSkillsCategory) {
      lifeSkillsCategory = await CourseCategory.create({
        name: 'Life Skills & Personal Development',
        description: 'Build essential life skills for success',
        icon: '🌱',
        color: '#10B981',
        subcategories: ['Financial Literacy', 'Study Skills', 'Communication'],
        isActive: true
      });
    }

    let programmingCategory = await CourseCategory.findOne({ name: 'Programming' });
    if (!programmingCategory) {
      programmingCategory = await CourseCategory.create({
        name: 'Programming',
        description: 'Learn to code and build amazing applications',
        icon: '💻',
        color: '#8B5CF6',
        subcategories: ['Web Development', 'Mobile Apps', 'Data Science'],
        isActive: true
      });
    }

    // Get tutors
    const tutors = await User.find({ role: 'tutor' }).limit(5);
    if (tutors.length === 0) {
      console.log('No tutors found. Please create tutor accounts first.');
      return;
    }

    console.log(`Found ${tutors.length} tutors. Creating courses...`);

    // â”€â”€â”€ GCSE TUTORING COURSES (tags: GCSE, isFeatured: false) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const gcseMathsCourse = await Course.create({
      title: 'GCSE Maths Tutoring',
      description: 'Personalised 1:1 GCSE Maths support from DBS-checked tutors. Covering Number, Algebra, Geometry, Statistics and Probability — tailored to your child\'s needs and exam board.',
      category: academicCategory._id,
      instructor: tutors[0]._id,
      type: 'live_session',
      duration: 60,
      price: 3500,
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800',
      level: 'intermediate',
      language: 'English',
      prerequisites: [],
      learningOutcomes: [
        'Build confidence in core GCSE Maths topics',
        'Master algebraic equations and geometry',
        'Develop exam technique and time management',
        'Achieve target GCSE grade'
      ],
      tags: ['GCSE', 'Maths', 'Mathematics', '1:1 Tutoring'],
      rating: { average: 4.9, count: 312 },
      isActive: true,
      isFeatured: false,
      maxStudents: 1,
      enrolledStudents: []
    });

    const gcseScienceCourse = await Course.create({
      title: 'GCSE Science Tutoring',
      description: 'Expert 1:1 tutoring across Biology, Chemistry and Physics for GCSE. Our tutors make science accessible, engaging and exam-ready for every learner.',
      category: academicCategory._id,
      instructor: tutors[1 % tutors.length]._id,
      type: 'live_session',
      duration: 60,
      price: 3500,
      thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800',
      level: 'intermediate',
      language: 'English',
      prerequisites: [],
      learningOutcomes: [
        'Understand core Biology, Chemistry and Physics concepts',
        'Apply scientific method to exam questions',
        'Improve practical investigation skills',
        'Achieve target GCSE Science grade'
      ],
      tags: ['GCSE', 'Science', 'Biology', 'Chemistry', 'Physics', '1:1 Tutoring'],
      rating: { average: 4.8, count: 278 },
      isActive: true,
      isFeatured: false,
      maxStudents: 1,
      enrolledStudents: []
    });

    const gcseEnglishCourse = await Course.create({
      title: 'GCSE English Tutoring',
      description: 'Personalised GCSE English Language and Literature support. From essay writing to poetry analysis, our tutors help students find their voice and excel in exams.',
      category: academicCategory._id,
      instructor: tutors[2 % tutors.length]._id,
      type: 'live_session',
      duration: 60,
      price: 3500,
      thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      level: 'intermediate',
      language: 'English',
      prerequisites: [],
      learningOutcomes: [
        'Improve essay structure and writing technique',
        'Analyse literary texts with confidence',
        'Develop reading comprehension skills',
        'Achieve target GCSE English grade'
      ],
      tags: ['GCSE', 'English', 'Writing', '1:1 Tutoring'],
      rating: { average: 4.9, count: 341 },
      isActive: true,
      isFeatured: false,
      maxStudents: 1,
      enrolledStudents: []
    });

    // â”€â”€â”€ FEATURED COURSES (isFeatured: true) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const financialLiteracyCourse = await Course.create({
      title: 'Financial Literacy for Teenagers',
      description: 'A practical, engaging course teaching teenagers essential money management skills — budgeting, saving, investing, and understanding the financial system. Skills that last a lifetime.',
      category: lifeSkillsCategory._id,
      instructor: tutors[0]._id,
      type: 'lms_course',
      duration: 480,
      price: 2999,
      thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
      level: 'beginner',
      language: 'English',
      prerequisites: [],
      learningOutcomes: [
        'Understand how to create and stick to a budget',
        'Learn the principles of saving and compound interest',
        'Introduction to investing and financial planning',
        'Build lifelong healthy money habits'
      ],
      tags: ['Life Skills', 'Finance', 'Teenagers', 'Money Management'],
      rating: { average: 4.8, count: 189 },
      isActive: true,
      isFeatured: true,
      maxStudents: 200,
      enrolledStudents: []
    });

    const studySkillsCourse = await Course.create({
      title: 'Study Skills Masterclass',
      description: 'Transform how your child studies. This masterclass covers proven techniques — spaced repetition, active recall, mind mapping, and revision planning — to help any learner study smarter, not harder.',
      category: academicCategory._id,
      instructor: tutors[1 % tutors.length]._id,
      type: 'lms_course',
      duration: 360,
      price: 1999,
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
      level: 'all',
      language: 'English',
      prerequisites: [],
      learningOutcomes: [
        'Master spaced repetition and active recall',
        'Create an effective revision timetable',
        'Eliminate procrastination and improve focus',
        'Develop exam confidence and strategy'
      ],
      tags: ['Study Skills', 'Academic', 'Revision', 'Exam Prep'],
      rating: { average: 4.9, count: 523 },
      isActive: true,
      isFeatured: true,
      maxStudents: 300,
      enrolledStudents: []
    });

    const codingCourse = await Course.create({
      title: 'Introduction to Coding',
      description: 'A beginner-friendly introduction to programming for young learners. Using Python and Scratch, students learn computational thinking, problem solving, and how to build their first projects.',
      category: programmingCategory._id,
      instructor: tutors[2 % tutors.length]._id,
      type: 'lms_course',
      duration: 600,
      price: 3499,
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      level: 'beginner',
      language: 'English',
      prerequisites: ['Basic computer skills'],
      learningOutcomes: [
        'Understand core programming concepts',
        'Write simple Python programs',
        'Build games and projects with Scratch',
        'Develop computational thinking skills'
      ],
      tags: ['Coding', 'Programming', 'Python', 'Scratch', 'Technology'],
      rating: { average: 4.8, count: 412 },
      isActive: true,
      isFeatured: true,
      maxStudents: 150,
      enrolledStudents: []
    });

    // Add content for Featured courses
    await CourseContent.create([
      {
        course: financialLiteracyCourse._id,
        title: 'Welcome: Why Money Skills Matter',
        description: 'Introduction to financial literacy and why it matters for teenagers',
        type: 'video',
        content: { videoUrl: 'https://www.youtube.com/watch?v=example_finance1', videoDuration: 600 },
        order: 1,
        isPreview: true,
        isActive: true,
        accessLevel: 'free'
      },
      {
        course: financialLiteracyCourse._id,
        title: 'Budgeting Basics',
        description: 'How to create your first budget',
        type: 'video',
        content: { videoUrl: 'https://www.youtube.com/watch?v=example_finance2', videoDuration: 900 },
        order: 2,
        isPreview: false,
        isActive: true,
        accessLevel: 'enrolled_only'
      },
      {
        course: studySkillsCourse._id,
        title: 'The Science of Learning',
        description: 'How memory works and how to use it',
        type: 'video',
        content: { videoUrl: 'https://www.youtube.com/watch?v=example_study1', videoDuration: 720 },
        order: 1,
        isPreview: true,
        isActive: true,
        accessLevel: 'free'
      },
      {
        course: studySkillsCourse._id,
        title: 'Spaced Repetition & Active Recall',
        description: 'The two most powerful study techniques',
        type: 'video',
        content: { videoUrl: 'https://www.youtube.com/watch?v=example_study2', videoDuration: 1200 },
        order: 2,
        isPreview: false,
        isActive: true,
        accessLevel: 'enrolled_only'
      },
      {
        course: codingCourse._id,
        title: 'What is Programming?',
        description: 'Introduction to coding and computational thinking',
        type: 'video',
        content: { videoUrl: 'https://www.youtube.com/watch?v=example_code1', videoDuration: 600 },
        order: 1,
        isPreview: true,
        isActive: true,
        accessLevel: 'free'
      },
      {
        course: codingCourse._id,
        title: 'Your First Python Program',
        description: 'Write Hello World and understand variables',
        type: 'video',
        content: { videoUrl: 'https://www.youtube.com/watch?v=example_code2', videoDuration: 1500 },
        order: 2,
        isPreview: false,
        isActive: true,
        accessLevel: 'enrolled_only'
      }
    ]);

    console.log('Successfully created courses:');
    console.log(`  - ${gcseMathsCourse.title} [GCSE, live_session]`);
    console.log(`  - ${gcseScienceCourse.title} [GCSE, live_session]`);
    console.log(`  - ${gcseEnglishCourse.title} [GCSE, live_session]`);
    console.log(`  - ${financialLiteracyCourse.title} [Featured]`);
    console.log(`  - ${studySkillsCourse.title} [Featured]`);
    console.log(`  - ${codingCourse.title} [Featured]`);
    console.log('\nDatabase seeded successfully!');

    return {
      success: true,
      courses: [gcseMathsCourse, gcseScienceCourse, gcseEnglishCourse, financialLiteracyCourse, studySkillsCourse, codingCourse]
    };

  } catch (error) {
    console.error('Error seeding courses:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedCourses()
    .then(() => { console.log('Done!'); process.exit(0); })
    .catch((error) => { console.error('Failed:', error); process.exit(1); });
}

