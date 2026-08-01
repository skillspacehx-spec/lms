'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle, FileText, GraduationCap, HeartHandshake, MessageCircle, Star, Users } from 'lucide-react';

const benefits = [
  ['Flexible Opportunities', 'Teach around your existing commitments and availability.', 'calendar'],
  ['Meaningful Impact', 'Support learners to build confidence, skills, and achieve their goals.', 'heart'],
  ['Supportive Community', 'Join a growing network of educators, tutors, and subject specialists.', 'users'],
];

const requirements = [
  'Enhanced DBS check',
  'Right to work in the UK',
  'Relevant qualifications or subject expertise',
  'Experience supporting learners',
  'Strong communication skills',
];

export default function BecomeTutorPage() {
  return (
    <main className="min-h-screen bg-[#F5FBFF] text-[#111827]">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E9DDA]">Become a Tutor</p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Share your expertise. Change lives.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 md:text-lg">
              Join a community of passionate tutors helping learners build confidence, develop skills, and achieve their goals.
            </p>
            <Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#7AC2F9] px-5 py-3 text-sm font-bold text-[#191919] hover:bg-[#6AB4ED]">
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-tl-[5rem] bg-[#EAF6FF] md:min-h-[390px]">
            <Image src="/assets/images/heroImg.png" alt="" fill className="object-cover object-top" priority />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E9DDA]">Why tutors choose Skill Space</p>
          <h2 className="mt-2 text-3xl font-black">We support you to do what you do best.</h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {benefits.map(([title, desc], index) => (
            <div key={title} className="border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EAF6FF] text-[#2E9DDA]">
                {index === 0 ? <FileText className="h-5 w-5" /> : index === 1 ? <HeartHandshake className="h-5 w-5" /> : <Users className="h-5 w-5" />}
              </div>
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="border border-gray-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E9DDA]">Who we are looking for</p>
          <h2 className="mt-3 text-3xl font-black">Passionate people who want to make a difference.</h2>
          <div className="mt-6 grid gap-5">
            {[
              ['Qualified Educators', 'Teachers, lecturers, or subject specialists with a passion for helping others learn.', GraduationCap],
              ['Experienced Tutors', 'Previous tutoring or teaching experience is preferred but not essential.', Users],
              ['Subject Specialists', 'Strong knowledge in your subject area and a commitment to student success.', Star],
              ['Reliable Communicators', 'Clear communication skills and a genuine desire to make a difference.', MessageCircle],
            ].map(([title, desc, Icon]) => (
              <div key={title as string} className="flex gap-4">
                <Icon className="mt-1 h-6 w-6 flex-shrink-0 text-[#2E9DDA]" />
                <div>
                  <h3 className="font-black">{title as string}</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">{desc as string}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="requirements" className="border border-gray-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E9DDA]">Essential requirements</p>
          <h2 className="mt-3 text-3xl font-black">A few key things we ask all tutors to have in place.</h2>
          <ul className="mt-6 space-y-4">
            {requirements.map((item) => (
              <li key={item} className="flex gap-3 border-b border-gray-100 pb-4 last:border-b-0">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2E9DDA]" />
                <span className="font-semibold text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="apply" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="border border-gray-200 bg-white p-7 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E9DDA]">Our application process</p>
          <h2 className="mt-2 text-3xl font-black">Simple, transparent, and designed to get you started.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {[
              ['1', 'Submit your enquiry', 'Get in touch and tell us about your tutoring background.'],
              ['2', 'Send documents', 'Share your CV, qualifications, right to work, and DBS certificate.'],
              ['3', 'Review & suitability', 'We review your documents and discuss next steps.'],
              ['4', 'Join the network', 'Successful applicants become part of our tutor community.'],
            ].map(([step, title, desc]) => (
              <div key={step} className="bg-[#EAF6FF] p-5">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#7AC2F9] text-sm font-black text-[#191919]">{step}</div>
                <h3 className="mt-4 font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 bg-[#0F76B7] p-8 text-white md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-3xl font-black">Ready to make a difference?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              Send us your CV, qualifications, DBS certificate, and right-to-work documentation to start the conversation.
            </p>
          </div>
          <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-[#0F76B7]">
            Contact us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
