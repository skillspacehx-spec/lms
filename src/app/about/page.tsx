"use client";

import Image from "next/image";
import Button from "../../components/common/Button";
import {
  Users,
  Award,
  Globe,
  Heart,
  Target,
  TrendingUp,
  BookOpen,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleJoinUs = () => {
    if (!user) {
      router.push("/register");
    } else {
      router.push("/tutors");
    }
  };

  const handleFindTutor = () => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/tutors");
    }
  };

  const values = [
    "Student-centered approach puts success first",
    "Excellence in tutor quality and outcomes",
    "Accessibility for every child, everywhere",
    "Safety with DBS-checked verified tutors",
    "Personalized learning plans for each student",
    "Regular progress tracking and feedback",
  ];

  const achievements = [
    "10,000+ students helped to success",
    "500+ expert DBS-checked tutors",
    "50,000+ completed learning sessions",
    "98% student satisfaction rate",
    "Award-winning online platform",
    "UK-wide educational coverage",
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-4">
        {/* Main Hero Section - Home page style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16 lg:mb-20">
          {/* Left Content */}
          <div>
            <span className="inline-block py-2 px-5 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 uppercase">
              ABOUT SKILL SHARE
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#191919] mb-6 leading-tight">
              Empowering Every Child To Reach Their Full Potential
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Founded in 2020 by experienced educators and parents, Skill Space
              Learning Hub was created to make quality tutoring accessible,
              affordable, and effective for every family across the UK.
            </p>

            {/* Our Values Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-[#E9E2FF] p-6 rounded-xl">
                <h4 className="font-bold text-[#191919] mb-2 text-base">
                  Student-Centered
                </h4>
                <p className="text-base text-gray-600">
                  Every decision puts
                  <br />
                  student success first
                </p>
              </div>
              <div className="bg-[#E9E2FF] p-6 rounded-xl">
                <h4 className="font-bold text-[#191919] mb-2 text-base">
                  Excellence
                </h4>
                <p className="text-base text-gray-600">
                  Highest standards for
                  <br />
                  tutor quality & outcomes
                </p>
              </div>
              <div className="bg-[#E9E2FF] p-6 rounded-xl">
                <h4 className="font-bold text-[#191919] mb-2 text-base">
                  Accessibility
                </h4>
                <p className="text-base text-gray-600">
                  Quality education for
                  <br />
                  every child, everywhere
                </p>
              </div>
              <div className="bg-[#E9E2FF] p-6 rounded-xl">
                <h4 className="font-bold text-[#191919] mb-2 text-base">
                  Safety First
                </h4>
                <p className="text-base text-gray-600">
                  DBS-checked &<br />
                  verified tutors
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
                  Find Your Tutor
                </Button>
                <Button
                  onClick={handleJoinUs}
                  className="!bg-[#191919] !text-white hover:!bg-gray-800 !border-[#191919]"
                >
                  Join Our Team
                </Button>
              </div>
            </div>
          </div>

          {/* Right Image with floating elements */}
          <div className="relative">
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
              <Image
                src="/assets/images/stat-right.png"
                alt="About Skill Space"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Stats Bar - Home page style */}
        <div className="relative py-8 md:py-12 lg:py-16 rounded-[60px] md:rounded-[100px] lg:rounded-[150px] overflow-hidden mb-12 md:mb-16 lg:mb-20">
          <Image
            src="/assets/images/stats-bg.png"
            alt="Stats Background"
            fill
            className="object-cover"
          />

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-4 md:px-8 lg:px-16">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-[#191919]" />
              </div>
              <div className="text-left">
                <span className="block text-2xl md:text-3xl lg:text-4xl font-black text-[#191919]">
                  10K+
                </span>
                <span className="text-xs md:text-sm font-medium text-[#191919]">
                  Students Helped
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-[#191919]" />
              </div>
              <div className="text-left">
                <span className="block text-2xl md:text-3xl lg:text-4xl font-black text-[#191919]">
                  500+
                </span>
                <span className="text-xs md:text-sm font-medium text-[#191919]">
                  Expert Tutors
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 md:w-7 md:h-7 text-[#191919]" />
              </div>
              <div className="text-left">
                <span className="block text-2xl md:text-3xl lg:text-4xl font-black text-[#191919]">
                  98%
                </span>
                <span className="text-xs md:text-sm font-medium text-[#191919]">
                  Satisfaction
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-[#191919]" />
              </div>
              <div className="text-left">
                <span className="block text-2xl md:text-3xl lg:text-4xl font-black text-[#191919]">
                  50K+
                </span>
                <span className="text-xs md:text-sm font-medium text-[#191919]">
                  Sessions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block py-2 px-5 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 uppercase">
              OUR STORY
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#191919] leading-tight">
              From Vision to Reality
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6">
              <p className="text-gray-600 text-lg leading-relaxed">
                Skill Space Learning Hub was born from a simple observation:
                traditional tutoring was too expensive, inflexible, and
                inaccessible for most families.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Founded in 2020 by experienced educators and parents, we set out
                to create a platform that would connect qualified tutors with
                students in a way that was affordable, flexible, and most
                importantly, effective.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we're proud to serve thousands of families across the UK,
                helping children excel in their studies while supporting parents
                with resources and guidance.
              </p>

              {/* Achievement List */}
              <div className="bg-[#F8F9FA] rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#191919] mb-4">
                  What We've Achieved
                </h3>
                <ul className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-[#7AC2F9] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#E9E2FF] to-[#F0F4FF] rounded-2xl p-8 md:p-12">
              <div className="text-center">
                <BookOpen className="w-24 h-24 md:w-32 md:h-32 text-[#7AC2F9] mx-auto mb-6 opacity-80" />
                <h3 className="text-2xl md:text-3xl font-bold text-[#191919] mb-4">
                  Our Vision
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  To make quality education accessible to every child,
                  regardless of location or circumstance.
                </p>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-semibold text-[#7AC2F9] text-lg">
                    "Every child deserves the opportunity to reach their full
                    potential"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        {/* <div className="mb-12 md:mb-16 lg:mb-20">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block py-2 px-5 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 uppercase">
              OUR JOURNEY
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#191919] leading-tight">
              Milestones That Shaped Us
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { year: '2020', event: 'Skill Space Founded', description: 'Started with vision to transform online tutoring' },
              { year: '2021', event: '100 Tutors Milestone', description: 'Expanded our network of qualified educators' },
              { year: '2022', event: 'Parent Hub Launched', description: 'Introduced comprehensive parent resources' },
              { year: '2023', event: '10,000 Students Reached', description: 'Helped thousands achieve their potential' },
              { year: '2024', event: 'Award Recognition', description: 'Named Best Online Tutoring Platform' },
              { year: '2025', event: 'National Expansion', description: 'Now serving students across entire UK' }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 md:p-8 border-2 border-[#E9E2FF] rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:border-[#7AC2F9]">
                <div className="inline-block bg-[#7AC2F9] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
                  {item.year}
                </div>
                <h3 className="text-xl font-bold text-[#191919] mb-2">{item.event}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Leadership Team */}
        <div className="text-center">
          <span className="inline-block py-2 px-5 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 uppercase">
            LEADERSHIP TEAM
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#191919] leading-tight mb-8 md:mb-12">
            Meet Our Educational Leaders
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
            {[
              {
                name: "Sarah Mitchell",
                role: "Founder & CEO",
                bio: "Former headteacher with 20 years in education",
              },
              {
                name: "Dr. Educational Expert",
                role: "Head of Curriculum",
                bio: "PhD in Education, Cambridge University",
              },
              {
                name: "Emma Thompson",
                role: "Tutor Relations Director",
                bio: "Specialist in teacher training development",
              },
              {
                name: "Michael Davies",
                role: "Technology Director",
                bio: "Expert in EdTech innovation",
              },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-white p-6 border-2 border-[#E9E2FF] rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:border-[#7AC2F9]"
              >
                <div className="relative mb-4 mx-auto w-24 h-24 bg-gradient-to-br from-[#7AC2F9] to-blue-400 rounded-full flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#191919] mb-1">
                  {member.name}
                </h3>
                <p className="text-[#7AC2F9] font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-br from-[#E9E2FF] to-[#F0F4FF] rounded-2xl p-8 md:p-12">
            <h3 className="text-3xl md:text-4xl font-bold text-[#191919] mb-6">
              Join Our Educational Community
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Whether you're a parent looking for tutoring or an educator
              wanting to make a difference, we'd love to have you join our
              mission.
            </p>
            <div className="flex justify-center">
              <div className="flex flex-row gap-4">
                <Button
                  onClick={handleFindTutor}
                  className="!bg-[#7AC2F9] !text-[#191919] hover:!bg-[#6AB4ED] !border-[#7AC2F9]"
                >
                  Find a Tutor
                </Button>
                <Button
                  onClick={handleJoinUs}
                  className="!bg-[#191919] !text-white hover:!bg-gray-800 !border-[#191919]"
                >
                  Become a Tutor
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
