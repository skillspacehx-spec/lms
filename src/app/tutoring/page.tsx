'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../../components/common/Button';
import { Search, UserCheck, Calendar, Video, Star, CheckCircle, ArrowRight, Users, Shield, Clock, Award } from 'lucide-react';

export default function TutoringPage() {
  const steps = [
    {
      number: '1',
      icon: <Search className="w-12 h-12" />,
      title: 'Find Your Perfect Tutor',
      description: 'Browse our directory of verified, experienced tutors. Filter by subject, level, availability, and price to find your ideal match.',
      features: ['450+ qualified tutors', 'All subjects covered', 'Advanced search filters', 'Detailed profiles with videos'],
    },
    {
      number: '2',
      icon: <Calendar className="w-12 h-12" />,
      title: 'Book a Session',
      description: 'Choose from flexible plans (trial, single session, or packages). Select a convenient time slot from the tutor\'s real-time availability.',
      features: ['Flexible scheduling', 'Instant booking confirmation', 'Multiple payment plans', 'Easy rescheduling'],
    },
    {
      number: '3',
      icon: <Video className="w-12 h-12" />,
      title: 'Learn Online',
      description: 'Join live, interactive 1-on-1 sessions from the comfort of home. Our secure video platform makes learning easy and engaging.',
      features: ['HD video quality', 'Screen sharing', 'Digital whiteboard', 'Session recordings available'],
    },
    {
      number: '4',
      icon: <Star className="w-12 h-12" />,
      title: 'Track Progress',
      description: 'Monitor improvement through your dashboard. Review session notes, homework assignments, and tutor feedback after each lesson.',
      features: ['Progress tracking', 'Session notes', 'Performance reports', 'Parent updates'],
    },
  ];

  const forStudents = [
    { icon: <CheckCircle className="w-6 h-6" />, text: 'Personalised 1-to-1 support' },
    { icon: <CheckCircle className="w-6 h-6" />, text: 'Learn at a pace that works for you' },
    { icon: <CheckCircle className="w-6 h-6" />, text: 'Build confidence and motivation' },
    { icon: <CheckCircle className="w-6 h-6" />, text: 'Flexible sessions around school life' },
    { icon: <CheckCircle className="w-6 h-6" />, text: 'Exam preparation and study skills' },
    { icon: <CheckCircle className="w-6 h-6" />, text: 'Homework help and subject support' },
  ];

  const forParents = [
    { icon: <CheckCircle className="w-6 h-6" />, text: 'Qualified, DBS-checked tutors' },
    { icon: <CheckCircle className="w-6 h-6" />, text: 'Clear pricing with no hidden fees' },
    { icon: <CheckCircle className="w-6 h-6" />, text: 'Regular progress updates' },
    { icon: <CheckCircle className="w-6 h-6" />, text: 'Safe and supportive online learning' },
    { icon: <CheckCircle className="w-6 h-6" />, text: 'Flexible booking options' },
    { icon: <CheckCircle className="w-6 h-6" />, text: 'Support tailored to your child\'s needs' },
  ];

  const plans = [
    {
      name: 'Introductory session',
      price: '£15',
      duration: 'One-time session',
      features: [
        '1-hour introductory session',
        'Meet your tutor',
        'Discuss learning goals',
        'Personalised learning recommendations',
        'No long-term commitment',
      ],
      popular: false,
      buttonText: 'Book Intro Session',
    },
    {
      name: 'Essential Learning Plan',
      price: '£80',
      duration: 'per month',
      features: [
        '4 one-to-one tutoring sessions',
        'Weekly academic support',
        'Access to learning resources',
        'Parent support materials',
        'Recorded webinars and study tools',
      ],
      popular: false,
      buttonText: 'Get Started',
    },
    {
      name: 'Premium Learning Plan',
      price: '£140',
      duration: 'per month',
      features: [
        '6 one-to-one tutoring sessions',
        'Access to live and recorded webinars',
        'Full parent support resources',
        'Flexible scheduling and rescheduling',
        'Progress-focused learning support',
      ],
      popular: true,
      buttonText: 'Get Started',
    },
    {
      name: 'VIP Learning Plan',
      price: '£180',
      duration: 'per month',
      features: [
        '8 one-to-one tutoring sessions',
        'Priority tutor booking',
        'Full platform resource access',
        'Personalised learning recommendations',
        'Exclusive webinars and premium support',
      ],
      popular: false,
      buttonText: 'Get Started',
    },
  ];

  const subjects = [
    'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'French', 'Spanish', 'Computer Science', '11+ Prep',
    'GCSE Prep', 'A-Level Prep', 'SATs Prep', 'Study Skills', 'and 30+ More Subjects'
  ];

  const faqs = [
    {
      q: 'How do I know if a tutor is qualified?',
      a: 'All Skill Space tutors are DBS-checked and carefully selected based on their experience, subject knowledge, and ability to support young people effectively.',
    },
    {
      q: 'What do I need for online tutoring?',
      a: 'Our online sessions are easy to access from home using a tablet or computer. We\'ll provide clear instructions before your session so learners and families feel fully supported.',
    },
    {
      q: 'Can I try tutoring before choosing a learning plan?',
      a: 'Yes. Our £15 introductory session allows students and families to meet their tutor, discuss learning goals, and experience personalised support before committing to a membership plan.',
    },
    {
      q: 'Can sessions be rescheduled?',
      a: 'Yes. We understand that schedules can change, so sessions can be rearranged with advance notice wherever possible to support school and family life.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="overflow-hidden relative">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/assets/images/heroSectionBackground.png"
            alt="How It Works Background"
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
              How It Works
            </span>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#191919] leading-tight mb-4 md:mb-6">
              How Our Online Tutoring Works
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
              Simple, flexible, and designed around your child. Get started with expert tutors in just 4 easy steps.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Button href="/tutors">
                Find Your Tutor Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Steps */}
      {/* <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block py-2 px-6 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-6 uppercase">
              Process
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#191919] mb-4">4 Simple Steps to Success</h2>
          </div>
          <div className="space-y-12 md:space-y-16">
            {steps.map((step, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-center`}>
                <div className="flex-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-[#7AC2F9] text-[#191919] text-lg md:text-2xl font-bold rounded-full mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#191919] mb-4">{step.title}</h3>
                  <p className="text-base md:text-lg text-gray-600 mb-6">{step.description}</p>
                  <ul className="space-y-3">
                    {step.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-[#7AC2F9] mr-3 flex-shrink-0" />
                        <span className="text-sm md:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              
                <div className="flex-1">
                  <div className="bg-[#E9E2FF]/30 rounded-2xl p-8 md:p-12 flex items-center justify-center h-64 md:h-80">
                    <div className="text-[#7AC2F9]">
                      {step.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Benefits Split */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block py-2 px-6 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-6 uppercase">
              Benefits
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#191919] mb-4">Why choose Skill Space for Tutoring?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* For Students */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <Users className="w-12 h-12 text-[#7AC2F9] mb-4" />
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#191919] mb-6">For Students</h3>
              <ul className="space-y-4">
                {forStudents.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="text-[#7AC2F9] mr-3 mt-1 flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-gray-700 text-sm md:text-base">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Parents */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <Shield className="w-12 h-12 text-[#7AC2F9] mb-4" />
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#191919] mb-6">For Parents</h3>
              <ul className="space-y-4">
                {forParents.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="text-[#7AC2F9] mr-3 mt-1 flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-gray-700 text-sm md:text-base">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block py-2 px-6 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-6 uppercase">
              Pricing
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#191919] mb-4">Flexible Learning Memberships </h2>
            <p className="text-base md:text-lg text-gray-600">
              Choose the learning plan that best supports your child’s goals, schedule, and learning needs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8\">
            {plans.map((plan, index) => (
              <div key={index} className={`rounded-2xl p-6 md:p-8 ${plan.popular ? 'bg-gradient-to-br from-[#7AC2F9] to-blue-400 text-white shadow-lg' : 'bg-gray-50 border-2 border-gray-200'}`}>
                {plan.popular && (
                  <span className="inline-block bg-[#E9E2FF] text-[#191919] text-xs font-bold px-3 py-1 rounded-full mb-4">
                    MOST POPULAR
                  </span>
                )}
                <h3 className={`text-xl md:text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-[#191919]'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-3xl md:text-4xl lg:text-5xl font-bold ${plan.popular ? 'text-white' : 'text-[#7AC2F9]'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ml-2 ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                    {plan.duration}
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">                  {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className={`w-5 h-5 mr-2 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-white' : 'text-[#7AC2F9]'}`} />
                    <span className={`text-sm md:text-base ${plan.popular ? 'text-white' : 'text-gray-700'}`}>{feature}</span>
                  </li>
                ))}
                </ul>
                <Button
                  href="/tutors"
                  className={plan.popular ? 'bg-white text-[#191919] hover:bg-gray-100' : 'bg-[#7AC2F9] text-[#191919] hover:bg-[#6AB4ED]'}
                >
                  {plan.buttonText || 'Get Started'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <span className="inline-block py-2 px-6 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-6 uppercase">
            Subjects
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#191919] mb-4">Subjects We Cover</h2>
          <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">From core subjects to exam preparation and study support </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8">
            {subjects.map((subject, index) => (
              <span key={index} className="bg-white px-3 md:px-4 py-2 rounded-full text-gray-700 shadow-sm text-sm md:text-base">
                {subject}
              </span>
            ))}
          </div>
          <Button href="/courses">
            View All Subjects
          </Button>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block py-2 px-6 rounded-md bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider mb-6 uppercase">
              FAQ
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#191919] mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-[#191919] mb-3">{faq.q}</h3>
                <p className="text-sm md:text-base text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6 md:mt-8">
            <Button href="/faq">
              View All FAQs
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-[#7AC2F9] to-blue-400 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <Award className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-base md:text-lg mb-6 md:mb-8 text-white/90">
            Join thousands of students achieving their goals with expert tutors
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="w-auto">
              <Button href="/tutors" className="bg-white text-[#191919] hover:bg-gray-100">
                Find a Tutor
              </Button>
            </div>
            <div className="w-auto">
              <Button href="/register" className="bg-[#191919] text-white hover:bg-[#2a2a2a]">
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
