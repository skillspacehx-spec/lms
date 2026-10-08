export interface SubjectOffering {
  id: string;
  title: string;
  category: string;
  badge: string;
  levels: string[];
  description: string;
  coverage: string[];
  membershipRequired: boolean;
  membershipNote: string;
  actionHref: string;
  actionLabel: string;
  introHref: string;
  introLabel: string;
  keywords: string[];
}

export interface ResourceOffering {
  id: string;
  title: string;
  category: 'Wellbeing' | 'SEND' | 'Study Tips' | 'Articles & Insights' | 'General';
  type: 'Guide' | 'Toolkit' | 'Article' | 'Checklist' | 'Pathway' | 'Worksheet';
  description: string;
  meta?: string;
  accessType: 'Free' | 'Downloadable PDF' | 'Included with Membership' | 'Paid';
  accessBadgeColor?: string;
  slug?: string;
  href: string;
  iconName?: string;
  keywords: string[];
}

export interface WebinarOffering {
  id: string;
  title: string;
  description: string;
  audience: string;
  dateStr: string;
  timeStr: string;
  speaker: string;
  price: number;
  isIncludedWithMembership: boolean;
  href: string;
  keywords: string[];
}

export const SUBJECT_OFFERINGS: SubjectOffering[] = [
  {
    id: 'maths',
    title: 'Mathematics Tutoring',
    category: 'Core Academic',
    badge: '1-to-1 Tutoring Option',
    levels: ['Primary', 'KS3', 'GCSE', 'A-Level', 'University'],
    description: 'Master core concepts, build problem-solving confidence, and prepare for exams with 1-on-1 tailored mathematics tutoring.',
    coverage: ['Algebra & Equations', 'Geometry & Trigonometry', 'Calculus & Functions', 'Statistics & Probability', 'Arithmetic & Fractions', 'GCSE & A-Level Exam Technique'],
    membershipRequired: true,
    membershipNote: 'Purchase a flexible Skill Space tutoring membership or book a £15 introductory session to match with a DBS-checked maths specialist.',
    actionHref: '/tutoring',
    actionLabel: 'View Tutoring Memberships',
    introHref: '/tutoring#pricing',
    introLabel: 'Book Intro Session (£15)',
    keywords: ['maths', 'mathematics', 'math', 'algebra', 'geometry', 'calculus', 'arithmetic', 'fractions', 'statistics', 'numeracy', 'gcse maths', 'a level maths', 'sats maths', 'multiplication', 'equations']
  },
  {
    id: 'english',
    title: 'English Language & Literature Tutoring',
    category: 'Core Academic',
    badge: '1-to-1 Tutoring Option',
    levels: ['Primary', 'KS3', 'GCSE', 'A-Level'],
    description: 'Enhance reading comprehension, creative writing, grammatical accuracy, essay structure, and textual analysis with personalized 1-on-1 tutoring.',
    coverage: ['Creative & Descriptive Writing', 'Reading Comprehension', 'GCSE & A-Level Essay Structuring', 'Shakespeare & Poetry Analysis', 'Grammar, Punctuation & Vocabulary', 'Exam Board Specific Preparation'],
    membershipRequired: true,
    membershipNote: 'Purchase a flexible Skill Space tutoring membership or book a £15 introductory session to match with a DBS-checked English specialist.',
    actionHref: '/tutoring',
    actionLabel: 'View Tutoring Memberships',
    introHref: '/tutoring#pricing',
    introLabel: 'Book Intro Session (£15)',
    keywords: ['english', 'english language', 'english literature', 'literature', 'essay', 'creative writing', 'reading', 'comprehension', 'grammar', 'spelling', 'poetry', 'shakespeare', 'gcse english', 'a level english']
  },
  {
    id: 'science',
    title: 'General & Combined Science Tutoring',
    category: 'Science',
    badge: '1-to-1 Tutoring Option',
    levels: ['Primary', 'KS3', 'GCSE (Combined / Triple)'],
    description: 'Build strong scientific foundations, understand core scientific principles, and develop analytical experiment skills.',
    coverage: ['Scientific Method & Enquiry', 'Key Concepts in Biology, Chemistry & Physics', 'Data Analysis & Graphing', 'GCSE Combined Science Revision', 'Exam Past Paper Walkthroughs'],
    membershipRequired: true,
    membershipNote: 'Purchase a flexible Skill Space tutoring membership or book a £15 introductory session to match with a verified science tutor.',
    actionHref: '/tutoring',
    actionLabel: 'View Tutoring Memberships',
    introHref: '/tutoring#pricing',
    introLabel: 'Book Intro Session (£15)',
    keywords: ['science', 'combined science', 'triple science', 'ks3 science', 'gcse science', 'scientific method', 'experiments', 'physics chemistry biology']
  },
  {
    id: 'physics',
    title: 'Physics Tutoring',
    category: 'Science',
    badge: '1-to-1 Tutoring Option',
    levels: ['Secondary', 'GCSE', 'A-Level', 'University'],
    description: 'Deepen conceptual understanding of mechanics, electricity, thermodynamics, and astrophysics with structured problem solving.',
    coverage: ['Forces, Motion & Energy', 'Electricity & Circuits', 'Waves & Optics', 'Nuclear & Quantum Physics', 'Mathematical Calculations in Physics', 'GCSE & A-Level Past Papers'],
    membershipRequired: true,
    membershipNote: 'Purchase a flexible Skill Space tutoring membership or book a £15 introductory session to match with an expert physics tutor.',
    actionHref: '/tutoring',
    actionLabel: 'View Tutoring Memberships',
    introHref: '/tutoring#pricing',
    introLabel: 'Book Intro Session (£15)',
    keywords: ['physics', 'forces', 'electricity', 'circuits', 'mechanics', 'quantum', 'motion', 'energy', 'waves', 'gcse physics', 'a level physics']
  },
  {
    id: 'chemistry',
    title: 'Chemistry Tutoring',
    category: 'Science',
    badge: '1-to-1 Tutoring Option',
    levels: ['Secondary', 'GCSE', 'A-Level', 'University'],
    description: 'Master organic, inorganic, and physical chemistry concepts, chemical equations, and calculations.',
    coverage: ['Atomic Structure & Periodic Table', 'Chemical Bonding & Reactions', 'Organic Chemistry & Reaction Mechanisms', 'Moles & Quantitative Chemistry', 'Equilibrium & Energetics'],
    membershipRequired: true,
    membershipNote: 'Purchase a flexible Skill Space tutoring membership or book a £15 introductory session to match with a verified chemistry tutor.',
    actionHref: '/tutoring',
    actionLabel: 'View Tutoring Memberships',
    introHref: '/tutoring#pricing',
    introLabel: 'Book Intro Session (£15)',
    keywords: ['chemistry', 'chemical', 'organic chemistry', 'periodic table', 'bonding', 'moles', 'equations', 'gcse chemistry', 'a level chemistry']
  },
  {
    id: 'biology',
    title: 'Biology Tutoring',
    category: 'Science',
    badge: '1-to-1 Tutoring Option',
    levels: ['Secondary', 'GCSE', 'A-Level', 'University'],
    description: 'Explore cell biology, genetics, human physiology, ecology, and biological systems with experienced educators.',
    coverage: ['Cell Structure & Microscopy', 'Genetics, DNA & Inheritance', 'Human Anatomy & Physiology', 'Ecology, Ecosystems & Evolution', 'A-Level Essay & Application Questions'],
    membershipRequired: true,
    membershipNote: 'Purchase a flexible Skill Space tutoring membership or book a £15 introductory session to match with a qualified biology tutor.',
    actionHref: '/tutoring',
    actionLabel: 'View Tutoring Memberships',
    introHref: '/tutoring#pricing',
    introLabel: 'Book Intro Session (£15)',
    keywords: ['biology', 'cells', 'genetics', 'dna', 'human body', 'ecology', 'plants', 'evolution', 'physiology', 'gcse biology', 'a level biology']
  },
  {
    id: 'languages',
    title: 'Modern Foreign Languages (French, Spanish, German)',
    category: 'Languages',
    badge: '1-to-1 Tutoring Option',
    levels: ['Beginner', 'Intermediate', 'GCSE', 'A-Level'],
    description: 'Develop spoken fluency, grammatical precision, listening skills, and exam confidence with native and fluent language tutors.',
    coverage: ['Conversational Fluency & Pronunciation', 'Grammar Rules, Tenses & Vocabulary', 'Listening Comprehension & Dictation', 'GCSE & A-Level Speaking Exam Prep', 'Reading & Translation'],
    membershipRequired: true,
    membershipNote: 'Purchase a flexible Skill Space tutoring membership or book a £15 introductory session to match with a vetted language tutor.',
    actionHref: '/tutoring',
    actionLabel: 'View Tutoring Memberships',
    introHref: '/tutoring#pricing',
    introLabel: 'Book Intro Session (£15)',
    keywords: ['french', 'spanish', 'german', 'languages', 'foreign language', 'speaking', 'listening', 'grammar', 'translation', 'vocabulary', 'gcse french', 'gcse spanish', 'gcse german']
  },
  {
    id: 'computer-science',
    title: 'Computer Science & Programming Tutoring',
    category: 'Technology',
    badge: '1-to-1 Tutoring Option',
    levels: ['Beginner', 'Intermediate', 'GCSE', 'A-Level'],
    description: 'Learn computational thinking, coding in Python, JavaScript, and Java, algorithms, data structures, and computer theory.',
    coverage: ['Python & JavaScript Programming', 'Algorithms & Problem Solving', 'Data Structures & Logic Gates', 'Databases & SQL', 'Web Development Fundamentals', 'GCSE & A-Level Project Support'],
    membershipRequired: true,
    membershipNote: 'Purchase a flexible Skill Space tutoring membership or book a £15 introductory session to match with a computing mentor.',
    actionHref: '/tutoring',
    actionLabel: 'View Tutoring Memberships',
    introHref: '/tutoring#pricing',
    introLabel: 'Book Intro Session (£15)',
    keywords: ['computer science', 'programming', 'coding', 'python', 'javascript', 'java', 'web development', 'algorithms', 'software', 'coding for kids', 'gcse computer science']
  },
  {
    id: '11-plus',
    title: '11+ & Grammar School Entrance Tutoring',
    category: 'Test Prep',
    badge: '1-to-1 Tutoring Option',
    levels: ['Primary (Years 4-6)'],
    description: 'Comprehensive preparation for 11+ grammar and independent school exams, developing fast thinking and exam technique.',
    coverage: ['Verbal Reasoning (VR)', 'Non-Verbal Reasoning (NVR) & Spatial', '11+ Advanced Mathematics', '11+ English Comprehension & Creative Writing', 'Timed Mock Test Strategies'],
    membershipRequired: true,
    membershipNote: 'Purchase a flexible Skill Space tutoring membership or book a £15 introductory session to match with an 11+ specialist.',
    actionHref: '/tutoring',
    actionLabel: 'View Tutoring Memberships',
    introHref: '/tutoring#pricing',
    introLabel: 'Book Intro Session (£15)',
    keywords: ['11+', '11 plus', 'eleven plus', 'grammar school', 'entrance exam', 'verbal reasoning', 'non verbal reasoning', 'gl assessment', 'cem', 'sats']
  },
  {
    id: 'gcse-prep',
    title: 'GCSE Preparation & Exam Revision Tutoring',
    category: 'Test Prep',
    badge: '1-to-1 Tutoring Option',
    levels: ['Years 10-11 (GCSE)'],
    description: 'Targeted revision across all core subjects to turn weak spots into strengths and master mark schemes before GCSE exams.',
    coverage: ['All Major Exam Boards (AQA, Edexcel, OCR, WJEC)', 'Past Paper Analysis & Mark Scheme Mastery', 'Time Management & Exam Stress Control', 'Active Revision Strategies'],
    membershipRequired: true,
    membershipNote: 'Purchase a flexible Skill Space tutoring membership or book a £15 introductory session to match with an experienced GCSE tutor.',
    actionHref: '/tutoring',
    actionLabel: 'View Tutoring Memberships',
    introHref: '/tutoring#pricing',
    introLabel: 'Book Intro Session (£15)',
    keywords: ['gcse', 'gcse prep', 'gcse revision', 'exam prep', 'past papers', 'aqa', 'edexcel', 'ocr', 'exams', 'revision']
  },
  {
    id: 'a-level-prep',
    title: 'A-Level & University Preparation Tutoring',
    category: 'Test Prep',
    badge: '1-to-1 Tutoring Option',
    levels: ['Years 12-13 (Sixth Form / College)'],
    description: 'Advanced subject tuition designed to secure top grades for university admissions and apprenticeship pathways.',
    coverage: ['In-depth Subject Mastery', 'Extended Essay & Analytical Responses', 'UCAS Personal Statement Advice', 'Synoptic & Challenging Exam Questions'],
    membershipRequired: true,
    membershipNote: 'Purchase a flexible Skill Space tutoring membership or book a £15 introductory session to match with an A-Level specialist.',
    actionHref: '/tutoring',
    actionLabel: 'View Tutoring Memberships',
    introHref: '/tutoring#pricing',
    introLabel: 'Book Intro Session (£15)',
    keywords: ['a-level', 'a level', 'sixth form', 'university prep', 'ucas', 'alevel', 'a levels']
  },
  {
    id: 'study-skills-tutoring',
    title: 'Study Skills & Executive Functioning Support',
    category: 'Study Support',
    badge: '1-to-1 Tutoring Option',
    levels: ['Primary', 'Secondary', 'Sixth Form'],
    description: 'Personalized mentoring to build organization, time management, active revision routines, and independent study habits.',
    coverage: ['Revision Timetables & Daily Routines', 'Active Recall & Note-taking Systems', 'Overcoming Procrastination & Building Focus', 'Managing Homework & Deadlines'],
    membershipRequired: true,
    membershipNote: 'Purchase a flexible Skill Space tutoring membership or book a £15 introductory session to get dedicated study skills coaching.',
    actionHref: '/tutoring',
    actionLabel: 'View Tutoring Memberships',
    introHref: '/tutoring#pricing',
    introLabel: 'Book Intro Session (£15)',
    keywords: ['study skills', 'executive functioning', 'organisation', 'time management', 'revision timetable', 'habits', 'focus', 'homework help', 'procrastination']
  },
  {
    id: 'send-tutoring',
    title: 'SEND Tailored Tutoring Support',
    category: 'Specialist Support',
    badge: '1-to-1 Specialist Option',
    levels: ['All Ages & Key Stages'],
    description: 'Individualized, patient support for neurodiverse learners, including dyslexia, ADHD, autism (ASC), dyscalculia, and processing differences.',
    coverage: ['Multi-Sensory Learning Techniques', 'Adaptive Pace & Visual Aids', 'Confidence Building & Reducing Anxiety', 'Collaboration with EHCP & Learning Plans'],
    membershipRequired: true,
    membershipNote: 'Purchase a flexible Skill Space tutoring membership or book a £15 introductory session to match with an experienced SEND tutor.',
    actionHref: '/tutoring',
    actionLabel: 'View Tutoring Memberships',
    introHref: '/tutoring#pricing',
    introLabel: 'Book Intro Session (£15)',
    keywords: ['send', 'sen', 'adhd', 'dyslexia', 'autism', 'asc', 'asd', 'neurodiversity', 'special needs', 'dyscalculia', 'ehcp', 'additional needs', 'sensory']
  }
];

export const RESOURCE_OFFERINGS: ResourceOffering[] = [
  // Wellbeing & Mental Health
  {
    id: 'managing-stress-and-anxiety',
    title: 'Managing Stress & Anxiety',
    category: 'Wellbeing',
    type: 'Guide',
    description: 'Practical, evidence-based techniques to help young people understand anxiety, stay calm, and regain emotional control during stressful periods.',
    meta: 'Guide • 7 min read',
    accessType: 'Free',
    slug: 'managing-stress-and-anxiety',
    href: '/resources/managing-stress-and-anxiety',
    iconName: 'brain',
    keywords: ['anxiety', 'stress', 'mental health', 'worry', 'panic', 'nervous', 'calm', 'breathing', 'wellbeing', 'pressure', 'emotional', 'overwhelm', 'coping']
  },
  {
    id: 'building-confidence-in-young-people',
    title: 'Building Confidence in Young People',
    category: 'Wellbeing',
    type: 'Guide',
    description: 'Everyday strategies for parents and educators to nurture self-belief, resilience, and positive self-talk in children.',
    meta: 'Guide • 8 min read',
    accessType: 'Free',
    slug: 'building-confidence-in-young-people',
    href: '/resources/building-confidence-in-young-people',
    iconName: 'heart',
    keywords: ['confidence', 'self-esteem', 'self belief', 'motivation', 'mindset', 'wellbeing', 'positive thinking', 'encouragement']
  },
  {
    id: 'developing-resilience',
    title: 'Developing Resilience & Bouncing Back',
    category: 'Wellbeing',
    type: 'Guide',
    description: 'How to help young people reframe setbacks, embrace mistakes as learning opportunities, and build long-term emotional resilience.',
    meta: 'Guide • 6 min read',
    accessType: 'Free',
    slug: 'developing-resilience',
    href: '/resources/developing-resilience',
    iconName: 'sparkles',
    keywords: ['resilience', 'grit', 'mistakes', 'setbacks', 'growth mindset', 'perseverance', 'wellbeing', 'emotional']
  },
  {
    id: 'emotional-wellbeing',
    title: 'Emotional Wellbeing & Mental Health Hub',
    category: 'Wellbeing',
    type: 'Pathway',
    description: 'Comprehensive resources on understanding emotions, managing school stress, and building strong self-esteem.',
    meta: 'Resource Topic Hub',
    accessType: 'Free',
    slug: 'emotional-wellbeing',
    href: '/resources/emotional-wellbeing',
    iconName: 'heart',
    keywords: ['emotional wellbeing', 'emotions', 'feelings', 'mental health', 'wellbeing hub', 'self-care']
  },
  {
    id: 'digital-wellbeing-and-online-safety',
    title: 'Digital Wellbeing & Online Safety',
    category: 'Wellbeing',
    type: 'Guide',
    description: 'Healthy screen habits, social media balance, online safety guidance, and managing digital overwhelm for families.',
    meta: 'Topic & Guide',
    accessType: 'Free',
    slug: 'digital-wellbeing-and-online-safety',
    href: '/resources/digital-wellbeing-and-online-safety',
    iconName: 'shield',
    keywords: ['digital wellbeing', 'online safety', 'screen time', 'social media', 'internet safety', 'cyberbullying', 'phones']
  },
  {
    id: 'personal-development',
    title: 'Personal Development & Goal Setting',
    category: 'Wellbeing',
    type: 'Pathway',
    description: 'Frameworks to help young people set meaningful goals, communicate effectively, and grow with confidence.',
    meta: 'Resource Topic Hub',
    accessType: 'Free',
    slug: 'personal-development',
    href: '/resources/personal-development',
    iconName: 'target',
    keywords: ['personal development', 'goals', 'growth', 'communication', 'leadership', 'life skills']
  },
  {
    id: 'reflection-journal',
    title: 'Reflection Journal Toolkit',
    category: 'Wellbeing',
    type: 'Toolkit',
    description: 'A structured printable journal for young people to reflect on their thoughts, emotions, and daily wins.',
    meta: 'PDF • 3 pages • Downloadable',
    accessType: 'Downloadable PDF',
    href: '/resources?category=wellbeing',
    iconName: 'file',
    keywords: ['reflection journal', 'journal', 'journaling', 'printable', 'pdf', 'worksheet', 'thoughts', 'wellbeing download']
  },
  {
    id: 'gratitude-worksheet',
    title: 'Daily Gratitude Worksheet',
    category: 'Wellbeing',
    type: 'Worksheet',
    description: 'A 1-page printable activity to practice gratitude, reframe negative thoughts, and boost daily positive mood.',
    meta: 'PDF • 1 page • Downloadable',
    accessType: 'Downloadable PDF',
    href: '/resources?category=wellbeing',
    iconName: 'heart',
    keywords: ['gratitude', 'worksheet', 'mindfulness', 'positivity', 'wellbeing activity', 'download']
  },
  {
    id: 'daily-wellbeing-check-in',
    title: 'Daily Wellbeing Check-In Sheet',
    category: 'Wellbeing',
    type: 'Toolkit',
    description: 'A simple daily mood tracker and check-in prompt for students and parents to open communication.',
    meta: 'PDF • 1 page • Downloadable',
    accessType: 'Downloadable PDF',
    href: '/resources?category=wellbeing',
    iconName: 'message',
    keywords: ['check in', 'mood tracker', 'wellbeing check', 'emotions tracker', 'daily prompt']
  },

  // SEND Resources
  {
    id: 'understanding-ehcps-parent-guide',
    title: 'Understanding EHCPs: A Complete Parent Guide',
    category: 'SEND',
    type: 'Guide',
    description: 'Clear, step-by-step guidance on Education, Health and Care Plans (EHCPs): how to apply, gathering evidence, and navigating annual reviews.',
    meta: 'Guide • 12 min read',
    accessType: 'Free',
    slug: 'understanding-ehcps-parent-guide',
    href: '/resources/understanding-ehcps-parent-guide',
    iconName: 'clipboard',
    keywords: ['ehcp', 'send', 'special educational needs', 'senco', 'education health care plan', 'local authority', 'parent guide', 'annual review', 'appeals']
  },
  {
    id: 'supporting-learning-at-home',
    title: 'Supporting SEND Learning at Home',
    category: 'SEND',
    type: 'Guide',
    description: 'Practical strategies, visual schedules, and sensory adaptations to create a calm, supportive home learning environment.',
    meta: 'Guide • 8 min read',
    accessType: 'Free',
    slug: 'supporting-learning-at-home',
    href: '/resources/supporting-learning-at-home',
    iconName: 'home',
    keywords: ['home learning', 'send home', 'adhd at home', 'autism support', 'visual schedule', 'routine', 'parenting send']
  },
  {
    id: 'preparing-for-school-meetings',
    title: 'Preparing for School SEND Meetings & Reviews',
    category: 'SEND',
    type: 'Checklist',
    description: 'A checklist and guide to help parents feel organized, confident, and heard during SENCO, teacher, and review meetings.',
    meta: 'Checklist • 6 min read',
    accessType: 'Free',
    slug: 'preparing-for-school-meetings',
    href: '/resources/preparing-for-school-meetings',
    iconName: 'users',
    keywords: ['school meeting', 'senco meeting', 'send meeting', 'advocacy', 'parent checklist', 'school support']
  },
  {
    id: 'send-for-parents',
    title: 'SEND Pathway for Parents',
    category: 'SEND',
    type: 'Pathway',
    description: 'Comprehensive advice, legal rights summaries, and practical tools to support your child with additional needs.',
    meta: 'Pathway Hub',
    accessType: 'Free',
    slug: 'send-for-parents',
    href: '/resources/send-for-parents',
    iconName: 'heart',
    keywords: ['send parents', 'parent support', 'neurodivergent child', 'advocating', 'send pathways']
  },
  {
    id: 'send-for-educators',
    title: 'SEND Strategies for Educators & Tutors',
    category: 'SEND',
    type: 'Pathway',
    description: 'Evidence-informed classroom adjustments, differentiated teaching methods, and neurodiversity-affirming practices.',
    meta: 'Pathway Hub',
    accessType: 'Free',
    slug: 'send-for-educators',
    href: '/resources/send-for-educators',
    iconName: 'graduation',
    keywords: ['send educators', 'teachers send', 'differentiation', 'inclusive education', 'classroom adjustments']
  },
  {
    id: 'send-support-checklist',
    title: 'SEND Support & Identification Checklist',
    category: 'SEND',
    type: 'Toolkit',
    description: 'A practical 2-page checklist for families and educators to observe learning differences and organize meeting notes.',
    meta: 'PDF • 2 pages • Downloadable',
    accessType: 'Downloadable PDF',
    href: '/resources?category=send',
    iconName: 'clipboard',
    keywords: ['send checklist', 'identification', 'symptoms', 'learning differences', 'printable send']
  },
  {
    id: 'sensory-regulation-toolkit',
    title: 'Sensory Regulation Toolkit',
    category: 'SEND',
    type: 'Toolkit',
    description: 'Actionable sensory break activities, calming techniques, and environmental adjustments for sensory processing needs.',
    meta: 'PDF • 3 pages • Downloadable',
    accessType: 'Downloadable PDF',
    href: '/resources?category=send',
    iconName: 'sparkles',
    keywords: ['sensory', 'sensory regulation', 'sensory processing', 'calming', 'autism sensory', 'adhd regulation', 'sensory toolkit']
  },
  {
    id: 'parent-meeting-prep-guide',
    title: 'Parent Meeting Preparation Toolkit',
    category: 'SEND',
    type: 'Toolkit',
    description: 'Printable worksheets to outline your child’s strengths, challenges, and requested adjustments before speaking with schools.',
    meta: 'PDF • 4 pages • Downloadable',
    accessType: 'Downloadable PDF',
    href: '/resources?category=send',
    iconName: 'users',
    keywords: ['meeting prep', 'parent meeting toolkit', 'advocacy toolkit', 'printable meeting planner']
  },
  {
    id: 'learning-support-planner',
    title: 'Learning Support & Goal Planner',
    category: 'SEND',
    type: 'Toolkit',
    description: 'A structured tracker to record targets, accommodations, intervention dates, and progress over time.',
    meta: 'PDF • 3 pages • Downloadable',
    accessType: 'Downloadable PDF',
    href: '/resources?category=send',
    iconName: 'calendar',
    keywords: ['support planner', 'targets', 'ieps', 'individual education plan', 'goal tracker']
  },

  // Study Tips & Revision
  {
    id: 'how-to-revise-effectively',
    title: 'How to Revise Effectively (Evidence-Based)',
    category: 'Study Tips',
    type: 'Guide',
    description: 'Move beyond passive highlighting. Discover scientifically proven revision strategies that dramatically improve long-term retention.',
    meta: 'Guide • 8 min read',
    accessType: 'Free',
    slug: 'how-to-revise-effectively',
    href: '/resources/how-to-revise-effectively',
    iconName: 'book',
    keywords: ['revision', 'how to revise', 'study smarter', 'revision techniques', 'spaced repetition', 'flashcards', 'exam study']
  },
  {
    id: 'active-recall-techniques',
    title: 'Active Recall & Spaced Repetition Guide',
    category: 'Study Tips',
    type: 'Guide',
    description: 'Learn how testing yourself, using the Feynman technique, and spacing reviews turns knowledge into effortless recall.',
    meta: 'Guide • 6 min read',
    accessType: 'Free',
    slug: 'active-recall-techniques',
    href: '/resources/active-recall-techniques',
    iconName: 'brain',
    keywords: ['active recall', 'spaced repetition', 'feynman technique', 'memory', 'study methods', 'flashcards', 'testing effect']
  },
  {
    id: 'managing-exam-pressure',
    title: 'Managing Exam Pressure & Test Anxiety',
    category: 'Study Tips',
    type: 'Guide',
    description: 'Practical techniques for staying calm under timed conditions, dealing with blank-mind moments, and pacing during exams.',
    meta: 'Guide • 7 min read',
    accessType: 'Free',
    slug: 'managing-exam-pressure',
    href: '/resources/managing-exam-pressure',
    iconName: 'message',
    keywords: ['exam pressure', 'test anxiety', 'exam panic', 'exam stress', 'calm in exams', 'timing exams']
  },
  {
    id: 'revision-timetable',
    title: 'Printable Revision Timetable Template',
    category: 'Study Tips',
    type: 'Toolkit',
    description: 'A customizable study schedule template with built-in rest breaks, spaced repetition slots, and subject color-coding.',
    meta: 'PDF • 1 page • Downloadable',
    accessType: 'Downloadable PDF',
    href: '/resources?category=study-tips',
    iconName: 'calendar',
    keywords: ['revision timetable', 'study schedule', 'timetable template', 'study planner', 'pdf revision']
  },
  {
    id: 'study-planner',
    title: 'Weekly Study & Homework Planner',
    category: 'Study Tips',
    type: 'Toolkit',
    description: 'Organize daily priorities, break down big assignments into bite-sized tasks, and track completed work.',
    meta: 'PDF • 2 pages • Downloadable',
    accessType: 'Downloadable PDF',
    href: '/resources?category=study-tips',
    iconName: 'clipboard',
    keywords: ['study planner', 'homework planner', 'assignment tracker', 'weekly planner']
  },
  {
    id: 'exam-countdown-tracker',
    title: 'Exam Countdown & Motivation Tracker',
    category: 'Study Tips',
    type: 'Toolkit',
    description: 'Keep study momentum high with visual milestone trackers, topic mastery checklists, and countdown logs.',
    meta: 'PDF • 1 page • Downloadable',
    accessType: 'Downloadable PDF',
    href: '/resources?category=study-tips',
    iconName: 'sparkles',
    keywords: ['exam countdown', 'milestone tracker', 'revision tracker', 'progress tracker']
  },

  // Articles & Educational Insights
  {
    id: 'why-cultural-literacy-matters',
    title: 'Why Cultural Literacy Matters in Modern Education',
    category: 'Articles & Insights',
    type: 'Article',
    description: 'Exploring how culturally responsive curricula foster belonging, engagement, and greater academic outcomes in diverse classrooms.',
    meta: 'Article • 7 min read',
    accessType: 'Free',
    slug: 'why-cultural-literacy-matters',
    href: '/resources/why-cultural-literacy-matters',
    iconName: 'newspaper',
    keywords: ['cultural literacy', 'inclusion', 'diversity in education', 'curriculum', 'belonging', 'articles']
  },
  {
    id: 'trauma-informed-behaviour',
    title: 'Rethinking Behaviour Through a Trauma-Informed Lens',
    category: 'Articles & Insights',
    type: 'Article',
    description: 'How understanding nervous system regulation transforms classroom management and student engagement.',
    meta: 'Research Article • 8 min read',
    accessType: 'Free',
    slug: 'trauma-informed-behaviour',
    href: '/resources/trauma-informed-behaviour',
    iconName: 'brain',
    keywords: ['trauma-informed', 'behaviour', 'classroom management', 'mental health', 'regulation', 'educators']
  },
  {
    id: 'creative-pedagogy-and-outcomes',
    title: 'Is Creative Pedagogy Being Lost in the Pursuit of Outcomes?',
    category: 'Articles & Insights',
    type: 'Article',
    description: 'Balancing standardized assessment demands with curiosity, creative problem solving, and intrinsic love for learning.',
    meta: 'Perspective • 6 min read',
    accessType: 'Free',
    slug: 'creative-pedagogy-and-outcomes',
    href: '/resources/creative-pedagogy-and-outcomes',
    iconName: 'lightbulb',
    keywords: ['creative pedagogy', 'curiosity', 'teaching methods', 'education debate', 'standardized testing']
  }
];

export const WEBINAR_OFFERINGS: WebinarOffering[] = [
  {
    id: 'webinar-anxiety-exams',
    title: 'Overcoming Exam Anxiety & Building Academic Confidence',
    description: 'Specialist-led webinar for parents and secondary students on nervous system regulation and stress reduction before mock exams.',
    audience: 'Parents & Students',
    dateStr: 'Upcoming Live Event',
    timeStr: '60m Interactive Session',
    speaker: 'Dr. Sarah Jenkins (Child Psychologist)',
    price: 0,
    isIncludedWithMembership: true,
    href: '/webinars',
    keywords: ['anxiety webinar', 'exam anxiety', 'wellbeing webinar', 'stress webinar', 'live session']
  },
  {
    id: 'webinar-send-navigation',
    title: 'Navigating the EHCP Process: From Application to Provision',
    description: 'Practical walkthrough with an experienced SEND advocate on securing correct school adjustments and EHCP funding.',
    audience: 'Parents & Carers',
    dateStr: 'On-Demand & Live Recording',
    timeStr: '75m Workshop',
    speaker: 'SEND Advocacy Team',
    price: 25,
    isIncludedWithMembership: true,
    href: '/webinars',
    keywords: ['send webinar', 'ehcp webinar', 'parent workshop', 'special needs webinar']
  },
  {
    id: 'webinar-active-recall',
    title: 'Supercharge Your Study Skills: Science-Backed Revision',
    description: 'Interactive masterclass on active recall, spaced repetition systems, and how to craft a realistic GCSE / A-Level revision schedule.',
    audience: 'Students (Years 10-13)',
    dateStr: 'Live Masterclass',
    timeStr: '45m Session + Q&A',
    speaker: 'Lead Academic Mentor',
    price: 15,
    isIncludedWithMembership: true,
    href: '/webinars',
    keywords: ['study skills webinar', 'revision masterclass', 'gcse masterclass', 'a level revision']
  }
];

export interface SearchResults {
  query: string;
  subjects: SubjectOffering[];
  resources: ResourceOffering[];
  webinars: WebinarOffering[];
  totalMatches: number;
}

export function searchSkillSpace(query: string): SearchResults {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    return {
      query,
      subjects: SUBJECT_OFFERINGS.slice(0, 4),
      resources: RESOURCE_OFFERINGS.slice(0, 6),
      webinars: WEBINAR_OFFERINGS,
      totalMatches: SUBJECT_OFFERINGS.length + RESOURCE_OFFERINGS.length + WEBINAR_OFFERINGS.length
    };
  }

  const queryTerms = clean.split(/\s+/).filter(Boolean);

  const matchesText = (text: string) => {
    const lower = text.toLowerCase();
    return queryTerms.some(term => lower.includes(term));
  };

  const matchesKeywords = (keywords: string[]) => {
    return queryTerms.some(term =>
      keywords.some(k => k.toLowerCase().includes(term) || term.includes(k.toLowerCase()))
    );
  };

  const matchingSubjects = SUBJECT_OFFERINGS.filter(s => {
    return (
      matchesText(s.title) ||
      matchesText(s.category) ||
      matchesText(s.description) ||
      s.levels.some(l => matchesText(l)) ||
      s.coverage.some(c => matchesText(c)) ||
      matchesKeywords(s.keywords)
    );
  });

  const matchingResources = RESOURCE_OFFERINGS.filter(r => {
    return (
      matchesText(r.title) ||
      matchesText(r.category) ||
      matchesText(r.type) ||
      matchesText(r.description) ||
      matchesKeywords(r.keywords)
    );
  });

  const matchingWebinars = WEBINAR_OFFERINGS.filter(w => {
    return (
      matchesText(w.title) ||
      matchesText(w.description) ||
      matchesText(w.audience) ||
      matchesText(w.speaker) ||
      matchesKeywords(w.keywords)
    );
  });

  return {
    query,
    subjects: matchingSubjects,
    resources: matchingResources,
    webinars: matchingWebinars,
    totalMatches: matchingSubjects.length + matchingResources.length + matchingWebinars.length
  };
}
