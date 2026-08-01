'use client';

import Image from 'next/image';
import Button from '../common/Button';
import { Play } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CallToEnroll = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Badge animation
            gsap.from('.enroll-badge', {
                scrollTrigger: {
                    trigger: '.enroll-badge',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                y: -30,
                duration: 0.6,
                ease: 'power3.out'
            });

            // Title animation
            gsap.from('.enroll-title', {
                scrollTrigger: {
                    trigger: '.enroll-title',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                delay: 0.2,
                ease: 'power3.out'
            });

            // Phone number animation
            gsap.from('.enroll-phone', {
                scrollTrigger: {
                    trigger: '.enroll-phone',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                scale: 0.8,
                duration: 0.8,
                delay: 0.4,
                ease: 'back.out(1.7)'
            });

            // Button animation
            gsap.from('.enroll-button', {
                scrollTrigger: {
                    trigger: '.enroll-button',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                x: -50,
                duration: 0.8,
                delay: 0.6,
                ease: 'power3.out'
            });

            // Watch now button animation
            gsap.from('.watch-now-btn', {
                scrollTrigger: {
                    trigger: '.watch-now-btn',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                scale: 0,
                duration: 0.8,
                delay: 0.8,
                ease: 'back.out(1.7)'
            });

            // Decorative elements animation
            gsap.from('.decorative-element', {
                scrollTrigger: {
                    trigger: '.decorative-element',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                scale: 0,
                rotation: 360,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 -z-0">
                <Image
                    src="/assets/images/call-to-enroll-bg.png"
                    alt="Students Background"
                    fill
                    className="object-cover"
                    quality={100}
                />
                <div className="absolute inset-0 bg-blue-500/40"></div>
            </div>

            {/* Decorative Elements */}
            {/* Green Circle - Top Left */}
            <div className="decorative-element absolute top-6 md:top-12 left-6 md:left-12 w-12 h-12 md:w-16 md:h-16 border-4 border-green-400/60 rounded-full"></div>
            
            {/* Star Icon - Center Top */}
            <div className="decorative-element absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-12 w-12 h-12">
                <svg viewBox="0 0 100 100" className="text-white/60">
                    <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="currentColor" />
                </svg>
            </div>

            {/* Wavy Line - Top Right */}
            <div className="decorative-element absolute top-8 right-8 opacity-60">
                <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
                    <path d="M0 60 Q 30 20, 60 60 T 120 60 T 180 60" stroke="white" strokeWidth="3" fill="none"/>
                </svg>
            </div>

            {/* Wave Pattern - Bottom Right */}
            <div className="decorative-element absolute bottom-16 right-8">
                <svg width="100" height="60" viewBox="0 0 100 60" fill="none" className="text-white/50">
                    <path d="M0 30 Q 10 20, 20 30 T 40 30 T 60 30 T 80 30 T 100 30" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M0 40 Q 10 30, 20 40 T 40 40 T 60 40 T 80 40 T 100 40" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M0 50 Q 10 40, 20 50 T 40 50 T 60 50 T 80 50 T 100 50" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl text-left pl-4 md:pl-8 lg:pl-16">
                    {/* Badge */}
                    <span className="enroll-badge inline-block py-2 px-4 md:px-5 rounded-md bg-transparent border-2 border-white/40 text-white text-xs font-bold tracking-wider mb-4 md:mb-6 uppercase">
                        Join Our New Session
                    </span>

                    {/* Title */}
                    <h2 className="enroll-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 leading-tight">
                        Call To Enroll Your Child
                    </h2>

                    {/* Phone Number */}
                    <h3 className="enroll-phone text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6 md:mb-8 lg:mb-10">
                        (+44)122434343
                    </h3>

                    {/* CTA Section */}
                    <div className="flex flex-col sm:flex-row items-start gap-6 md:gap-8">
                        {/* Button */}
                        <div className="enroll-button">
                            <Button href="/enroll" className="bg-white text-[#191919] hover:bg-gray-100">
                                Join With Us
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Watch Now Button - Positioned on Right */}
                {/* <div className="watch-now-btn absolute right-16 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play size={28} className="text-[#78bdfd] fill-current ml-1" />
                    </div>
                    <span className="text-white font-semibold text-base">watch now</span>
                </div> */}
            </div>
        </section>
    );
};

export default CallToEnroll;
