"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import Button from "../common/Button";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const imageRef = useRef(null);
  const floatingBoxRef = useRef(null);
  const arrowRef = useRef(null);
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    // Navigate to find tutor page with search query
    if (searchQuery.trim()) {
      router.push(`/find-tutor?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/find-tutor");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero content animation
      gsap.from(".hero-badge", {
        opacity: 0,
        y: -30,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".hero-title", {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from(".hero-description", {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.4,
        ease: "power3.out",
      });

      gsap.from(".hero-button", {
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        delay: 0.6,
        ease: "back.out(1.7)",
      });

      // Arrow animation
      if (arrowRef.current) {
        gsap.from(arrowRef.current, {
          opacity: 0,
          x: -50,
          duration: 1,
          delay: 0.8,
          ease: "power2.out",
        });
      }

      // Hero image animation
      if (imageRef.current) {
        gsap.from(imageRef.current, {
          opacity: 0,
          x: 100,
          duration: 1.2,
          delay: 0.3,
          ease: "power3.out",
        });
      }

      // Floating instructor box animation
      if (floatingBoxRef.current) {
        gsap.from(floatingBoxRef.current, {
          opacity: 0,
          y: 50,
          duration: 1,
          delay: 1,
          ease: "power3.out",
        });
      }

      // Instructor avatars stagger animation
      gsap.from(".instructor-avatar", {
        opacity: 0,
        scale: 0,
        duration: 0.5,
        delay: 1.2,
        stagger: 0.1,
        ease: "back.out(1.7)",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="overflow-hidden relative">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/images/heroSectionBackground.png"
          alt="Hero Background"
          fill
          className="object-cover object-center md:object-right"
          quality={100}
          priority
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
          {/* Left Content */}
          <div ref={contentRef} className="z-10 py-8 sm:py-12 lg:py-0 relative">
            <span className="hero-badge text-[#7AC2F9] font-semibold uppercase tracking-wider mb-3 md:mb-4 block text-xs sm:text-sm">
              WELCOME TO SKILL SHARE
            </span>
            <h1 className="hero-title text-[28px] sm:text-[32px] md:text-[42px] lg:text-[58px] leading-[1.15] font-bold mb-4 md:mb-6 text-[#191919]">
              Empowering Learning. <br /> Inspiring Growth.
            </h1>
            <p className="hero-description text-sm sm:text-base text-gray-600 mb-6 md:mb-8 max-w-lg leading-relaxed">
              Skill Space is an online learning platform offering expert
              tutoring, short courses, webinars and parent support. All designed
              to not only build academic success, but confidence and lifelong
              skills{" "}
            </p>

            <div className="flex flex-col gap-4 relative max-w-lg">
              <div className="hero-search w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for tutors, subjects or topics…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base rounded-full border-2 border-gray-300 focus:border-[#78bdfd] focus:outline-none text-gray-700 shadow-md"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-0.5 sm:right-1 md:right-2 top-1/2 -translate-y-1/2 bg-[#78bdfd] text-white px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-full hover:bg-[#5fa3e8] transition-colors font-semibold"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Dotted Curved Arrow Below Search */}
              <div className="absolute left-1/2 -translate-x-1/2 top-16 sm:top-20 pointer-events-none z-10">
                <svg
                  width="120"
                  height="60"
                  viewBox="0 0 120 60"
                  fill="none"
                  className="text-blue-400"
                >
                  <path
                    d="M20 10 Q 60 40, 100 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                    className="animate-pulse"
                  />
                  <path
                    d="M95 18 L100 20 L97 25"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="animate-pulse"
                  />
                </svg>
              </div>

              {/* Dotted Arrow Decoration */}
              {/* <div ref={arrowRef} className="absolute left-[240px] top--20 hidden lg:block pointer-events-none">
                                <Image
                                    src="/assets/images/heroArrowImg.png"
                                    alt="arrow"
                                    width={250}
                                    height={50}
                                    className="transform translate-y-2"
                                />
                            </div> */}
            </div>
          </div>

          {/* Right Image Section */}
          <div className="relative h-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] flex items-center justify-center lg:justify-end lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[45%]">
            <div
              ref={imageRef}
              className="relative w-full sm:w-[90%] lg:w-[85%] h-full mx-auto lg:ml-auto"
            >
              <Image
                src="/assets/images/heroImg.png"
                alt="Hero Image"
                fill
                className="object-contain object-center"
                priority
              />
            </div>

            {/* Floating Expert Tutors Box */}
            <div
              ref={floatingBoxRef}
              className="hidden lg:block absolute bottom-16 xl:bottom-20 left-[-50px] xl:left-[-70px] bg-white py-3 px-4 md:py-4 md:px-6 lg:py-6 lg:px-10 rounded-2xl shadow-[0px_0px_30px_rgba(0,0,0,0.12)] z-20 max-w-xs"
            >
              <h3 className="text-xl md:text-2xl font-bold text-[#7AC2F9] mb-1">
                Expert{" "}
                <span className="text-[#191919] text-xl md:text-2xl font-semibold">
                  Tutors
                </span>
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                DBS-checked and experienced in working with young people
              </p>
              <div className="flex items-center mt-3">
                <div className="flex -space-x-3 items-center">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="instructor-avatar w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-gray-300 overflow-hidden relative"
                    >
                      <Image
                        src={`/assets/images/courseInstructorImg1.png`}
                        alt={`Tutor ${i}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => router.push("/become-tutor")}
                    className="instructor-avatar w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#7AC2F9] border-2 border-white text-white flex items-center justify-center hover:bg-[#7AC2F9] transition-colors relative z-10 p-0"
                  >
                    <Plus size={14} className="md:size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dotted Curved Arrow Below Expert Tutors Box */}
            <div className="hidden lg:block absolute bottom-8 left-[-30px] pointer-events-none z-10">
              <svg
                width="140"
                height="70"
                viewBox="0 0 140 70"
                fill="none"
                className="text-blue-400"
              >
                <path
                  d="M30 15 Q 70 50, 110 25"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  fill="none"
                />
                <path
                  d="M105 23 L110 25 L107 30"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
