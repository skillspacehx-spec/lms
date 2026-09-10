'use client';

import Link from 'next/link';
import Image from 'next/image';
import Button from '../common/Button';
import { Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
    const footerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.footer-column', {
                scrollTrigger: {
                    trigger: '.footer-column',
                    start: 'top 90%',
                    once: true
                },
                opacity: 0,
                y: 30,
                duration: 0.6,
                stagger: 0.15,
                ease: 'power2.out'
            });

            gsap.from('.footer-social-icon', {
                scrollTrigger: {
                    trigger: '.footer-social-icon',
                    start: 'top 90%',
                    once: true
                },
                opacity: 0,
                y: 10,
                duration: 0.5,
                stagger: 0.08,
                ease: 'power2.out'
            });

            gsap.from('.footer-copyright', {
                scrollTrigger: {
                    trigger: '.footer-copyright',
                    start: 'top 95%',
                    once: true
                },
                opacity: 0,
                y: 10,
                duration: 0.6,
                ease: 'power2.out'
            });
        }, footerRef);

        return () => ctx.revert();
    }, []);

    return (
        <footer ref={footerRef} className="relative text-white pt-12 md:pt-16 pb-6 md:pb-8 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10 bg-black">

            </div>

            <div className="container px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">

                    {/* ✅ LOGO COLUMN – FIXED */}
                    <div className="footer-column flex flex-col items-start">
                        <Image
                            src="/assets/images/footer-logo.png"
                            alt="Footer Logo"
                            width={220}
                            height={80}
                            priority
                            className="block self-start object-contain"
                        />

                        <p className="text-gray-300 text-sm md:text-base mt-4 mb-6 leading-relaxed text-left">
                            Empowering learning through expert tutoring, courses, and parent support.
                            Building confidence and lifelong skills.
                        </p>

                        <div className="flex gap-4">
                            <a href="#" className="footer-social-icon text-gray-300 hover:text-primary"><Facebook size={20} /></a>
                            <a href="#" className="footer-social-icon text-gray-300 hover:text-primary"><Twitter size={20} /></a>
                            <a href="#" className="footer-social-icon text-gray-300 hover:text-primary"><Instagram size={20} /></a>
                            <a href="#" className="footer-social-icon text-gray-300 hover:text-primary"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-column text-left">
                        <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">Quick Links</h4>
                        <ul className="flex flex-col gap-2 text-sm md:text-base">
                            <li><Link href="/about" className="footer-link text-gray-300 hover:text-primary">About Us</Link></li>
                            <li><Link href="/tutors" className="footer-link text-gray-300 hover:text-primary">Find Tutors</Link></li>
                            <li><Link href="/faq" className="footer-link text-gray-300 hover:text-primary">FAQ</Link></li>
                            <li><Link href="/contact" className="footer-link text-gray-300 hover:text-primary">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="footer-column text-left">
                        <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">Resources</h4>
                        <ul className="flex flex-col gap-2 text-sm md:text-base">
                            {/* <li><Link href="/parent-hub" className="footer-link text-gray-300 hover:text-primary">Parent Hub</Link></li> */}
                            <li><Link href="/courses" className="footer-link text-gray-300 hover:text-primary">Subjects</Link></li>
                            <li><Link href="/tutoring" className="footer-link text-gray-300 hover:text-primary">How It Works</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="footer-column text-left">
                        <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">Newsletter</h4>
                        <p className="text-gray-300 text-sm md:text-base mb-4">
                            Subscribe to get the latest updates and news.
                        </p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                required
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white"
                            />
                            <button type="submit" className="btn btn-primary p-2 md:p-3">
                                <Send size={16} className="md:w-5 md:h-5" />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="footer-copyright border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-xs md:text-sm">
                    Copyright &copy; {new Date().getFullYear()} Skill Space. All rights reserved | Powered by <a href="https://www.haxotech.com/" target=""_blank> HaxoTech.</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
