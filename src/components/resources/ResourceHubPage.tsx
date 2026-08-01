import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Heart,
  Home,
  Lightbulb,
  MessageCircle,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { IconName, ResourceItem, TopicItem } from '@/data/resources';

type ResourceHubPageProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  heroImage: string;
  primaryCta: string;
  secondaryCta: string;
  featuredTitle?: string;
  featured: ResourceItem[];
  topicsTitle?: string;
  topics: TopicItem[];
  toolkitTitle?: string;
  toolkit: ResourceItem[];
  support: TopicItem[];
};

const iconMap = {
  book: BookOpen,
  brain: Brain,
  calendar: CalendarCheck,
  clipboard: ClipboardCheck,
  file: FileText,
  graduation: GraduationCap,
  heart: Heart,
  home: Home,
  lightbulb: Lightbulb,
  message: MessageCircle,
  newspaper: Newspaper,
  search: Search,
  shield: ShieldCheck,
  sparkles: Sparkles,
  target: Target,
  trending: TrendingUp,
  users: Users,
};

function IconBadge({ icon, className = 'bg-blue-50 text-blue-700' }: { icon: IconName; className?: string }) {
  const Icon = iconMap[icon];
  return (
    <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${className}`}>
      <Icon className="h-5 w-5" />
    </div>
  );
}

function ArticleCard({ item }: { item: ResourceItem }) {
  const content = (
    <>
      <IconBadge icon={item.icon} />
      <h3 className="mt-4 text-lg font-bold leading-snug text-[#151515]">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
      <div className="mt-5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span>{item.meta || 'Guide - 6 min read'}</span>
        <ArrowRight className="h-4 w-4 text-blue-700" />
      </div>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        {content}
      </Link>
    );
  }

  return (
    <article className="border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {content}
    </article>
  );
}

export default function ResourceHubPage({
  eyebrow,
  title,
  subtitle,
  heroImage,
  primaryCta,
  featuredTitle,
  featured,
  topicsTitle,
  topics,
  support,
}: ResourceHubPageProps) {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#151515]">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-normal text-[#111827] md:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 md:text-lg">{subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#featured" className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800">
                {primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {/* <Link href="#toolkit" className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-800 transition hover:border-blue-400">
                {secondaryCta}
                <Download className="h-4 w-4" />
              </Link> */}
            </div>
          </div>
          <div className="relative min-h-[260px] overflow-hidden rounded-tl-[5rem] bg-gray-100 md:min-h-[380px]">
            <Image src={heroImage} alt="" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" priority />
          </div>
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          {featuredTitle ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Featured</p>
              <h2 className="mt-2 text-2xl font-black text-[#111827] md:text-3xl">{featuredTitle}</h2>
            </div>
          ) : (
            <div />
          )}
          {/* {featuredTitle && (
            <Link href="#" className="hidden items-center gap-2 text-sm font-bold text-blue-700 sm:inline-flex">
              View all resources <ArrowRight className="h-4 w-4" />
            </Link>
          )} */}
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {featured.map((item) => (
            <ArticleCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {topicsTitle && <h2 className="text-2xl font-black text-[#111827] md:text-3xl">{topicsTitle}</h2>}
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {topics.map((topic) => (
            <Link key={topic.title} href={topic.href} className={`block border border-gray-200 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${topic.accent}`}>
              <IconBadge icon={topic.icon} className="bg-white/80 text-blue-800" />
              <h3 className="mt-5 text-xl font-black text-[#111827]">{topic.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-700">{topic.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-800">
                Explore <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* <section id="toolkit" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {toolkitTitle && (
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-black text-[#111827] md:text-3xl">{toolkitTitle}</h2>
            <Link href="#" className="hidden items-center gap-2 text-sm font-bold text-blue-700 sm:inline-flex">
              View all downloads <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {toolkit.map((item) => (
            <div key={item.title} className="border border-gray-200 bg-white p-5 shadow-sm">
              <IconBadge icon={item.icon} className="bg-[#EAF6FF] text-[#2E9DDA]" />
              <h3 className="mt-4 font-bold text-[#111827]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
              <div className="mt-5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
                <span>{item.meta || 'PDF - 2 pages'}</span>
                <Download className="h-4 w-4 text-blue-700" />
              </div>
            </div>
          ))}
        </div>
      </section> */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black text-[#111827]">Need additional support?</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {support.map((item) => (
            <Link key={item.title} href={item.href} className={`flex gap-4 border border-gray-200 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${item.accent}`}>
              <IconBadge icon={item.icon} className="bg-white/80 text-blue-800" />
              <div>
                <h3 className="font-black text-[#111827]">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-gray-700">{item.description}</p>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-800">
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
