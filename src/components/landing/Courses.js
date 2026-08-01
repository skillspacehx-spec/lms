'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, BookOpen, Clock, User, ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CourseCard = ({ course }) => {
    const renderStars = (rating) => (
        <div className="flex">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(rating) ? '#FF5349' : 'none'}
                    color={i < Math.round(rating) ? '#FF5349' : '#e5e7eb'}
                    className="mr-0.5"
                />
            ))}
        </div>
    );

    return (
        <div className="course-card relative bg-[#F8F9FA] rounded-2xl p-5 border border-dashed border-[#7AC2F9] hover:border-[#7AC2F9] transition-all duration-300 hover:shadow-xl group overflow-hidden flex flex-col">
            <div className="relative h-60 w-full overflow-hidden rounded-xl">
                <Image
                    src={course.thumbnail || '/assets/images/coursesImg1.png'}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-4 left-4 bg-[#7AC2F9] text-[#191919] px-4 py-1.5 rounded-md text-xs font-bold z-10">
                    {course.category?.name || 'General'}
                </span>
            </div>

            <div className="relative flex-1 flex flex-col justify-between mt-5">
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                    <Image
                        src="/assets/images/cardBackgroundImg.png"
                        alt="decoration"
                        fill
                        className="object-contain opacity-100"
                    />
                </div>

                <div className="relative z-10 w-full">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            {renderStars(course.rating?.average || 4.5)}
                            <span className="text-xs text-gray-500 font-bold">
                                ({course.rating?.count || 0})
                            </span>
                        </div>
                        <span className="text-[#7AC2F9] font-bold text-lg">
                            {course.price > 0 ? `£${(course.price / 100).toFixed(2)}` : 'Free'}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#191919] mb-4 leading-snug">
                        <Link href={`/courses/${course._id}`} className="hover:text-blue-500 transition-colors">
                            {course.title}
                        </Link>
                    </h3>

                    <div className="flex items-center justify-between bg-white rounded-lg p-3 mb-5 shadow-sm">
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs font-semibold">
                            <BookOpen size={14} />
                            <span>{course.modules?.length || 0} Lessons</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs font-semibold">
                            <Clock size={14} />
                            <span>{course.duration || 0}m</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs font-semibold">
                            <User size={14} />
                            <span>{course.enrolledStudents?.length || 0}+ Students</span>
                        </div>
                    </div>
``
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {course.instructor?.avatar ? (
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm relative">
                                    <Image src={course.instructor.avatar} alt={course.instructor.name} fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                    {course.instructor?.name?.charAt(0) || 'T'}
                                </div>
                            )}
                            <span className="text-sm font-bold text-[#7AC2F9]">
                                {course.instructor?.name || 'Instructor'}
                            </span>
                        </div>
                        <Link href={`/courses/${course._id}`}>
                            <button className="px-6 py-2 bg-[#7AC2F9] text-[#191919] text-sm font-bold rounded-full hover:bg-blue-300 transition-colors flex items-center gap-2">
                                View
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoadingSkeleton = () => (
    <div className="bg-[#F8F9FA] rounded-2xl p-5 animate-pulse">
        <div className="h-60 bg-gray-200 rounded-xl mb-5"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
);

const Courses = () => {
    const sectionRef = useRef(null);
    const [gcseCourses, setGcseCourses] = useState([]);
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [loadingGcse, setLoadingGcse] = useState(true);
    const [loadingFeatured, setLoadingFeatured] = useState(true);

    useEffect(() => {
        const fetchGcse = async () => {
            try {
                const res = await fetch('/api/courses?tags=GCSE&limit=3', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setGcseCourses(data.courses || []);
                }
            } catch (e) {
                console.error('Failed to fetch GCSE courses:', e);
            } finally {
                setLoadingGcse(false);
            }
        };

        const fetchFeatured = async () => {
            try {
                const res = await fetch('/api/courses?featured=true&limit=3', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setFeaturedCourses(data.courses || []);
                }
            } catch (e) {
                console.error('Failed to fetch featured courses:', e);
            } finally {
                setLoadingFeatured(false);
            }
        };

        fetchGcse();
        fetchFeatured();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.courses-badge', {
                scrollTrigger: { trigger: '.courses-badge', start: 'top 80%', once: true },
                opacity: 0, scale: 0.8, duration: 0.6, ease: 'back.out(1.7)'
            });
            gsap.from('.courses-title', {
                scrollTrigger: { trigger: '.courses-title', start: 'top 80%', once: true },
                opacity: 0, x: -50, duration: 0.8, delay: 0.2, ease: 'power3.out'
            });
            gsap.from('.courses-button', {
                scrollTrigger: { trigger: '.courses-button', start: 'top 80%', once: true },
                opacity: 0, x: 50, duration: 0.8, delay: 0.3, ease: 'power3.out'
            });
            gsap.fromTo('.course-card',
                { opacity: 0, y: 60, scale: 0.8 },
                {
                    scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
                    opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out'
                }
            );
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-16 md:py-20 lg:py-28 relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/assets/images/coursesSectionBackground.png"
                    alt="Courses Background"
                    fill
                    className="object-cover"
                    quality={100}
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">

                {/* â”€â”€ Section 1: 1:1 GCSE Tutoring â”€â”€ */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 md:mb-10 lg:mb-12 gap-6 md:gap-8">
                    <div className="flex-1 max-w-3xl">
                        <span className="courses-badge inline-block py-2 px-4 md:px-6 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 md:mb-6 uppercase">
                            1:1 Tutoring Support
                        </span>
                        <h2 className="courses-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#191919] leading-tight mb-4 md:mb-6 text-left">
                            Expert Learning Support, Tailored to Every Learner
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 mb-6 lg:mb-0 text-left">
                            Access personalised tutoring from DBS-checked educators who understand how to support and engage young learners.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 md:gap-4 items-start">
                        <Button href="/tutors">Meet Our Tutors</Button>
                        <a
                            href="/book"
                            className="group inline-flex items-center justify-center bg-[#191919] text-white rounded-full pl-3 sm:pl-4 md:pl-5 pr-0 py-1 sm:py-1.5 transition-all hover:bg-gray-800 w-auto min-w-fit h-8 sm:h-9 md:h-10"
                        >
                            <span className="font-semibold text-xs sm:text-sm mr-2 sm:mr-3 whitespace-nowrap">Book a Session</span>
                            <span className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center -mr-1 transition-all bg-[#7AC2F9] text-[#191919] group-hover:bg-[#6AB4ED] flex-shrink-0">
                                <span className="w-3 h-3 sm:w-4 sm:h-4">
                                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                                    </svg>
                                </span>
                            </span>
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-20 md:mb-28">
                    {loadingGcse
                        ? [1, 2, 3].map(i => <LoadingSkeleton key={i} />)
                        : gcseCourses.length === 0
                            ? <div className="col-span-3 text-center py-12"><p className="text-gray-500">No GCSE courses available yet.</p></div>
                            : gcseCourses.map(course => <CourseCard key={course._id} course={course} />)
                    }
                </div>

                {/* â”€â”€ Section 2: Featured Courses â”€â”€ */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 md:mb-10 lg:mb-12 gap-6 md:gap-8">
                    <div className="flex-1 max-w-3xl">
                        <span className="inline-block py-2 px-4 md:px-6 rounded-md bg-[#FFF3E0] text-[#191919] text-xs font-bold tracking-wider mb-4 md:mb-6 uppercase">
                            Featured Courses
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#191919] leading-tight mb-4 md:mb-6 text-left">
                            Build Skills Beyond the Classroom
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 mb-6 lg:mb-0 text-left">
                            Self-paced courses in life skills, study techniques and technology — giving young learners the tools to thrive.
                        </p>
                    </div>

                     <div className="flex flex-col sm:flex-row lg:flex-col gap-3 md:gap-4 items-start">
                        <Button href="/tutors">Meet Our Tutors</Button>
                        <a
                            href="/book"
                            className="group inline-flex items-center justify-center bg-[#191919] text-white rounded-full pl-3 sm:pl-4 md:pl-5 pr-0 py-1 sm:py-1.5 transition-all hover:bg-gray-800 w-auto min-w-fit h-8 sm:h-9 md:h-10"
                        >
                            <span className="font-semibold text-xs sm:text-sm mr-2 sm:mr-3 whitespace-nowrap">Book a Session</span>
                            <span className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center -mr-1 transition-all bg-[#7AC2F9] text-[#191919] group-hover:bg-[#6AB4ED] flex-shrink-0">
                                <span className="w-3 h-3 sm:w-4 sm:h-4">
                                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                                    </svg>
                                </span>
                            </span>
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                    {loadingFeatured
                        ? [1, 2, 3].map(i => <LoadingSkeleton key={i} />)
                        : featuredCourses.length === 0
                            ? <div className="col-span-3 text-center py-12"><p className="text-gray-500">No featured courses available yet.</p></div>
                            : featuredCourses.map(course => <CourseCard key={course._id} course={course} />)
                    }
                </div>

            </div>
        </section>
    );
};

export default Courses;
