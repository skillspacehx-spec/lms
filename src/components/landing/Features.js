'use client';

import Image from 'next/image';
import Button from '../common/Button';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
    const sectionRef = useRef(null);
    const badgeRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Images grid animation - simple fade in
            gsap.from('.feature-image-1', {
                scrollTrigger: {
                    trigger: '.feature-image-1',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power2.out'
            });

            gsap.from('.feature-image-2', {
                scrollTrigger: {
                    trigger: '.feature-image-2',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                delay: 0.15,
                ease: 'power2.out'
            });

            gsap.from('.feature-image-3', {
                scrollTrigger: {
                    trigger: '.feature-image-3',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                delay: 0.3,
                ease: 'power2.out'
            });

            // Experience badge animation - simple fade in
            if (badgeRef.current) {
                gsap.from(badgeRef.current, {
                    scrollTrigger: {
                        trigger: badgeRef.current,
                        start: 'top 80%',
                        once: true
                    },
                    opacity: 0,
                    scale: 0.9,
                    duration: 0.8,
                    delay: 0.45,
                    ease: 'power2.out'
                });
            }

            // Content animations - simple fade in
            gsap.from('.features-badge', {
                scrollTrigger: {
                    trigger: '.features-badge',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                y: 20,
                duration: 0.6,
                ease: 'power2.out'
            });

            gsap.from('.features-title', {
                scrollTrigger: {
                    trigger: '.features-title',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                y: 20,
                duration: 0.8,
                delay: 0.15,
                ease: 'power2.out'
            });

            gsap.from('.features-description', {
                scrollTrigger: {
                    trigger: '.features-description',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                y: 20,
                duration: 0.8,
                delay: 0.25,
                ease: 'power2.out'
            });

            gsap.from('.feature-point', {
                scrollTrigger: {
                    trigger: '.feature-point',
                    start: 'top 85%',
                    once: true
                },
                opacity: 0,
                y: 20,
                duration: 0.6,
                stagger: 0.15,
                ease: 'power2.out'
            });

            gsap.from('.features-button', {
                scrollTrigger: {
                    trigger: '.features-button',
                    start: 'top 85%',
                    once: true
                },
                opacity: 0,
                y: 20,
                duration: 0.6,
                ease: 'power2.out'
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-12 md:py-16 lg:py-20 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
                    {/* Left Side - Image Grid */}
                    <div className="relative">
                        <div className="relative w-full aspect-square max-w-[500px] mx-auto lg:mx-0">
                            {/* Main Image (Top Left) */}
                            <div className="feature-image-1 absolute top-0 left-0 w-[50%] h-[50.5%] rounded-md overflow-hidden shadow-lg z-10">
                                <Image
                                    src="/assets/images/aboutSectionImg2.png"
                                    alt="Student learning"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Secondary Image (Top Right) */}
                            <div className="feature-image-2 absolute top-12 right-0 w-[45%] h-[41%] rounded-md overflow-hidden shadow-md z-0">
                                <Image
                                    src="/assets/images/aboutSectionImg3.png"
                                    alt="Campus building"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Decorative Dots Grid (Top Right) */}
                            <div className="absolute top-4 right-[-20px] -z-10">
                                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                                    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <circle cx="2" cy="2" r="2" className="text-blue-200" fill="currentColor" />
                                    </pattern>
                                    <rect width="100" height="100" fill="url(#dots)" />
                                </svg>
                            </div>

                            {/* Bottom Image (Bottom Center) */}
                            <div className="feature-image-3 absolute bottom-0 left-1/2 transform w-[85%] h-[45%] rounded-md -translate-x-1/4 overflow-hidden shadow-lg z-20">
                                <Image
                                    src="/assets/images/aboutSectionImg1.png"
                                    alt="Group of students"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Experience Badge (Center) */}
                            <div ref={badgeRef} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-blue-400 rounded-full flex flex-col items-center justify-center text-center text-black shadow-xl border-[4px] border-gray-900">
                                    <span className="text-3xl md:text-4xl font-bold leading-none">10+</span>
                                    <span className="text-xs md:text-sm font-medium leading-tight mt-1"> Years of <br/>Combined Education Experience</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div>
                        <span className="features-badge inline-block py-2 px-6 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-6 uppercase">
                            Why Skill Space Works.
                        </span>
                        <h2 className="features-title text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                            Why Choose <span className="relative inline-block">
                                Skill Space
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                                </svg>
                            </span>
                        </h2>
                        <p className="features-description text-gray-500 mb-6 md:mb-8 leading-relaxed text-base md:text-lg">
                            Skill Space brings together tutoring, courses, and practical learning tools to support academic progress, confidence, and personal growth.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
                            <div className="feature-point">
                                <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs sm:text-sm tracking-wide">Courses and Tutoring in One Place</h4>
                                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                                    Academic support, life skills, wellbeing learning, and parent guidance available on one platform.

                                </p>
                            </div>
                            <div className="feature-point">
                                <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs sm:text-sm tracking-wide"> Designed by Education Specialists</h4>
                                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                                    Created by educators, youth practitioners, and behaviour specialists who understand how young people learn.
                                </p>
                            </div>
                            <div className="feature-point">
                                <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs sm:text-sm tracking-wide">Flexible Learning Options</h4>
                                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                                   Live tutoring, recorded sessions, and self-paced courses designed to fit around school and home life.
                                </p>
                            </div>
                            <div className="feature-point">
                                <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs sm:text-sm tracking-wide">Built for Families</h4>
                                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                                    Clear guidance, practical tools, and learning support to help parents support their child’s development.
                                </p>
                            </div>
                        </div>

                        <div className="features-button">
                            <Button href="/about">
                                Learn More
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
