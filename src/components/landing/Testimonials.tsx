'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: '1',
      name: 'Sarah Mitchell',
      role: 'Parent',
      content: 'The tutors at Skill Share are absolutely fantastic. My daughter\'s confidence in maths has improved dramatically, and she actually enjoys her sessions now.',
      rating: 5,
      avatar: '/assets/images/testimonial1.jpg'
    },
    {
      id: '2',
      name: 'James Wilson',
      role: 'Student (Age 15)',
      content: 'I was struggling with English literature, but my tutor helped me understand the texts and now I feel much more confident in my exams.',
      rating: 5,
      avatar: '/assets/images/testimonial2.jpg'
    },
    {
      id: '3',
      name: 'Emma Thompson',
      role: 'Parent',
      content: 'The SEND support resources have been invaluable for our family. Finally, guidance that actually works for children with ADHD.',
      rating: 5,
      avatar: '/assets/images/testimonial3.jpg'
    },
    {
      id: '4',
      name: 'Michael Chen',
      role: 'Tutor',
      content: 'Teaching with Skill Share has been incredibly rewarding. The platform makes it easy to connect with students and track their progress.',
      rating: 5,
      avatar: '/assets/images/testimonial4.jpg'
    },
    {
      id: '5',
      name: 'Lisa Rodriguez',
      role: 'Parent',
      content: 'The life skills courses have taught my son valuable lessons about confidence and communication. Highly recommend!',
      rating: 5,
      avatar: '/assets/images/testimonial5.jpg'
    }
  ]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Our Learners Have to Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what our community of students, parents, and tutors say about their experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(0, 6).map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-blue-500 mb-4" />

              {/* Content */}
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                &quot;{testimonial.content}&quot;
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {renderStars(testimonial.rating)}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                {testimonial.avatar ? (
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {getInitials(testimonial.name)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Link */}
        <div className="text-center mt-12">
          <a
            href="/testimonials"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Read more testimonials →
          </a>
        </div>
      </div>
    </section>
  );
}