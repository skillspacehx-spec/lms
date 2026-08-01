import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getReadableResource, readableResources } from '@/data/resources';

type ResourceDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return readableResources
    .filter((resource) => resource.slug)
    .map((resource) => ({ slug: resource.slug as string }));
}

function buildSections(title: string, description: string) {
  return [
    {
      heading: 'Overview',
      body: `${description} This guide is designed to be simple, practical, and easy to read. Use it as a starting point for reflection, discussion, or planning the next step.`,
    },
    {
      heading: 'Why it matters',
      body: `${title} matters because small, consistent changes can make learning feel clearer and more supportive. When learners, families, and educators understand the idea behind the resource, it becomes easier to turn advice into everyday action.`,
    },
    {
      heading: 'Practical steps',
      body: 'Start by choosing one idea that feels realistic this week. Notice what is already working, remove one barrier, and agree a simple next action. Keep the plan visible, review it regularly, and adjust it when the learner needs something different.',
    },
    {
      heading: 'Reflection',
      body: 'Progress is easier to see when it is reviewed calmly. Ask what helped, what felt difficult, and what should change next time. The aim is not perfection; it is steady support that helps confidence grow.',
    },
  ];
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const { slug } = await params;
  const resource = getReadableResource(slug);

  if (!resource) {
    notFound();
  }

  const sections = buildSections(resource.title, resource.description);

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-12 text-[#151515] sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl border border-gray-200 bg-white px-5 py-8 shadow-sm sm:px-8 md:py-12">
        <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-900">
          <ArrowLeft className="h-4 w-4" />
          Back to resources
        </Link>

        <div className="mt-8 border-b border-gray-200 pb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">{resource.category || 'Resource'}</p>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-normal text-[#111827] md:text-5xl">
            {resource.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-600 md:text-lg">{resource.description}</p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {resource.meta || 'Guide - 6 min read'}
          </p>
        </div>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-black text-[#111827]">{section.heading}</h2>
              <p className="mt-3 text-base leading-8 text-gray-700">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
