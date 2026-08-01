import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, GraduationCap, Rocket, TrendingUp, Users } from 'lucide-react';

const stats = [
  ['500+', 'Learners supported across the UK', Users],
  ['10,000+', 'Tutoring sessions delivered', GraduationCap],
  ['95%', 'Parent satisfaction rating', TrendingUp],
  ['50+', 'Schools and community partners', Building2],
];

export default function ImpactOutcomesPage() {
  return (
    <main className="min-h-screen bg-[#F5FBFF] text-[#111827]">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E9DDA]">Impact & Outcomes</p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Real impact. Brighter futures.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 md:text-lg">
              We help learners thrive academically, personally, and socially through tutoring, practical courses, and supportive resources.
            </p>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-tl-[5rem] bg-[#EAF6FF] md:min-h-[390px]">
            <Image src="/assets/images/aboutSectionImg3.png" alt="" fill className="object-cover" priority />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden bg-[#0F76B7] text-white md:grid-cols-4">
          {stats.map(([value, label, Icon]) => (
            <div key={value as string} className="border-white/15 p-6 text-center md:border-r last:border-r-0">
              <Icon className="mx-auto h-7 w-7 text-[#D9F0FF]" />
              <div className="mt-4 text-3xl font-black">{value as string}</div>
              <p className="mt-2 text-sm leading-6 text-white/80">{label as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <article className="grid border border-gray-200 bg-white shadow-sm md:grid-cols-2">
          <div className="p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E9DDA]">Featured success story</p>
            <h2 className="mt-3 text-3xl font-black leading-tight">Aisha's journey to confidence and achievement</h2>
            <p className="mt-5 text-sm leading-7 text-gray-600">
              When Aisha joined Skill Space, she lacked confidence in maths and was falling behind. With personalised tutoring and consistent support, she improved by two levels and now feels excited about her future.
            </p>
          </div>
          <div className="relative min-h-[280px]">
            <Image src="/assets/images/aboutSectionImg1.png" alt="" fill className="object-cover" />
          </div>
        </article>
        <div className="grid gap-5">
          {[
            ['Skill Space has been a game changer for my son. His confidence has grown so much.', 'Sarah M.', 'Parent'],
            ['My tutor explains things in a way that makes sense to me. I feel more confident.', 'James', 'Year 10 student'],
          ].map(([quote, name, role]) => (
            <blockquote key={name} className="border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-4xl font-black leading-none text-[#2E9DDA]">"</p>
              <p className="mt-2 text-sm leading-7 text-gray-700">{quote}</p>
              <footer className="mt-5">
                <p className="font-bold text-[#111827]">{name}</p>
                <p className="text-sm text-gray-500">{role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E9DDA]">Community impact</p>
        <h2 className="mt-2 text-3xl font-black">Stronger communities. Lasting change.</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-4">
          {[
            ['School Partnerships', 'Targeted support for students and professional development for staff.', Building2],
            ['Workshops & Programmes', 'Free and affordable workshops on study skills and wellbeing.', GraduationCap],
            ['Community Outreach', 'Support for underserved communities and wider access to learning.', Users],
            ['Future Focused', 'Creating lasting change through opportunity and empowerment.', Rocket],
          ].map(([title, desc, Icon]) => (
            <div key={title as string} className="border border-gray-200 bg-white p-5 shadow-sm">
              <Icon className="h-7 w-7 text-[#2E9DDA]" />
              <h3 className="mt-4 font-black">{title as string}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{desc as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 bg-[#0F76B7] p-8 text-white md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-3xl font-black">Ready to start your own success story?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">Discover how personalised support can help your child build confidence, achieve goals, and unlock their potential.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/tutors" className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-[#0F76B7]">
              Find a tutor <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-md border border-white/30 px-5 py-3 text-sm font-bold text-white">
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
