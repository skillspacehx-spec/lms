'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // Sample article data - would come from API/database in production
  const article = {
    id: id,
    title: 'The Complete Guide to Supporting Your Child Through GCSEs',
    excerpt: 'Essential strategies for parents to help their teenagers succeed during this crucial exam period.',
    author: 'Dr. Sarah Mitchell',
    authorBio: 'Educational Psychologist with 20 years of experience',
    authorAvatar: 'SM',
    date: 'December 10, 2025',
    readTime: '8 min read',
    category: 'Parent Guides',
    tags: ['GCSE', 'Exam Prep', 'Teenagers', 'Study Tips'],
    image: '/assets/images/article-gcse.jpg',
    content: `
      <h2>Understanding the GCSE Journey</h2>
      <p>GCSEs represent a significant milestone in your child's education. These qualifications, typically taken at age 15-16, can influence future academic and career opportunities. As a parent, your role in supporting your child through this period is invaluable.</p>

      <h2>Creating the Right Study Environment</h2>
      <p>A dedicated study space can make all the difference. Here's what you need to consider:</p>
      <ul>
        <li>Find a quiet area away from distractions</li>
        <li>Ensure good lighting and comfortable seating</li>
        <li>Keep necessary materials within reach</li>
        <li>Minimize digital distractions (phones, tablets)</li>
      </ul>

      <h2>Developing Effective Study Habits</h2>
      <p>Help your teenager establish consistent study routines:</p>
      <ul>
        <li><strong>Regular schedule:</strong> Set specific study times each day</li>
        <li><strong>Break it down:</strong> Use the Pomodoro Technique (25 minutes study, 5-minute break)</li>
        <li><strong>Active learning:</strong> Encourage making notes, flashcards, and mind maps</li>
        <li><strong>Practice questions:</strong> Work through past papers regularly</li>
      </ul>

      <h2>Managing Exam Stress</h2>
      <p>Stress management is crucial during GCSE preparation. Watch for signs of overwhelm and intervene early:</p>
      <ul>
        <li>Encourage regular breaks and physical activity</li>
        <li>Ensure 8-9 hours of sleep per night</li>
        <li>Maintain a balanced diet</li>
        <li>Practice mindfulness and relaxation techniques</li>
      </ul>

      <h2>When to Seek Additional Support</h2>
      <p>Sometimes, extra help can make all the difference. Consider tutoring if your child:</p>
      <ul>
        <li>Struggles with specific subjects</li>
        <li>Lacks confidence in their abilities</li>
        <li>Needs help with exam techniques</li>
        <li>Would benefit from personalized attention</li>
      </ul>

      <h2>Communication is Key</h2>
      <p>Keep lines of communication open with your teenager:</p>
      <ul>
        <li>Have regular check-ins about their progress</li>
        <li>Show interest without adding pressure</li>
        <li>Celebrate small wins along the way</li>
        <li>Be available to listen when they're stressed</li>
      </ul>

      <h2>Final Thoughts</h2>
      <p>Remember, GCSEs are important, but they're not everything. Your support, encouragement, and understanding during this time can have a lasting positive impact on your child's confidence and academic journey.</p>
    `,
  };

  const relatedArticles = [
    {
      id: '2',
      title: 'Managing Exam Stress: A Parent\'s Guide',
      excerpt: 'Practical techniques to help your child cope with exam anxiety.',
      readTime: '6 min read',
    },
    {
      id: '4',
      title: 'Understanding the 11+ Exam System',
      excerpt: 'Everything parents need to know about grammar school entrance exams.',
      readTime: '10 min read',
    },
    {
      id: '7',
      title: 'SATs 2026: What Parents Should Know',
      excerpt: 'Key dates, changes, and preparation strategies for KS2 SATs.',
      readTime: '6 min read',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/parent-hub"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Parent Hub
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-block bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-1 rounded-full">
            {article.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {article.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
              {article.authorAvatar}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{article.author}</p>
              <p className="text-sm">{article.authorBio}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {article.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl h-96 mb-8 flex items-center justify-center">
          <div className="text-white text-center">
            <p className="text-sm opacity-80 mb-2">Featured Image</p>
            <p className="font-semibold">GCSE Support Guide</p>
          </div>
        </div>

        {/* Share & Save */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">Share:</span>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Facebook className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Twitter className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Linkedin className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Mail className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium">
            <Bookmark className="w-4 h-4" />
            Save Article
          </button>
        </div>

        {/* Article Body */}
        <div 
          className="mb-12 text-gray-700 leading-relaxed"
          style={{ fontSize: '1.125rem', lineHeight: '1.8' }}
        >
          <style jsx>{`
            h2 { font-size: 1.875rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #111827; }
            h3 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #374151; }
            p { margin-bottom: 1.25rem; }
            ul, ol { margin: 1.25rem 0; padding-left: 2rem; }
            li { margin-bottom: 0.75rem; }
            strong { font-weight: 600; color: #111827; }
            ul { list-style-type: disc; }
            ol { list-style-type: decimal; }
          `}</style>
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        {/* Tags */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <Link
                key={index}
                href={`/parent-hub?tag=${tag}`}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm hover:bg-gray-200 transition"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {article.authorAvatar}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">About {article.author}</h3>
              <p className="text-gray-700 mb-4">
                Dr. Sarah Mitchell is an educational psychologist with over 20 years of experience 
                supporting students and families through academic challenges. She specializes in 
                exam preparation, stress management, and learning strategies.
              </p>
              <Link
                href="#"
                className="text-purple-600 font-semibold hover:text-purple-700"
              >
                View all articles by {article.author} →
              </Link>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedArticles.map(related => (
              <Link
                key={related.id}
                href={`/parent-hub/${related.id}`}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition"
              >
                <h3 className="font-bold text-gray-900 mb-2 hover:text-purple-600 transition">
                  {related.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{related.excerpt}</p>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {related.readTime}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Personalized Support?</h2>
          <p className="text-lg mb-8 text-white/90">
            Connect with expert tutors who can provide tailored GCSE preparation for your child
          </p>
          <Link
            href="/tutors?subject=GCSE"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
          >
            Find a GCSE Tutor
          </Link>
        </div>
      </section>
    </div>
  );
}
