'use client';

import Image from 'next/image';
import Button from '../../components/common/Button';
import { TrendingUp, Award, CheckCircle, Star, Trophy, Users, GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProgressPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleFindTutor = () => {
    if (!user) {
      router.push('/login');
    } else {
      router.push('/tutors');
    }
  };

  const handleLearnMore = () => {
    router.push('/about');
  };

  // Progress stats for visual impact
  const progressStats = [
    { icon: <Users className="w-6 h-6" />, value: '10,000+', label: 'Students Helped' },
    { icon: <GraduationCap className="w-6 h-6" />, value: '95%', label: 'Pass Rate' },
    { icon: <BookOpen className="w-6 h-6" />, value: '2.5', label: 'Avg Grade Improvement' },
    { icon: <Trophy className="w-6 h-6" />, value: '98%', label: 'Satisfaction' }
  ];

  // Student testimonials with measurable results
  const testimonials = [
    {
      name: 'Emily Chen',
      grade: 'Year 11',
      subject: 'Mathematics',
      improvement: 'Grade 5 → Grade 9',
      duration: '6 months',
      quote: 'My tutor helped me understand algebra in a way that finally clicked. I went from struggling to loving maths!',
      avatar: 'E'
    },
    {
      name: 'James Wilson',
      grade: 'Year 6',
      subject: '11+ Preparation',
      improvement: 'Failed Mock → Grammar School Pass',
      duration: '4 months',
      quote: 'The personalized study plan made all the difference. Now I\'m at my dream school!',
      avatar: 'J'
    },
    {
      name: 'Sophie Taylor',
      grade: 'Year 13',
      subject: 'Chemistry',
      improvement: 'Grade C → A*',
      duration: '8 months',
      quote: 'The exam techniques I learned were game-changing. Chemistry became my strongest subject.',
      avatar: 'S'
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-4">
        {/* Main Section - Home page style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16 lg:mb-20">
          {/* Left Content */}
          <div>
            <span className="inline-block py-2 px-5 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 uppercase">
              PROVEN PROGRESS
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#191919] mb-6 leading-tight">
              Real Results, Measurable Success Stories
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              See how our personalized teaching method delivers consistent academic improvements. We track every student's progress and celebrate their achievements.
            </p>

            {/* Key Achievement Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-[#E9E2FF] p-6 rounded-xl">
                <h4 className="font-bold text-[#191919] mb-2 text-base">GCSE Excellence</h4>
                <p className="text-base text-gray-600">
                  95% achieve Grade 7+<br />in target subjects
                </p>
              </div>
              <div className="bg-[#E9E2FF] p-6 rounded-xl">
                <h4 className="font-bold text-[#191919] mb-2 text-base">A-Level Success</h4>
                <p className="text-base text-gray-600">
                  92% achieve A* or A<br />grades after tutoring
                </p>
              </div>
              <div className="bg-[#E9E2FF] p-6 rounded-xl">
                <h4 className="font-bold text-[#191919] mb-2 text-base">11+ Pass Rate</h4>
                <p className="text-base text-gray-600">
                  88% pass grammar<br />school entrance exams
                </p>
              </div>
              <div className="bg-[#E9E2FF] p-6 rounded-xl">
                <h4 className="font-bold text-[#191919] mb-2 text-base">Grade Improvement</h4>
                <p className="text-base text-gray-600">
                  2.5 average grades<br />improved in 10 sessions
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex justify-end">
              <div className="flex flex-row gap-4">
                <Button
                  onClick={handleFindTutor}
                  className="!bg-[#7AC2F9] !text-[#191919] hover:!bg-[#6AB4ED] !border-[#7AC2F9]"
                >
                  Start Your Journey
                </Button>
                {/* <Button
                  onClick={handleLearnMore}
                  className="!bg-[#191919] !text-white hover:!bg-gray-800 !border-[#191919]"
                >
                  Learn More
                </Button> */}
              </div>
            </div>
          </div>

          {/* Right Image with floating elements */}
          <div className="relative">
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
              <Image
                src="/assets/images/stat-right.png"
                alt="Student Success"
                fill
                className="object-cover rounded-2xl"
              />
              
              {/* Floating Success Card */}
              {/* <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7AC2F9] to-blue-400 rounded-full flex items-center justify-center text-white">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Success Story</h4>
                    <span className="text-xs bg-[#E9E2FF] text-[#191919] px-2 py-1 rounded-md font-semibold">12 weeks</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">Grade 4 → 8</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">GCSE Maths</span>
                    </div>
                  </div>
                </div>
              </div> */}

               
            </div>
          </div>
        </div>

        {/* Stats Bar - Home page style with stats background */}
        <div className="relative py-8 md:py-12 lg:py-16 rounded-[60px] md:rounded-[100px] lg:rounded-[150px] overflow-hidden mb-12 md:mb-16 lg:mb-20">
          <Image
            src="/assets/images/stats-bg.png"
            alt="Stats Background"
            fill
            className="object-cover"
          />
          
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-4 md:px-8 lg:px-16">
            {progressStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="text-[#191919]">{stat.icon}</div>
                </div>
                <div className="text-left">
                  <span className="block text-2xl md:text-3xl lg:text-4xl font-black text-[#191919]">{stat.value}</span>
                  <span className="text-xs md:text-sm font-medium text-[#191919]">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section - Home page style */}
        <div>
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block py-2 px-5 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 uppercase">
              SUCCESS STORIES
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#191919] leading-tight">
              What Our Students Achieve
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 md:p-8 border-2 border-[#E9E2FF] rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden hover:border-[#7AC2F9]">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E9E2FF]/20 rounded-full -translate-y-16 translate-x-16"></div>
                
                {/* Improvement badge */}
                <div className="inline-block bg-green-100 text-green-700 text-sm font-bold px-4 py-2 rounded-full mb-4">
                  {testimonial.improvement}
                </div>
                
                {/* Star rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[#7AC2F9] fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed relative z-10">
                  "{testimonial.quote}"
                </p>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 p-4 bg-[#E9E2FF]/30 rounded-xl">
                    <div className="w-12 h-12 bg-[#7AC2F9] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#191919]">{testimonial.name}</h4>
                      <p className="text-sm text-[#7AC2F9] font-semibold">{testimonial.grade} • {testimonial.subject}</p>
                      <p className="text-xs text-gray-600">{testimonial.duration} journey</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Method Section */}
        <div className="mt-12 md:mt-16 lg:mt-20 text-center">
          <div className="bg-gradient-to-br from-[#E9E2FF] to-[#F0F4FF] rounded-2xl p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-bold text-[#191919] mb-16">
                Our Personalized Teaching Method
              </h3>
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#7AC2F9] rounded-full flex items-center justify-center text-white mx-auto mb-4">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h4 className="font-bold text-[#191919] mb-2">Assessment & Goal Setting</h4>
                  <p className="text-gray-600">We identify gaps and set clear, measurable targets</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#7AC2F9] rounded-full flex items-center justify-center text-white mx-auto mb-4">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h4 className="font-bold text-[#191919] mb-2">Customized Learning Plan</h4>
                  <p className="text-gray-600">Tailored lessons that adapt to learning style and pace</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#7AC2F9] rounded-full flex items-center justify-center text-white mx-auto mb-4">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h4 className="font-bold text-[#191919] mb-2">Progress Tracking</h4>
                  <p className="text-gray-600">Regular assessments to measure improvement and adjust approach</p>
                </div>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                This systematic approach ensures every student receives the exact support they need to reach their academic potential, with progress measured every step of the way.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
