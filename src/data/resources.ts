export type IconName =
  | 'book'
  | 'brain'
  | 'calendar'
  | 'clipboard'
  | 'file'
  | 'graduation'
  | 'heart'
  | 'home'
  | 'lightbulb'
  | 'message'
  | 'newspaper'
  | 'search'
  | 'shield'
  | 'sparkles'
  | 'target'
  | 'trending'
  | 'users';

export type ResourceItem = {
  title: string;
  description: string;
  meta?: string;
  icon: IconName;
  href?: string;
  slug?: string;
  category?: string;
};

export type TopicItem = ResourceItem & {
  href: string;
  accent: string;
};

export type ResourcePageData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  heroImage: string;
  primaryCta: string;
  secondaryCta: string;
  featuredTitle?: string;
  featured: ResourceItem[];
  topicsTitle?: string;
  topics: TopicItem[];
  toolkitTitle?: string;
  toolkit: ResourceItem[];
  support: TopicItem[];
};

const resourceHref = (slug: string) => `/resources/${slug}`;

const commonSupport: TopicItem[] = [
  {
    title: 'Explore Tutoring',
    description: 'Get personalised support from experienced tutors.',
    href: '/tutoring',
    icon: 'graduation',
    accent: 'bg-blue-50',
  },
  {
    title: 'Browse Courses',
    description: 'Find practical courses for learners, parents, and educators.',
    href: '/courses',
    icon: 'book',
    accent: 'bg-green-50',
  },
  {
    title: 'Contact the Team',
    description: 'Ask us a question and we will point you in the right direction.',
    href: '/contact',
    icon: 'message',
    accent: 'bg-violet-50',
  },
];

export const pages = {
  articles: {
    eyebrow: 'Articles & Insights',
    title: 'Ideas. Evidence. Better Education.',
    subtitle: 'Thought-provoking perspectives, research summaries, evidence-informed practice, and emerging trends shaping modern education.',
    heroImage: 'https://images.unsplash.com/photo-1614849963640-9cc74b2a826f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    primaryCta: 'Read insights',
    secondaryCta: 'Browse topics',
    featuredTitle: '',
    featured: [
      { title: 'Why Cultural Literacy Matters in Modern Education', description: 'Exploring how schools can create more inclusive and representative learning environments.', meta: 'Insight - 7 min read', icon: 'newspaper', slug: 'why-cultural-literacy-matters', href: resourceHref('why-cultural-literacy-matters'), category: 'Articles & Insights' },
      { title: 'Rethinking Behaviour Through a Trauma-Informed Lens', description: 'How educators can build safer, more supportive learning environments.', meta: 'Research - 8 min read', icon: 'brain', slug: 'trauma-informed-behaviour', href: resourceHref('trauma-informed-behaviour'), category: 'Articles & Insights' },
      { title: 'Is Creative Pedagogy Being Lost in the Pursuit of Outcomes?', description: 'Balancing accountability, engagement, and innovation in classrooms.', meta: 'Perspective - 6 min read', icon: 'lightbulb', slug: 'creative-pedagogy-and-outcomes', href: resourceHref('creative-pedagogy-and-outcomes'), category: 'Articles & Insights' },
    ],
    topicsTitle: '',
    topics: [
      { title: 'Educational Insights', description: 'Teaching, learning, curriculum design, and educational practice.', href: resourceHref('educational-insights'), icon: 'book', accent: 'bg-blue-50', slug: 'educational-insights', category: 'Articles & Insights' },
      { title: 'Research & Evidence', description: 'Clear summaries of emerging research and what it means for learners.', href: resourceHref('research-and-evidence'), icon: 'search', accent: 'bg-emerald-50', slug: 'research-and-evidence', category: 'Articles & Insights' },
      { title: 'Trends in Education', description: 'New developments, innovations, and sector challenges.', href: resourceHref('trends-in-education'), icon: 'trending', accent: 'bg-amber-50', slug: 'trends-in-education', category: 'Articles & Insights' },
    ],
    toolkitTitle: '',
    toolkit: [
      { title: 'Student Voice in Learning', description: 'Why listening to learners improves engagement.', meta: 'PDF - 3 pages', icon: 'users' },
      { title: 'Effective Feedback', description: 'Strategies that move learning forward.', meta: 'PDF - 2 pages', icon: 'clipboard' },
      { title: 'Belonging in Schools', description: 'Practical ways to build inclusive culture.', meta: 'PDF - 4 pages', icon: 'heart' },
      { title: 'Professional Development', description: 'Helping educators adapt and grow.', meta: 'PDF - 3 pages', icon: 'graduation' },
    ],
    support: commonSupport,
  },
  send: {
    eyebrow: 'SEND Resources',
    title: 'Practical support for families, educators and schools.',
    subtitle: 'Accessible guidance, downloadable toolkits, and evidence-informed resources for children and young people with additional needs.',
    heroImage: 'https://images.unsplash.com/photo-1761266158207-26a70892763d?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    primaryCta: 'Explore resources',
    secondaryCta: 'Browse toolkits',
    featuredTitle: 'Popular SEND resources',
    featured: [
      { title: 'Understanding EHCPs: A Parent Guide', description: 'What to know about EHCPs and how to navigate the process.', meta: 'Guide - 12 min read', icon: 'clipboard', slug: 'understanding-ehcps-parent-guide', href: resourceHref('understanding-ehcps-parent-guide'), category: 'SEND Resources' },
      { title: 'Supporting Learning at Home', description: 'Practical strategies to build confidence and support learning every day.', meta: 'Guide - 8 min read', icon: 'home', slug: 'supporting-learning-at-home', href: resourceHref('supporting-learning-at-home'), category: 'SEND Resources' },
      { title: 'Preparing for School Meetings', description: 'Tips and checklists to help families feel confident and prepared.', meta: 'Checklist - 6 min read', icon: 'users', slug: 'preparing-for-school-meetings', href: resourceHref('preparing-for-school-meetings'), category: 'SEND Resources' },
    ],
    topicsTitle: 'Support pathways',
    topics: [
      { title: 'For Parents', description: 'Guidance and practical strategies to support your child with confidence.', href: resourceHref('send-for-parents'), icon: 'heart', accent: 'bg-emerald-50', slug: 'send-for-parents', category: 'SEND Resources' },
      { title: 'For Educators', description: 'Evidence-informed strategies for inclusive learning environments.', href: resourceHref('send-for-educators'), icon: 'graduation', accent: 'bg-violet-50', slug: 'send-for-educators', category: 'SEND Resources' },
      { title: 'For Schools', description: 'Tools for meetings, planning, and whole-school support.', href: resourceHref('send-for-schools'), icon: 'clipboard', accent: 'bg-blue-50', slug: 'send-for-schools', category: 'SEND Resources' },
    ],
    toolkitTitle: 'Downloadable toolkits',
    toolkit: [
      { title: 'SEND Support Checklist', description: 'A quick checklist for parents and educators.', meta: 'PDF - 2 pages', icon: 'clipboard' },
      { title: 'Parent Meeting Preparation Guide', description: 'Plan ahead and make the most of school meetings.', meta: 'PDF - 4 pages', icon: 'users' },
      { title: 'Learning Support Planner', description: 'Track support goals and strategies effectively.', meta: 'PDF - 3 pages', icon: 'calendar' },
      { title: 'Sensory Regulation Toolkit', description: 'Practical activities for home and school.', meta: 'PDF - 3 pages', icon: 'sparkles' },
    ],
    support: commonSupport,
  },
  study: {
    eyebrow: 'Study Tips & Guides',
    title: 'Practical tools to study smarter.',
    subtitle: 'Study strategies, revision resources, planning tools, and exam preparation support for learners.',
    heroImage: 'https://images.unsplash.com/photo-1583468982228-19f19164aee2?q=80&w=1011&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    primaryCta: 'Explore guides',
    secondaryCta: 'Browse toolkit',
    featuredTitle: 'Featured study resources',
    featured: [
      { title: 'How to Revise Effectively', description: 'Evidence-based revision techniques that actually work.', meta: 'Guide - 8 min read', icon: 'book', slug: 'how-to-revise-effectively', href: resourceHref('how-to-revise-effectively'), category: 'Study Tips & Guides' },
      { title: 'Active Recall Techniques', description: 'Improve memory and understanding with powerful learning strategies.', meta: 'Guide - 6 min read', icon: 'brain', slug: 'active-recall-techniques', href: resourceHref('active-recall-techniques'), category: 'Study Tips & Guides' },
      { title: 'Managing Exam Pressure', description: 'Practical tips to stay calm, confident, and in control.', meta: 'Guide - 7 min read', icon: 'message', slug: 'managing-exam-pressure', href: resourceHref('managing-exam-pressure'), category: 'Study Tips & Guides' },
    ],
    topicsTitle: 'Browse by topic',
    topics: [
      { title: 'Study Skills', description: 'Build essential skills to learn effectively and boost confidence.', href: resourceHref('study-skills'), icon: 'graduation', accent: 'bg-emerald-50', slug: 'study-skills', category: 'Study Tips & Guides' },
      { title: 'Planning & Organisation', description: 'Plan your time, set goals, and stay organised.', href: resourceHref('planning-and-organisation'), icon: 'calendar', accent: 'bg-violet-50', slug: 'planning-and-organisation', category: 'Study Tips & Guides' },
      { title: 'Exam Preparation', description: 'Get exam-ready with checklists, strategies, and expert tips.', href: resourceHref('exam-preparation'), icon: 'clipboard', accent: 'bg-amber-50', slug: 'exam-preparation', category: 'Study Tips & Guides' },
    ],
    toolkitTitle: 'Downloadable toolkit',
    toolkit: [
      { title: 'Revision Timetable', description: 'Plan your revision and stay on schedule.', meta: 'PDF - 1 page', icon: 'calendar' },
      { title: 'Study Planner', description: 'Organise your week and daily study goals.', meta: 'PDF - 2 pages', icon: 'clipboard' },
      { title: 'Goal Setting Worksheet', description: 'Set goals and create a plan to achieve them.', meta: 'PDF - 1 page', icon: 'target' },
      { title: 'Exam Countdown Tracker', description: 'Track progress and stay motivated.', meta: 'PDF - 1 page', icon: 'sparkles' },
    ],
    support: commonSupport,
  },
  wellbeing: {
    eyebrow: 'Wellbeing Resources',
    title: 'Your personal wellbeing hub.',
    subtitle: 'Guidance, tools, and resources that support emotional wellbeing, personal development, and healthy digital habits.',
    heroImage: 'https://images.unsplash.com/photo-1709301264789-0f8392d72627?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    primaryCta: 'Explore resources',
    secondaryCta: 'Browse toolkit',
    featuredTitle: 'Featured wellbeing resources',
    featured: [
      { title: 'Building Confidence in Young People', description: 'Practical strategies to build self-belief every day.', meta: 'Guide - 8 min read', icon: 'heart', slug: 'building-confidence-in-young-people', href: resourceHref('building-confidence-in-young-people'), category: 'Wellbeing Resources' },
      { title: 'Managing Stress & Anxiety', description: 'Simple techniques to feel calmer and more in control.', meta: 'Guide - 7 min read', icon: 'brain', slug: 'managing-stress-and-anxiety', href: resourceHref('managing-stress-and-anxiety'), category: 'Wellbeing Resources' },
      { title: 'Developing Resilience', description: 'Build resilience and bounce back from challenges.', meta: 'Guide - 6 min read', icon: 'sparkles', slug: 'developing-resilience', href: resourceHref('developing-resilience'), category: 'Wellbeing Resources' },
    ],
    topicsTitle: 'Browse by topic',
    topics: [
      { title: 'Emotional Wellbeing', description: 'Understand emotions, manage stress, and build self-esteem.', href: resourceHref('emotional-wellbeing'), icon: 'heart', accent: 'bg-rose-50', slug: 'emotional-wellbeing', category: 'Wellbeing Resources' },
      { title: 'Personal Development', description: 'Set goals, communicate clearly, and grow with confidence.', href: resourceHref('personal-development'), icon: 'target', accent: 'bg-emerald-50', slug: 'personal-development', category: 'Wellbeing Resources' },
      { title: 'Digital Wellbeing & Online Safety', description: 'Healthy screen habits, online safety, and digital balance.', href: resourceHref('digital-wellbeing-and-online-safety'), icon: 'shield', accent: 'bg-blue-50', slug: 'digital-wellbeing-and-online-safety', category: 'Wellbeing Resources' },
    ],
    toolkitTitle: 'Wellbeing toolkit',
    toolkit: [
      { title: 'Reflection Journal', description: 'Reflect on thoughts, feelings, and experiences.', meta: 'PDF - 3 pages', icon: 'file' },
      { title: 'Gratitude Worksheet', description: 'Focus on positives and build gratitude.', meta: 'PDF - 1 page', icon: 'heart' },
      { title: 'Goal Setting Planner', description: 'Set goals and create a plan.', meta: 'PDF - 2 pages', icon: 'target' },
      { title: 'Daily Wellbeing Check-In', description: 'A quick daily check-in for your wellbeing.', meta: 'PDF - 1 page', icon: 'message' },
    ],
    support: commonSupport,
  },
} satisfies Record<string, ResourcePageData>;

export const readableResources: ResourceItem[] = Object.values(pages).flatMap((page) => [
  ...page.featured,
  ...page.topics,
]);

export function getReadableResource(slug: string) {
  return readableResources.find((resource) => resource.slug === slug);
}
