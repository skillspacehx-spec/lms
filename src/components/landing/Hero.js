"use client";

import Image from "next/image";
import { Plus, Search, GraduationCap, BookOpen, ArrowRight, Sparkles, Lock, Download } from "lucide-react";
import Button from "../common/Button";
import { useEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { searchSkillSpace } from "@/data/discoveryData";

gsap.registerPlugin(ScrollTrigger);

const POPULAR_TOPICS = ["Maths", "Anxiety", "English", "EHCP", "Revision", "Science"];

const Hero = () => {
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const imageRef = useRef(null);
  const floatingBoxRef = useRef(null);
  const arrowRef = useRef(null);
  const searchContainerRef = useRef(null);
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Live quick preview results
  const previewResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchSkillSpace(searchQuery.trim());
  }, [searchQuery]);

  const handleSearch = () => {
    setIsDropdownOpen(false);
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const handleTopicClick = (topic) => {
    setSearchQuery(topic);
    setIsDropdownOpen(false);
    router.push(`/search?q=${encodeURIComponent(topic)}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              WELCOME TO SKILL SPACE
            </span>
            <h1 className="hero-title text-[28px] sm:text-[32px] md:text-[42px] lg:text-[58px] leading-[1.15] font-bold mb-4 md:mb-6 text-[#191919]">
              Empowering Learning. <br/>Building Confidence. <br/>Inspiring Growth
            </h1>
            <p className="hero-description text-sm sm:text-base text-gray-600 mb-6 md:mb-8 max-w-lg leading-relaxed">
              Skill Space takes a 360° approach to education — bringing together young people and the families, carers and educators around them. Through tutoring, practical learning, specialist webinars and trusted resources, we support the whole learning ecosystem around the young person to build knowledge, confidence, understanding and better outcomes.{" "}
            </p>

            {/* Discovery Search Bar */}
            <div ref={searchContainerRef} className="flex flex-col gap-3 relative max-w-lg">
              <div className="hero-search w-full relative z-30">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for subjects or topics…"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (searchQuery.trim()) setIsDropdownOpen(true);
                    }}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base rounded-full border-2 border-gray-300 focus:border-[#78bdfd] focus:ring-4 focus:ring-[#78bdfd]/20 focus:outline-none text-gray-700 bg-white shadow-md pr-24 sm:pr-28 transition"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 bg-[#78bdfd] text-[#191919] px-4 sm:px-5 py-2 text-sm sm:text-base rounded-full hover:bg-[#5fa3e8] transition-colors font-bold shadow-sm"
                  >
                    Search
                  </button>
                </div>

                {/* Instant Discovery Dropdown */}
                {isDropdownOpen && previewResults && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-40 max-h-[380px] overflow-y-auto">
                    {/* Header summary */}
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-600">
                      <span>Discover Skill Space Offerings</span>
                      <span className="text-[#0F76B7] font-bold">{previewResults.totalMatches} matches</span>
                    </div>

                    {/* Subjects Tutoring Options */}
                    {previewResults.subjects.length > 0 && (
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#0F76B7] px-2 mb-1.5 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" /> Subject Tutoring (Membership Required)
                        </p>
                        {previewResults.subjects.slice(0, 2).map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setIsDropdownOpen(false);
                              router.push(`/search?q=${encodeURIComponent(s.title)}&filter=tutoring`);
                            }}
                            className="p-2 rounded-xl hover:bg-blue-50/60 cursor-pointer transition flex items-center justify-between group"
                          >
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#0F76B7]">
                                {s.title}
                              </p>
                              <p className="text-[11px] text-gray-500 line-clamp-1">
                                1-on-1 Tutoring • {s.levels.slice(0, 3).join(', ')}
                              </p>
                            </div>
                            <span className="text-[11px] text-[#0F76B7] font-semibold flex items-center gap-0.5">
                              View Option <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Topic Resources & Toolkits */}
                    {previewResults.resources.length > 0 && (
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 px-2 mb-1.5 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> Guides &amp; Toolkits ({previewResults.resources[0].category})
                        </p>
                        {previewResults.resources.slice(0, 3).map((r) => (
                          <div
                            key={r.id}
                            onClick={() => {
                              setIsDropdownOpen(false);
                              router.push(r.href);
                            }}
                            className="p-2 rounded-xl hover:bg-emerald-50/60 cursor-pointer transition flex items-center justify-between group"
                          >
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-emerald-700">
                                {r.title}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {r.category} • {r.accessType}
                              </p>
                            </div>
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5">
                              {r.accessType === 'Downloadable PDF' ? 'Toolkit' : 'Read'} <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* View Full Search Button */}
                    <button
                      onClick={handleSearch}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-[#78bdfd]/20 to-[#E9E2FF]/40 text-[#0F76B7] hover:bg-blue-50 font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      View all {previewResults.totalMatches} results in Discovery Hub
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Topic Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs font-semibold text-gray-500 mr-1">Try:</span>
                {POPULAR_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicClick(topic)}
                    className="px-2.5 py-0.5 text-xs bg-white/80 hover:bg-white text-gray-700 rounded-full border border-gray-200/80 hover:border-[#7AC2F9] shadow-2xs font-medium transition"
                  >
                    {topic}
                  </button>
                ))}
              </div>
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
                Experienced{" "}
                <span className="text-[#191919] text-xl md:text-2xl font-semibold">
                  Tutors
                </span>
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                DBS-checked Tutors helping young people thrive
              </p>
              {/* <div className="flex items-center mt-3">
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
              </div> */}
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
