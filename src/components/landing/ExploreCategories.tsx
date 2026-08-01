'use client';

import Link from 'next/link';
import { BookOpen, Heart, Shield, Users } from 'lucide-react';
import Button from '../common/Button';

export default function ExploreCategories() {
  const categories = [
    {
      id: 'academic-support',
      title: 'Academic Support and Exam Prep',
      description: 'English, Maths, Science, Homework Skills',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600',
      href: '/courses?category=academic-support'
    },
    {
      id: 'life-skills',
      title: 'Life Skills & Personal Development',
      description: 'Confidence, Communication, Goal Setting, Financial Literacy',
      icon: Heart,
      color: 'bg-green-100 text-green-600',
      href: '/courses?category=life-skills'
    },
    {
      id: 'wellbeing',
      title: 'Wellbeing & Safeguarding',
      description: 'Mental Health, Behaviour, Resilience, Safety',
      icon: Shield,
      color: 'bg-purple-100 text-purple-600',
      href: '/courses?category=wellbeing'
    },
    {
      id: 'parent-support',
      title: 'Parent Support & SEND Education',
      description: 'ADHD, Dyslexia, Routines, Behaviour at Home',
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      href: '/courses?category=parent-support'
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Explore Courses by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our comprehensive range of courses designed to support every aspect of learning and development
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            
            return (
              <div
                key={category.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {category.description}
                </p>

                {/* Explore Button */}
                <Button href={category.href} className="w-full">
                  Explore
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}