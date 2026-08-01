'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter, Menu, X, User, LogOut } from 'lucide-react';
import Button from '../common/Button';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const topBarRef = useRef(null);
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check for user authentication
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Top bar slide down animation
      gsap.from(topBarRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });

      // Main navbar slide down
      gsap.from(navRef.current, {
        y: -100,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
      });

      // Logo simple fade in animation
      gsap.from(logoRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.8,
        delay: 0.5,
        ease: 'power2.out'
      });

      // Nav links stagger animation
      gsap.from('.nav-link', {
        opacity: 0,
        y: -20,
        duration: 0.6,
        delay: 0.7,
        stagger: 0.1,
        ease: 'power3.out'
      });

      // Login button animation
      gsap.from('.nav-login-btn', {
        opacity: 0,
        scale: 0,
        duration: 0.6,
        delay: 1.2,
        ease: 'back.out(1.7)'
      });

      // Contact info items stagger
      gsap.from('.contact-info-item', {
        opacity: 0,
        x: -30,
        duration: 0.6,
        delay: 0.4,
        stagger: 0.1,
        ease: 'power3.out'
      });

      // Social icons animation
      gsap.from('.social-icon', {
        opacity: 0,
        scale: 0,
        duration: 0.4,
        delay: 0.7,
        stagger: 0.08,
        ease: 'back.out(1.7)'
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Top Bar */}
      <div ref={topBarRef} className="w-full bg-[#78bdfd] text-white hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 flex justify-between items-center h-10">
          {/* Left Side - Contact Info */}
          <div className="flex items-center gap-4 lg:gap-6 text-xs lg:text-sm font-medium">
            <div className="contact-info-item flex items-center gap-2">
              <Phone size={12} className="lg:size-3.5" />
              <span>(00) 100 784 582</span>
            </div>
            <div className="contact-info-item flex items-center gap-2">
              <Mail size={12} className="lg:size-3.5" />
              <span>test@gmail.com</span>
            </div>
            <div className="contact-info-item hidden xl:flex items-center gap-2">
              <MapPin size={12} className="lg:size-3.5" />
              <span>Lorem Ipsum, US</span>
            </div>
          </div>

          {/* Right Side - Social Icons */}
          <div className="bg-[#1a1a1a] h-10 px-4 lg:px-6 flex items-center gap-3 lg:gap-4 text-white">
            <Link href="#" className="social-icon hover:text-primary transition-colors"><Facebook size={12} className="lg:size-3.5" /></Link>
            <Link href="#" className="social-icon hover:text-primary transition-colors"><Instagram size={12} className="lg:size-3.5" /></Link>
            <Link href="#" className="social-icon hover:text-primary transition-colors"><Linkedin size={12} className="lg:size-3.5" /></Link>
            <Link href="#" className="social-icon hover:text-primary transition-colors"><Twitter size={12} className="lg:size-3.5" /></Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav ref={navRef} className="h-16 sm:h-18 md:h-20 lg:h-24 flex items-center bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between w-full">
          {/* Logo */}
          <div ref={logoRef} className="logo cursor-pointer flex-shrink-0">
            <Link href="/">
              <Image
                src="/assets/images/mainLogo.png"
                alt="SkillSpace Logo"
                width={200}
                height={60}
                className="w-[160px] h-[48px] sm:w-[180px] sm:h-[54px] md:w-[200px] md:h-[60px] lg:w-[240px] lg:h-[72px] xl:w-[280px] xl:h-[84px] object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link href="/tutors" className="nav-link font-medium text-gray-700 hover:text-black transition-colors text-sm xl:text-base">Find Tutors</Link>
            <Link href="/courses" className="nav-link font-medium text-gray-700 hover:text-black transition-colors text-sm xl:text-base">Courses</Link>
            <Link href="/become-tutor" className="nav-link font-medium text-gray-700 hover:text-black transition-colors text-sm xl:text-base">Become A Tutor</Link>
            <Link href="/progress" className="nav-link font-medium text-gray-700 hover:text-black transition-colors text-sm xl:text-base">Proven Progress</Link>
          </div>

          {/* Desktop Login Button / User Profile */}
          <div className="nav-login-btn hidden lg:block">
            {!user ? (
              <Button 
                href="/login"
              >
                LOGIN
              </Button>
            ) : (
              <div className="flex items-center gap-3 lg:gap-4">
                <Link 
                  href={`/dashboard/${user.role}`} 
                  className="font-medium text-gray-700 hover:text-black transition-colors text-sm lg:text-base"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#7AC2F9] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name?.charAt(0) || user.role?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-gray-700 hover:text-black transition-colors p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} className="sm:size-7" /> : <Menu size={24} className="sm:size-7" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-2">
            <Link 
              href="/tutors" 
              className="block py-2.5 sm:py-3 px-3 sm:px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors text-base"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Tutors
            </Link>
            <Link 
              href="/courses" 
              className="block py-2.5 sm:py-3 px-3 sm:px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors text-base"
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </Link>
            <Link 
              href="/become-tutor" 
              className="block py-2.5 sm:py-3 px-3 sm:px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors text-base"
              onClick={() => setMobileMenuOpen(false)}
            >
              Become A Tutor
            </Link>
            <Link 
              href="/progress" 
              className="block py-2.5 sm:py-3 px-3 sm:px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors text-base"
              onClick={() => setMobileMenuOpen(false)}
            >
              Proven Progress
            </Link>
            
            {/* <div className="pt-3 sm:pt-4 border-t border-gray-200">
              {!user ? (
                <div className="flex justify-center px-4">
                  <Button 
                    href="/login"
                    className="px-6 py-2 text-sm font-medium"
                  >
                    LOGIN
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  <Link 
                    href={`/dashboard/${user.role}`} 
                    className="block py-2.5 sm:py-3 px-3 sm:px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors text-base"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center justify-between py-2 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-[#78bdfd] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.name?.charAt(0) || user.role?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {user.name || `${user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}`}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
