'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../../components/common/Button';
import { BookOpen, Video, FileText, MessageCircle, Calendar, Award, TrendingUp, Search, Filter, Heart, Users, Clock } from 'lucide-react';

export default function ParentHubPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Resources', count: 48 },
    { id: 'guides', name: 'Parent Guides', count: 15 },
    { id: 'tips', name: 'Study Tips', count: 12 },
    { id: 'wellbeing', name: 'Wellbeing', count: 10 },
    { id: 'exams', name: 'Exam Prep', count: 8 },
    { id: 'news', name: 'Education News', count: 6 },
  ];

  const featuredArticles = [
    {
      id: 1,
      category: 'guides',
      title: 'The Complete Guide to Supporting Your Child Through GCSEs',
      excerpt: 'Essential strategies for parents to help their teenagers succeed during this crucial exam period.',
      author: 'Dr. Sarah Mitchell',
      date: 'December 10, 2025',
      readTime: '8 min read',
      image: '/assets/images/article-1.jpg',
      featured: true,
      tags: ['GCSE', 'Exam Prep', 'Teenagers'],
    },
    {
      id: 2,
      category: 'wellbeing',
      title: 'Managing Exam Stress: A Parent\'s Guide',
      excerpt: 'Practical techniques to help your child cope with exam anxiety and maintain mental wellbeing.',
      author: 'Emma Thompson',
      date: 'December 8, 2025',
      readTime: '6 min read',
      image: '/assets/images/article-2.jpg',
      featured: true,
      tags: ['Mental Health', 'Stress', 'Exams'],
    },
    {
      id: 3,
      category: 'tips',
      title: 'Creating the Perfect Study Space at Home',
      excerpt: 'Expert advice on designing a productive learning environment for your child.',
      author: 'Michael Davies',
      date: 'December 5, 2025',
      readTime: '5 min read',
      image: '/assets/images/article-3.jpg',
      featured: true,
      tags: ['Study Skills', 'Home Learning', 'Productivity'],
    },
  ];

  const articles = [
    {
      id: 4,
      category: 'guides',
      title: 'Understanding the 11+ Exam System',
      excerpt: 'Everything parents need to know about grammar school entrance exams.',
      readTime: '10 min',
      date: 'December 3, 2025',
    },
    {
      id: 5,
      category: 'tips',
      title: 'Effective Homework Routines for Primary School Children',
      excerpt: 'Building consistent study habits from an early age.',
      readTime: '7 min',
      date: 'December 1, 2025',
    },
    {
      id: 6,
      category: 'wellbeing',
      title: 'Supporting Children with Learning Differences',
      excerpt: 'Inclusive strategies for neurodiverse learners.',
      readTime: '9 min',
      date: 'November 28, 2025',
    },
    {
      id: 7,
      category: 'exams',
      title: 'SATs 2026: What Parents Should Know',
      excerpt: 'Key dates, changes, and preparation strategies for KS2 SATs.',
      readTime: '6 min',
      date: 'November 25, 2025',
    },
    {
      id: 8,
      category: 'news',
      title: 'Latest Changes to the National Curriculum',
      excerpt: 'How recent education reforms affect your child.',
      readTime: '8 min',
      date: 'November 22, 2025',
    },
    {
      id: 9,
      category: 'tips',
      title: 'Making Learning Fun During School Holidays',
      excerpt: 'Creative activities to keep skills sharp over the break.',
      readTime: '5 min',
      date: 'November 20, 2025',
    },
  ];

  const resources = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Downloadable Worksheets',
      description: 'Free practice materials for all key stages',
      link: '#',
      color: 'blue',
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: 'Video Tutorials',
      description: 'Expert advice on supporting your child',
      link: '#',
      color: 'purple',
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Term Dates & Exam Calendar',
      description: 'Stay organized with key dates',
      link: '#',
      color: 'green',
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: 'Parent Community Forum',
      description: 'Connect with other parents',
      link: '#',
      color: 'pink',
    },
  ];

  const expertTips = [
    {
      tip: 'Establish a consistent study routine at the same time each day',
      expert: 'Dr. Sarah Mitchell, Educational Psychologist',
    },
    {
      tip: 'Take regular 10-minute breaks during study sessions to maintain focus',
      expert: 'Study Skills Expert',
    },
    {
      tip: 'Celebrate small wins to build confidence and motivation',
      expert: 'Emma Thompson, Child Development Specialist',
    },
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="overflow-hidden relative">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/assets/images/heroSectionBackground.png"
            alt="Parent Hub Background"
            fill
            className="object-cover object-center"
            quality={100}
            priority
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          <div className="text-center">
            {/* Badge */}
            <span className="inline-block py-2 px-6 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-6 uppercase">
              Parent Hub
            </span>
            
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#191919] leading-tight mb-4 md:mb-6">
              Supporting Your Child's Learning Journey
            </h1>
            
            {/* Description */}
            <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
              Expert guides, tips, and resources to help you support your child's education at every stage.
            </p>

            

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="w-auto">
                <Button href="#resources">
                  Browse Resources
                </Button>
              </div>
              <div className="w-auto">
                <Button href="/contact" className="bg-white text-[#191919] hover:bg-gray-100">
                  Ask a Question
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Resources */}
      <section className="py-12 md:py-16" id="resources">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block py-2 px-6 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-6 uppercase">
              Quick Resources
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#191919] mb-4">Everything You Need at Your Fingertips</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <Link
                key={index}
                href={resource.link}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#7AC2F9] text-[#191919] rounded-full mb-4 group-hover:scale-110 transition-transform">
                  {resource.icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#191919] mb-2">{resource.title}</h3>
                <p className="text-gray-600 text-sm md:text-base">{resource.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Expert Tips */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#7AC2F9] to-blue-400 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <Award className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Quick Tips from Our Experts</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {expertTips.map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
                <p className="text-base md:text-lg mb-3 font-medium">{item.tip}</p>
                <p className="text-sm text-white/80">— {item.expert}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Articles */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#191919]">All Articles & Guides</h2>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition text-sm md:text-base ${
                  selectedCategory === cat.id
                    ? 'bg-[#7AC2F9] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Articles List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <Link
                key={article.id}
                href={`/parent-hub/${article.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-3">
                  <span className="inline-block bg-[#E9E2FF] text-[#191919] text-xs font-semibold px-3 py-1 rounded-full">
                    {categories.find(c => c.id === article.category)?.name || article.category}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#191919] mb-2 hover:text-[#7AC2F9] transition">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm md:text-base">{article.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{article.date}</span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {article.readTime}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-[#7AC2F9] to-blue-400 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Need Personalized Support?</h2>
          <p className="text-base md:text-lg mb-6 text-white/90">
            Connect with expert tutors who can provide tailored learning for your child
          </p>
          <Button href="/tutors" className="bg-white text-[#191919] hover:bg-gray-100">
            Find a Tutor
          </Button>
        </div>
      </section>
    </div>
  );
}
