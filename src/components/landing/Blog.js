"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "../common/Button";

gsap.registerPlugin(ScrollTrigger);

const posts = [
  {
    id: 1,
    title: "Supporting Your Child with ADHD at Home",
    category: "SEND Support",
    date: "Dec 10, 2025",
  },
  {
    id: 2,
    title: "10 Study Tips for Better Focus and Retention",
    category: "Student Tips",
    date: "Dec 08, 2025",
  },
  {
    id: 3,
    title: "Building Resilience in Young People",
    category: "Wellbeing",
    date: "Dec 05, 2025",
  },
  {
    id: 4,
    title: "How to Talk to Your Teen About Mental Health",
    category: "Parent Guide",
    date: "Dec 03, 2025",
  },
  {
    id: 5,
    title: "Creating Effective Homework Routines",
    category: "Parent Guide",
    date: "Nov 28, 2025",
  },
  {
    id: 6,
    title: "Understanding Dyslexia: A Parent's Guide",
    category: "SEND Support",
    date: "Nov 25, 2025",
  },
];

const Blog = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animations
      gsap.from(".blog-subtitle", {
        scrollTrigger: {
          trigger: ".blog-subtitle",
          start: "top 80%",
        },
        opacity: 0,
        x: -50,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".blog-title", {
        scrollTrigger: {
          trigger: ".blog-title",
          start: "top 80%",
        },
        opacity: 0,
        x: -50,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from(".blog-button", {
        scrollTrigger: {
          trigger: ".blog-button",
          start: "top 80%",
        },
        opacity: 0,
        x: 50,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      // Blog cards slide in animation
      gsap.from(".blog-card", {
        scrollTrigger: {
          trigger: ".blog-card",
          start: "top 85%",
        },
        opacity: 0,
        y: 80,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-10 lg:mb-12 gap-4 md:gap-6">
          <div>
            <span className="blog-subtitle inline-block py-2 px-5 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 uppercase">
              FREE RESOURCES
            </span>
            <h2 className="blog-title text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-[#191919] leading-tight">
              Free Guides, Articles and Resources .
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl">
              Explore free articles and practical guides covering study skills,
              student wellbeing, SEND support, and advice for parents supporting
              their child’s learning.
            </p>
          </div>
          <div className="blog-button">
            <Button href="/parent-hub" className="shadow-md hover:shadow-lg">
              Explore the Parent Hub
            </Button>
          </div>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <div key={post.id} className="blog-card bg-white rounded-2xl overflow-hidden border border-gray-200 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <div className="relative h-56 overflow-hidden">
                                <Image
                                    src="/assets/images/blog.png"
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 text-sm mb-3">
                                    <div className="flex items-center gap-1 text-[#78bdfd]">
                                        <Calendar size={16} />
                                        <span className="font-medium">{post.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M14 14H2V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M14 5L8.5 10.5L5.5 7.5L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span className="font-medium">Comment (20)</span>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold mb-4 leading-snug text-[#191919] hover:text-[#78bdfd] transition-colors min-h-[60px]">
                                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                                </h3>
                                <Button href={`/blog/${post.id}`}>
                                    Read More
                                </Button>
                            </div>
                        </div>
                    ))}
                </div> */}
      </div>
    </section>
  );
};

export default Blog;
