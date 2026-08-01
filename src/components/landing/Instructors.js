'use client';

import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Share2 } from 'lucide-react';
import Button from '../common/Button';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const instructors = [
    { id: 1, name: 'Esther Howard', role: 'Lorem Ipsum' },
    { id: 2, name: 'Beverly Hathcock', role: 'Lorem Ipsum' },
    { id: 3, name: 'Donald Gonzales', role: 'Lorem Ipsum' },
    { id: 4, name: 'Eddie Lenz', role: 'Lorem Ipsum' },
];

const Instructors = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Header animations
            gsap.from('.instructors-subtitle', {
                scrollTrigger: {
                    trigger: '.instructors-subtitle',
                    start: 'top 80%',
                    once: true,
                },
                opacity: 0,
                y: -30,
                duration: 0.6,
                ease: 'power3.out'
            });

            gsap.from('.instructors-title', {
                scrollTrigger: {
                    trigger: '.instructors-title',
                    start: 'top 80%',
                    once: true,
                },
                opacity: 0,
                scale: 0.8,
                duration: 0.8,
                delay: 0.2,
                ease: 'back.out(1.7)'
            });

            gsap.from('.instructors-description', {
                scrollTrigger: {
                    trigger: '.instructors-description',
                    start: 'top 80%',
                    once: true,
                },
                opacity: 0,
                y: 20,
                duration: 0.6,
                delay: 0.3,
                ease: 'power3.out'
            });

            // Instructor cards simple animation
            gsap.fromTo('.instructor-card',
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
        <section ref={sectionRef} className="py-12 md:py-16 lg:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-start">
                    {/* Left Content Section */}
                    <div className="relative flex items-center justify-center lg:min-h-[600px]">
                        {/* Decorative circles */}
                        <div className="absolute -left-8 top-16">
                            <div className="flex gap-2 items-center">
                                <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                                <div className="flex flex-col gap-2">
                                    <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                                    <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="instructors-subtitle inline-block py-2 px-5 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-4 uppercase">
                                OUR INSTRUCTOR
                            </span>
                            <h2 className="instructors-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#191919] mb-4 md:mb-6 leading-tight">
                                Meet Our Expert<br />Instructor
                            </h2>
                            <p className="instructors-description text-gray-600 mb-8 leading-relaxed max-w-lg">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start">
                                <Button href="/instructors">
                                    Contact Us
                                </Button>
                                <Button href="/courses">
                                    Find Courses
                                </Button>
                            </div>
                        </div>

                        {/* Decorative element */}
                        <div className="absolute -bottom-16 left-32">
                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                <path d="M10 40 Q 25 20, 40 40 T 70 40" stroke="#FCD34D" strokeWidth="3" fill="none"/>
                            </svg>
                        </div>
                    </div>

                    {/* Right Grid of Instructors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {instructors.map((instructor) => (
                            <div key={instructor.id} className="instructor-card relative bg-white rounded-2xl overflow-hidden border-4 border-[#78bdfd] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <div className="relative h-48 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                                    <Image
                                        src={`/assets/images/instructor1.png`}
                                        // src={`/assets/images/instructor${instructor.id}.png`}
                                        alt={instructor.name}
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Share button */}
                                    <button className="absolute top-4 right-4 w-10 h-10 bg-[#78bdfd] rounded-full flex items-center justify-center hover:bg-[#5fa3e8] transition-colors">
                                        <Share2 size={18} className="text-white" />
                                    </button>
                                    {/* Yellow dot decoration */}
                                    <div className="absolute bottom-4 right-4 w-4 h-4 bg-yellow-400 rounded-full"></div>
                                </div>
                                <div className="p-4 bg-white">
                                    <h3 className="text-lg font-bold text-[#191919] mb-1">{instructor.name}</h3>
                                    <span className="text-sm text-gray-500">{instructor.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Instructors;
