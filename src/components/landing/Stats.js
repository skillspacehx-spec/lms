"use client";

import Image from "next/image";
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Stats = () => {
  const sectionRef = useRef(null);
  const statsRef = useRef([]);
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animations
      gsap.from(".stats-subtitle", {
        scrollTrigger: {
          trigger: ".stats-subtitle",
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        y: -30,
        duration: 0.6,
        ease: "power3.out",
      });

      gsap.from(".stats-title", {
        scrollTrigger: {
          trigger: ".stats-title",
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from(".stats-description", {
        scrollTrigger: {
          trigger: ".stats-description",
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.3,
        ease: "power3.out",
      });

      // Stats cards simple animation with counter
      gsap.fromTo(
        ".stat-card",
        {
          opacity: 0,
          y: 50,
          scale: 0.8,
        },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
            onEnter: () => {
              // Counter animation for all cards
              statsRef.current.forEach((statElement, index) => {
                if (statElement) {
                  const text = statElement.textContent;
                  const isPercentage = text.includes("%");
                  const hasK = text.includes("k");
                  const number = parseInt(text.replace(/[^0-9]/g, ""));

                  if (!isNaN(number)) {
                    gsap.fromTo(
                      statElement,
                      { textContent: 0 },
                      {
                        textContent: number,
                        duration: 2,
                        delay: index * 0.15,
                        ease: "power2.out",
                        snap: { textContent: 1 },
                        onUpdate: function () {
                          const current = Math.ceil(
                            this.targets()[0].textContent,
                          );
                          if (isPercentage) {
                            statElement.textContent = `${current}%`;
                          } else if (hasK) {
                            statElement.textContent = `${current}k+`;
                          } else {
                            statElement.textContent = `${current}+`;
                          }
                        },
                      },
                    );
                  }
                }
              });
            },
          },
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
        },
      );

      // Feature cards animation
      gsap.fromTo(
        ".feature-card",
        {
          opacity: 0,
          y: 30,
        },
        {
          scrollTrigger: {
            trigger: ".feature-card",
            start: "top 85%",
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        },
      );

      // Right image animation
      gsap.from(".stats-image", {
        scrollTrigger: {
          trigger: ".stats-image",
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        x: 30,
        duration: 0.8,
        ease: "power2.out",
      });

      // Testimonial cards animation
      gsap.fromTo(
        ".testimonial-card",
        {
          opacity: 0,
          y: 40,
        },
        {
          scrollTrigger: {
            trigger: ".testimonial-card",
            start: "top 85%",
            once: true,
          },
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power2.out",
        },
      );

      // Testimonial header animation
      gsap.from(".testimonial-header", {
        scrollTrigger: {
          trigger: ".testimonial-header",
          start: "top 85%",
          once: true,
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-12 md:py-16 lg:py-20 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Top Section with Image and Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16 lg:mb-20">
          {/* Left Content */}
          <div>
            <span className="stats-subtitle inline-block py-2 px-5 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 uppercase">
              WHY CHOOSE US
            </span>
            <h2 className="stats-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#191919] mb-4 md:mb-6 leading-tight">
              Building Confident, Lifelong Learners
            </h2>
            <p className="stats-description text-gray-600 mb-8 leading-relaxed">
              Skill Space is a modern learning platform designed to support
              students, families, and educators. Through expert tutoring,
              practical courses, and real-world learning resources, we help
              learners build knowledge, confidence, and skills that last beyond
              the classroom.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="feature-card bg-[#E9E2FF] p-4 md:p-6 rounded-xl">
                <h4 className="font-bold text-[#191919] mb-2 text-sm md:text-base">
                  Expert Educators
                </h4>
                <p className="text-sm md:text-base text-gray-600">
                  Learn from tutors, teachers, and youth practitioners
                  experienced in supporting young people and helping them
                  achieve their potential.
                </p>
              </div>
              <div className="feature-card bg-[#E9E2FF] p-4 md:p-6 rounded-xl">
                <h4 className="font-bold text-[#191919] mb-2 text-sm md:text-base">
                  Flexible Learning Outcomes
                </h4>
                <p className="text-sm md:text-base text-gray-600">
                  Access live tutoring, recorded sessions, and self-paced
                  courses designed to fit around school and home life.
                </p>
              </div>
              <div className="feature-card bg-[#E9E2FF] p-4 md:p-6 rounded-xl">
                <h4 className="font-bold text-[#191919] mb-2 text-sm md:text-base">
                  Skills Beyond the Classroom
                </h4>
                <p className="text-sm md:text-base text-gray-600">
                  Develop confidence, communication, financial literacy, and
                  real-world skills through practical learning programmes.
                </p>
              </div>
              <div className="feature-card bg-[#E9E2FF] p-4 md:p-6 rounded-xl">
                <h4 className="font-bold text-[#191919] mb-2 text-sm md:text-base">
                  Support for Families
                </h4>
                <p className="text-sm md:text-base text-gray-600">
                  Guidance, tools, and learning support designed to help parents
                  support their child’s academic and personal development.
                </p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative stats-image">
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
              <Image
                src="/assets/images/stat-right.png"
                alt="Community Learning"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative py-8 md:py-12 lg:py-16 rounded-[60px] md:rounded-[100px] lg:rounded-[150px] overflow-hidden">
          {/* Background Image */}
          <Image
            src="/assets/images/stats-bg.png"
            alt="Stats Background"
            fill
            className="object-cover"
          />

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-4 md:px-8 lg:px-16">
            <div className="stat-card flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <Users size={24} className="md:size-7 text-[#191919]" />
              </div>
              <div className="text-left">
                <span
                  ref={(el) => (statsRef.current[0] = el)}
                  className="block text-2xl md:text-3xl lg:text-4xl font-black text-[#191919]"
                >
                  20+
                </span>
                <span className="text-xs md:text-sm font-medium text-[#191919]">
                  Educators & Practitioners In Our Network
                </span>
              </div>
            </div>
            <div className="stat-card flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen size={24} className="md:size-7 text-[#191919]" />
              </div>
              <div className="text-left">
                <span
                  ref={(el) => (statsRef.current[1] = el)}
                  className="block text-2xl md:text-3xl lg:text-4xl font-black text-[#191919]"
                >
                  1,000+
                </span>
                <span className="text-xs md:text-sm font-medium text-[#191919]">
                  Sessions Delivered to Young People
                </span>
              </div>
            </div>
            <div className="stat-card flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <GraduationCap size={24} className="md:size-7 text-[#191919]" />
              </div>
              <div className="text-left">
                <span
                  ref={(el) => (statsRef.current[2] = el)}
                  className="block text-2xl md:text-3xl lg:text-4xl font-black text-[#191919]"
                >
                  95%+
                </span>
                <span className="text-xs md:text-sm font-medium text-[#191919]">
                  Positive Feedback
                </span>
              </div>
            </div>
            <div className="stat-card flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp size={24} className="md:size-7 text-[#191919]" />
              </div>
              <div className="text-left">
                <span
                  ref={(el) => (statsRef.current[3] = el)}
                  className="block text-2xl md:text-3xl lg:text-4xl font-black text-[#191919]"
                >
                  5,000+
                </span>
                <span className="text-xs md:text-sm font-medium text-[#191919]">
                  Young People Supported
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial Section */}
        <div className="mt-12 md:mt-16 lg:mt-20">
          <div className="testimonial-header text-center mb-8 md:mb-12">
            <span className="inline-block py-2 px-5 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 uppercase">
              TESTIMONIAL
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#191919] leading-tight">
              What Our Learners and Families Say
            </h2>
          </div>

          <div className="relative px-6">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border-2 border-[#7AC2F9] rounded-full flex items-center justify-center text-[#7AC2F9] hover:bg-[#7AC2F9] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl -translate-x-12"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border-2 border-[#7AC2F9] rounded-full flex items-center justify-center text-[#7AC2F9] hover:bg-[#7AC2F9] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl translate-x-12"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {[
                {
                  name: "Sarah Mitchell",
                  role: "Parent",
                  rating: 5,
                  quote:
                    "Skill Space has been incredible for our family. The tutors are supportive and knowledgeable, and my son's confidence in school has grown so much. The SEND guidance has also been incredibly helpful for us as parents.",
                },
                {
                  name: "James, Year 10",
                  role: "Student",
                  rating: 5,
                  quote:
                    "My tutor explained maths in a way that finally made sense. I went from struggling in class to feeling confident answering questions. The study tips have also helped me stay organised for exams.",
                },
                {
                  name: "Emma Thompson",
                  role: "Parent",
                  rating: 5,
                  quote:
                    "The parent hub has been a lifesaver. I found practical advice on managing my daughter's anxiety and homework routines. It's reassuring to know expert support is available when you need it.",
                },
                {
                  name: "David Chen",
                  role: "Parent of Child with Dyslexia",
                  rating: 5,
                  quote:
                    "Finally, a platform that understands SEND needs. The tutors are trained and patient, and the resources help me support my child at home. Highly recommend!",
                },
                {
                  name: "Leah, Year 9",
                  role: "Student",
                  rating: 5,
                  quote:
                    "I love that I can learn at my own pace. The wellbeing courses have helped me manage stress during exams, and my tutor is always encouraging and understanding.",
                },
              ].map((person, index) => (
                <div
                  key={index}
                  className="testimonial-card group bg-white p-6 md:p-8 border-2 border-[#E9E2FF] rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden hover:border-[#7AC2F9] flex-shrink-0 w-[320px] md:w-[380px]"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#E9E2FF]/20 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#7AC2F9]/10 rounded-full translate-y-12 -translate-x-12"></div>

                  {/* Large quote mark with theme color */}
                  {/* <div className="absolute top-3 left-3 md:top-4 md:left-4 text-4xl md:text-6xl text-[#E9E2FF] font-serif leading-none">"</div> */}

                  {/* Star rating */}
                  <div className="flex gap-1 mb-6 relative z-10 pt-6 md:pt-8">
                    {[...Array(person.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-[#7AC2F9] fill-current drop-shadow-sm transform hover:scale-110 transition-transform"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 leading-relaxed relative z-10 font-medium">
                    "{person.quote}"
                  </p>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 p-4 bg-[#E9E2FF]/30 backdrop-blur-sm rounded-xl border border-[#E9E2FF]/50">
                      {/* Avatar with theme colors */}
                      <div className="w-12 h-12 bg-[#7AC2F9] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {person.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#191919] text-base md:text-lg">
                          {person.name}
                        </h4>
                        <p className="text-xs md:text-sm text-[#7AC2F9] font-semibold">
                          {person.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
