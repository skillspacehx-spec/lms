import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, GraduationCap, Lock, MonitorPlay, ShoppingCart, Users } from 'lucide-react';

const webinars = [
  { day: '22', month: 'May', time: '7:00 PM - 8:00 PM', title: 'Supporting Children Through Exam Stress', audience: 'Parents', speaker: 'Dr Sarah Collins' },
  { day: '05', month: 'Jun', time: '7:00 PM - 8:30 PM', title: 'Understanding SEND in Mainstream Education', audience: 'Educators', speaker: 'James Wilson' },
  { day: '19', month: 'Jun', time: '7:00 PM - 8:00 PM', title: 'Creative Pedagogy in the Classroom', audience: 'Teachers', speaker: 'Emma Riley' },
];

export default function WebinarsPage() {
  return (
    <main className="min-h-screen bg-[#F5FBFF] text-[#111827]">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E9DDA]">Webinar Library</p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Expert insights. Real impact.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 md:text-lg">
              Access live events and on-demand recordings covering learning, wellbeing, SEND, education, and professional development.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#webinars" className="inline-flex items-center gap-2 rounded-md bg-[#7AC2F9] px-5 py-3 text-sm font-bold text-[#191919] hover:bg-[#6AB4ED]">
                Browse webinars <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#access" className="inline-flex items-center gap-2 rounded-md border border-[#BDE7FF] bg-white px-5 py-3 text-sm font-bold text-[#0F76B7] hover:border-[#7AC2F9]">
                How it works
              </Link>
            </div>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-tl-[5rem] bg-[#EAF6FF] md:min-h-[390px]">
            <Image src="/assets/images/stat-right.png" alt="" fill className="object-cover" priority />
          </div>
        </div>
      </section>

      <section id="webinars" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2E9DDA]">Live webinars</p>
            <h2 className="mt-2 text-2xl font-black md:text-3xl">Featured upcoming webinars</h2>
          </div>
          {/* <Link href="#" className="hidden items-center gap-2 text-sm font-bold text-[#2E9DDA] sm:inline-flex">
             <ArrowRight className="h-4 w-4" />
          </Link> */}
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {webinars.map((webinar) => (
            <article key={webinar.title} className="border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-[#0F76B7]">{webinar.day}</div>
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-500">{webinar.month}</div>
                </div>
                <div className="rounded-full bg-[#EAF6FF] p-3 text-[#2E9DDA]">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#2E9DDA]">Live webinar</p>
              <h3 className="mt-2 text-lg font-black leading-snug">{webinar.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{webinar.time}</p>
              <p className="mt-4 text-sm text-gray-700">{webinar.speaker} - {webinar.audience}</p>
              <Link href="/register" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#2E9DDA]">
                Register <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black md:text-3xl">Browse by audience</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            ['For Parents', 'Practical guidance to support learning, wellbeing, and SEND at home.', Users],
            ['For Students', 'Build study skills, confidence, and wellbeing with expert guidance.', GraduationCap],
            ['For Educators', 'Professional development on teaching, inclusion, and safeguarding.', MonitorPlay],
          ].map(([title, desc, Icon]) => (
            <div key={title as string} className="border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EAF6FF] text-[#2E9DDA]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-black">{title as string}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">{desc as string}</p>
              <Link href="#webinars" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#2E9DDA]">
                Explore webinars <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="access" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black md:text-3xl">Membership & access</h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="border border-[#BDE7FF] bg-[#EAF6FF] p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[#2E9DDA]">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl font-black">Included with tutoring membership</h3>
            <p className="mt-3 text-sm leading-6 text-gray-700">Students and families with an active tutoring membership receive complimentary access to selected live and recorded webinars.</p>
            <Link href="/tutoring" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#2E9DDA]">Explore tutoring <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="border border-amber-100 bg-amber-50 p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-amber-700">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl font-black">Not a member?</h3>
            <p className="mt-3 text-sm leading-6 text-gray-700">Create a free account to purchase individual webinars, access recordings, and learn from expert speakers.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-md bg-[#7AC2F9] px-5 py-3 text-sm font-bold text-[#191919] hover:bg-[#6AB4ED]">Create account</Link>
              <Link href="/login" className="rounded-md border border-[#BDE7FF] bg-white px-5 py-3 text-sm font-bold text-[#0F76B7]">Log in</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
