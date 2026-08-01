"use client";

import Image from "next/image";
import Button from "../common/Button";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DiscoverGain = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Badge animation
      gsap.from(".discover-badge", {
        scrollTrigger: {
          trigger: ".discover-badge",
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        y: -30,
        duration: 0.6,
        ease: "power3.out",
      });

      // Title animation
      gsap.from(".discover-title", {
        scrollTrigger: {
          trigger: ".discover-title",
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      // Cards animation
      gsap.fromTo(
        ".discover-card",
        {
          opacity: 0,
          y: 80,
          scale: 0.9,
        },
        {
          scrollTrigger: {
            trigger: ".discover-card",
            start: "top 80%",
            once: true,
          },
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
        },
      );

      // Decorative elements animation
      gsap.from(".discover-decoration", {
        scrollTrigger: {
          trigger: ".discover-decoration",
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        scale: 0,
        rotation: 360,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-12 md:py-16 lg:py-20 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/images/discover-gain-bg.png"
          alt="Background"
          fill
          className="object-cover"
          quality={100}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10 lg:mb-12">
          <span className="discover-badge inline-block py-2 px-5 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 uppercase">
            Start Learning Today
          </span>
          <h2 className="discover-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#191919]">
            Choose How You Want to Learn
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
          {/* Blue Card */}
          <div className="discover-card relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group min-h-[280px] sm:min-h-[320px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#78bdfd] to-[#5fa3e8]"></div>
            <div className="relative h-full flex flex-col sm:flex-row">
              {/* Left Content */}
              <div className="w-full sm:w-1/2 p-6 sm:p-8 md:p-10 text-white flex flex-col justify-between z-10">
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight mb-3">
                    1:1 Tutoring Support
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed">
                    Personalised support from DBS-checked tutors to help
                    students improve confidence, understanding, and academic
                    performance.
                  </p>
                </div>
                <div className="mt-4 sm:mt-6">
                  <Button
                    href="/find-tutor"
                    className="bg-[#191919] text-white hover:bg-gray-800 text-sm sm:text-base"
                    icon={<ArrowRight size={16} className="text-[#191919]" />}
                  >
                    Find a Tutor
                  </Button>
                </div>
              </div>
              {/* Right Image */}
              <div className="w-full sm:w-1/2 relative min-h-[120px] sm:min-h-full">
                <Image
                  src="/assets/images/discover-card-1.png"
                  alt="Training Course"
                  fill
                  className="object-contain object-bottom"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Yellow Card */}
          <div className="discover-card relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FCD34D] to-[#FBBF24]"></div>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 min-h-[280px] sm:min-h-[320px]">
              {/* Left Content */}
              <div className="p-6 sm:p-8 md:p-10 text-white flex flex-col justify-between z-10">
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight mb-3">
                    Explore Learning Courses
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed">
                    Browse practical courses covering life skills, study
                    techniques, wellbeing, and learning support for students and
                    families.
                  </p>
                </div>
                <div className="mt-4 sm:mt-6">
                  <Button
                    href="/courses"
                    className="bg-[#78bdfd] text-[#191919] hover:bg-[#5fa3e8] text-sm sm:text-base"
                  >
                    Explore Courses
                  </Button>
                </div>
              </div>
              {/* Right Image */}
              <div className="relative min-h-[120px] sm:min-h-full">
                <Image
                  src="/assets/images/discover-card-2.png"
                  alt="Training Course"
                  fill
                  className="object-contain object-bottom"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverGain;
