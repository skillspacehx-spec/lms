'use client';

import Image from 'next/image';
import Link from 'next/link';
import Button from '../../components/common/Button';
import { useState, useEffect } from 'react';
import { Star, BookOpen, Clock, User } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  description: string;
  category: {
    _id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  instructor: {
    _id: string;
    name: string;
    avatar?: string;
  };
  price: number;
  duration: number;
  thumbnail?: string;
  enrolledStudents?: any[];
  content?: {
    modules?: any[];
  };
}

interface Category {
  _id: string;
  name: string;
  icon?: string;
  color?: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses =
    selectedCategory === 'All'
      ? courses
      : courses.filter(c => c.category?.name === selectedCategory);

  const allCategories = ['All', ...categories.map(cat => cat.name)];

  const renderStars = (rating: number) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < Math.round(rating) ? '#FF5349' : 'none'}
          color={i < Math.round(rating) ? '#FF5349' : '#e5e7eb'}
        />
      ))}
    </div>
  );

  return (
    <>
      {/* ================= COURSES SECTION ================= */}
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-6 py-2 bg-[#E9E2FF] rounded-md text-xs font-bold uppercase">
              Course Catalog
            </span>
            <h1 className="text-4xl font-bold mt-4">
              Explore Our Expert-Led Courses
            </h1>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Discover personalized learning experiences with expert tutors.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-[#7AC2F9] text-white'
                    : 'bg-white hover:bg-[#E9E2FF]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeleton
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 border animate-pulse"
                >
                  <div className="h-56 bg-gray-200 rounded-xl mb-5"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No courses found in this category.</p>
              </div>
            ) : (
              filteredCourses.map(course => (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl p-5 border hover:shadow-xl transition flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-56 rounded-xl overflow-hidden">
                    <Image
                      src={course.thumbnail || "/assets/images/coursesImg1.png"}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-4 left-4 bg-[#7AC2F9] px-4 py-1 text-xs font-bold rounded-md text-white">
                      {course.category?.name || 'General'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mt-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        {renderStars(4.5)}
                        <span className="font-bold text-[#7AC2F9]">
                          {course.price > 0 ? `£${course.price}` : 'Free'}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-4">
                        <Link href={`/courses/${course._id}`} className="hover:text-blue-500">
                          {course.title}
                        </Link>
                      </h3>

                      <div className="flex justify-between bg-gray-50 p-3 rounded-lg text-xs font-semibold">
                        <span className="flex items-center gap-1">
                          <BookOpen size={14} /> {course.content?.modules?.length || 0} Lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {course.duration || 0}m
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={14} /> {course.enrolledStudents?.length || 0}+
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center mt-5">
                      <div className="flex items-center gap-2">
                        {course.instructor?.avatar ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden relative">
                            <Image
                              src={course.instructor.avatar}
                              alt={course.instructor.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {course.instructor?.name?.charAt(0) || 'T'}
                          </div>
                        )}
                        <span className="font-bold text-[#7AC2F9] text-sm">
                          {course.instructor?.name || 'Instructor'}
                        </span>
                      </div>
                      <Link
                        href={`/courses/${course._id}`}
                        className="px-5 py-2 bg-[#7AC2F9] rounded-full text-sm font-bold text-white hover:bg-blue-400 transition"
                      >
                        View Course →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ================= CTA SECTION (FULL WIDTH) ================= */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/call-to-enroll-bg.png"
            alt="CTA Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-white mb-8 max-w-2xl mx-auto">
            Connect with our expert tutors and begin your educational journey.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              href="/tutors"
              className="bg-white text-[#191919] hover:bg-gray-100"
            >
              Browse All Tutors
            </Button>
            <Button
              href="/contact"
              className="bg-white text-[#191919] hover:bg-gray-100"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
