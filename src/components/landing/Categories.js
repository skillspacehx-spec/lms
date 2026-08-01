'use client';

import { Briefcase, BookOpen, Award, PenTool, GraduationCap } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

const categories = [
    { 
        icon: <BookOpen size={24} />, 
        name: 'Academic Support', 
        description: 'English, Maths, Science, Homework Skills',
        color: 'bg-blue-50 text-blue-500', 
        iconBg: 'bg-blue-100',
        href: '/courses?category=academic-support'
    },
    { 
        icon: <Award size={24} />, 
        name: 'Life Skills & Personal Development', 
        description: 'Confidence, Communication, Goal Setting, Financial Literacy',
        color: 'bg-green-50 text-green-500', 
        iconBg: 'bg-green-100',
        href: '/courses?category=life-skills'
    },
    { 
        icon: <PenTool size={24} />, 
        name: 'Wellbeing & Personal Growth', 
        description: 'Mental health, resilience, behaviour awareness and tools to help young people stay safe, balanced and confident',
        color: 'bg-purple-50 text-purple-500', 
        iconBg: 'bg-purple-100',
        href: '/courses?category=wellbeing'
    },
    { 
        icon: <Briefcase size={24} />, 
        name: 'Parent Support & SEND Guidance', 
        description: 'Practical courses and guidance for adults supporting children with ADHD, dyslexia, behaviour challenges and learning needs',
        color: 'bg-rose-50 text-rose-500', 
        iconBg: 'bg-rose-100',
        href: '/resources?category=parent-support'
    },
    { 
        icon: <GraduationCap size={24} />, 
        name: 'Teacher & Educator Training', 
        description: 'Professional development for teachers, mentors, and youth practitioners focused on behaviour, engagement, inclusion, and effective practice.',
        color: 'bg-amber-50 text-amber-500', 
        iconBg: 'bg-amber-100',
        href: '/courses?category=teacher-training'
    },
];

const Categories = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.categories-badge', {
                scrollTrigger: {
                    trigger: '.categories-badge',
                    start: 'top 80%',
                    once: true,
                },
                opacity: 0,
                y: -30,
                duration: 0.8,
                ease: 'power3.out'
            });

            gsap.from('.categories-title', {
                scrollTrigger: {
                    trigger: '.categories-title',
                    start: 'top 80%',
                    once: true,
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                delay: 0.2,
                ease: 'power3.out'
            });

            gsap.fromTo('.category-card',
                {
                    opacity: 0,
                    y: 60,
                    scale: 0.8
                },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 75%',
                        once: true,
                    },
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'power2.out'
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-12 md:py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <span className="categories-badge inline-block py-2 px-6 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-6 uppercase">
                        Explore Courses
                    </span>
                    <h2 className="categories-title text-2xl sm:text-3xl md:text-4xl font-bold text-[#191919]">Explore Courses by Category</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
                    {categories.map((cat, index) => (
                        <Link
                            key={index}
                            href={cat.href}
                            className={`category-card ${cat.color} p-4 sm:p-6 md:p-8 rounded-xl flex flex-col gap-3 sm:gap-4 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-current bg-opacity-50`}
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center ${cat.iconBg} bg-opacity-50 border-2 border-current border-opacity-20 flex-shrink-0`}>
                                    {cat.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{cat.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{cat.description}</p>
                            <span className="mt-2 self-start px-6 py-2 bg-[#191919] text-white rounded-full hover:bg-gray-800 transition-colors font-semibold text-sm inline-block">
                                Explore
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Categories;