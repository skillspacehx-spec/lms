'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import Button from '../common/Button';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { NotificationBell } from '../common/NotificationSystem';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const Navbar = () => {
  const topBarRef = useRef(null);
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const { success, error } = useToast();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/notifications', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const unread = data.notifications?.filter((n: any) => !n.isRead).length || 0;
          setUnreadNotifications(unread);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();

    // Poll for new notifications every 30 seconds if user is logged in
    const interval = user ? setInterval(fetchNotifications, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        success('You have been logged out successfully!');
      } catch (err) {
        error('Error logging out. Please try again.');
      }
    }
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
                className="w-[150px] h-[45px] sm:w-[170px] sm:h-[51px] md:w-[190px] md:h-[57px] lg:w-[200px] lg:h-[60px] xl:w-[220px] xl:h-[66px] object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-5">
            {/* Tutoring Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'tutoring' ? null : 'tutoring')}
                className="nav-link font-medium text-gray-700 hover:text-black transition-colors text-sm xl:text-base flex items-center gap-1"
              >
                Tutoring
                <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'tutoring' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'tutoring' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white shadow-lg rounded-lg py-2 z-50">
                  <Link href="/tutoring" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>How Tutoring Works</Link>
                  <Link href="/tutoring#subjects" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>Subjects We Offer</Link>
                  <Link href="/tutors" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>Our Tutors</Link>
                  {/* <Link href="/tutors/browse" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick ={() => setOpenDropdown(null)}>Book a Session</Link> */}
                </div>
              )}
            </div>

            {/* Courses Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'courses' ? null : 'courses')}
                className="nav-link font-medium text-gray-700 hover:text-black transition-colors text-sm xl:text-base flex items-center gap-1"
              >
                Courses
                <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'courses' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'courses' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-lg py-2 z-50">
                  <Link href="/courses?category=academic" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>Academic Support</Link>
                  <Link href="/courses?category=life-skills" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>Life Skills & Personal Development</Link>
                  <Link href="/courses?category=wellbeing" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>Wellbeing & Safeguarding</Link>
                  <Link href="/courses?category=parent-send" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>Parent Support & SEND</Link>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link href="/courses" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium" onClick={() => setOpenDropdown(null)}>Browse All Courses</Link>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'resources' ? null : 'resources')}
                className="nav-link font-medium text-gray-700 hover:text-black transition-colors text-sm xl:text-base flex items-center gap-1"
              >
                Resources
                <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'resources' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'resources' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white shadow-lg rounded-lg py-2 z-50">
                  <Link href="/resources?type=articles" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>Articles & Insights</Link>
                  <Link href="/resources?category=send" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>SEND Resources</Link>
                  <Link href="/resources?category=study-tips" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>Study Tips & Guides</Link>
                  <Link href="/resources?category=wellbeing" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>Wellbeing Resources</Link>
                </div>
              )}
            </div>

            <Link href="/webinars" className="nav-link font-medium text-gray-700 hover:text-black transition-colors text-sm xl:text-base">Webinars</Link>
            <Link href="/impact-outcomes" className="nav-link font-medium text-gray-700 hover:text-black transition-colors text-sm xl:text-base">Impact & Outcomes</Link>
            <Link href="/become-tutor" className="nav-link font-medium text-gray-700 hover:text-black transition-colors text-sm xl:text-base">Become a Tutor</Link>
            <Link href="/contact" className="nav-link font-medium text-gray-700 hover:text-black transition-colors text-sm xl:text-base">Contact Us</Link>
          </div>

          {/* Desktop Login Button / User Profile */}
          <div className="nav-login-btn hidden lg:block">
            {!user ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <Button
                  onClick={() => setOpenDropdown(openDropdown === 'login' ? null : 'login')}
                  icon={<ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'login' ? 'rotate-180' : ''}`} />}
                >
                  LOGIN
                </Button>
                {openDropdown === 'login' && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
                    <Link href="/login?role=student" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>Student Login</Link>
                    <Link href="/login?role=parent" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>Parent Portal</Link>
                    <Link href="/login?role=tutor" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpenDropdown(null)}>Tutor Portal</Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 lg:gap-4">
                {/* Notification Bell */}
                {/* <Link href={`/dashboard/${user.role}/notifications`}>
                  <NotificationBell 
                    unreadCount={unreadNotifications} 
                    onClick={() => {}} 
                  />
                </Link> */}

                <Link
                  href={`/dashboard/${user.role}`}
                  className="font-medium text-gray-700 hover:text-black transition-colors text-sm lg:text-base"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#7AC2F9] rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'User avatar'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-semibold">
                        {user.name?.charAt(0) || user.role?.charAt(0).toUpperCase()}
                      </span>
                    )}
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
            {/* Tutoring Menu */}
            <div className="border-b border-gray-100 pb-2">
              <div className="font-semibold text-gray-900 px-3 py-2">Tutoring</div>
              <Link href="/tutoring" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>How Tutoring Works</Link>
              <Link href="/tutoring#subjects" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Subjects We Offer</Link>
              <Link href="/tutors" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Our Tutors</Link>
              {/* <Link href="/tutors/browse" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Book a Session</Link> */}
            </div>

            {/* Courses Menu */}
            <div className="border-b border-gray-100 pb-2">
              <div className="font-semibold text-gray-900 px-3 py-2">Courses</div>
              <Link href="/courses?category=academic" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Academic Support</Link>
              <Link href="/courses?category=life-skills" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Life Skills & Personal Development</Link>
              <Link href="/courses?category=wellbeing" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Wellbeing & Safeguarding</Link>
              <Link href="/courses?category=parent-send" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Parent Support & SEND</Link>
              <Link href="/courses" className="block py-2 px-6 text-gray-700 hover:bg-gray-50 font-medium" onClick={() => setMobileMenuOpen(false)}>Browse All Courses</Link>
            </div>

            {/* Resources Menu */}
            <div className="border-b border-gray-100 pb-2">
              <div className="font-semibold text-gray-900 px-3 py-2">Resources</div>
              <Link href="/resources?type=articles" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Articles & Insights</Link>
              <Link href="/resources?category=send" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>SEND Resources</Link>
              <Link href="/resources?category=study-tips" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Study Tips & Guides</Link>
              <Link href="/resources?category=wellbeing" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Wellbeing Resources</Link>
            </div>

            <div className="border-b border-gray-100 pb-2">
              <Link href="/webinars" className="block py-2 px-3 font-semibold text-gray-900 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Webinars</Link>
              <Link href="/impact-outcomes" className="block py-2 px-3 font-semibold text-gray-900 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Impact & Outcomes</Link>
              <Link href="/become-tutor" className="block py-2 px-3 font-semibold text-gray-900 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Become a Tutor</Link>
              <Link href="/contact" className="block py-2 px-3 font-semibold text-gray-900 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-gray-200">
              {!user ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    onClick={() => setOpenDropdown(openDropdown === 'mobile-login' ? null : 'mobile-login')}
                    icon={<ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'mobile-login' ? 'rotate-180' : ''}`} />}
                  >
                    LOGIN
                  </Button>
                  {openDropdown === 'mobile-login' && (
                    <div className="mt-3 rounded-lg border border-gray-100 bg-white py-2 shadow-sm">
                      <Link href="/login?role=student" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Student Login</Link>
                      <Link href="/login?role=parent" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Parent Portal</Link>
                      <Link href="/login?role=tutor" className="block py-2 px-6 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Tutor Portal</Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {/* Mobile Notification Bell */}
                  <div className="flex justify-center py-2">
                    <NotificationBell
                      unreadCount={0}
                      onClick={() => {
                        console.log('Mobile notifications clicked');
                        setMobileMenuOpen(false);
                      }}
                    />
                  </div>

                  <Link
                    href={`/dashboard/${user.role}`}
                    className="block py-2.5 sm:py-3 px-3 sm:px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors text-base"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center justify-between py-2 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-[#78bdfd] rounded-full flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name || 'User avatar'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-semibold">
                            {user.name?.charAt(0) || user.role?.charAt(0).toUpperCase()}
                          </span>
                        )}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
