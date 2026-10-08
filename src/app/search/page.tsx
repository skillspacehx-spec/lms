'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  BookOpen,
  GraduationCap,
  Sparkles,
  Heart,
  FileText,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Download,
  Filter,
  X,
  Layers,
  HelpCircle,
  Clock,
  Video
} from 'lucide-react';
import {
  searchSkillSpace,
  SubjectOffering,
  ResourceOffering,
  WebinarOffering
} from '@/data/discoveryData';

const POPULAR_SUGGESTIONS = [
  'Maths',
  'Anxiety',
  'English',
  'EHCP',
  'Science',
  'Revision',
  'SEND',
  'GCSE',
  'Confidence',
  'Physics',
  'Study Skills',
  'Languages'
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';
  const initialCategory = searchParams.get('filter') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [selectedFilter, setSelectedFilter] = useState(initialCategory);

  // Sync with URL when params change
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search') || '';
    setQuery(q);
  }, [searchParams]);

  const searchResults = useMemo(() => {
    return searchSkillSpace(query);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}&filter=${selectedFilter}`);
    } else {
      router.push(`/search?filter=${selectedFilter}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}&filter=${selectedFilter}`);
  };

  // Filtered views
  const showSubjects = selectedFilter === 'all' || selectedFilter === 'tutoring';
  const showResources = selectedFilter === 'all' || selectedFilter === 'resources' || selectedFilter === 'wellbeing' || selectedFilter === 'send' || selectedFilter === 'study';
  const showWebinars = selectedFilter === 'all' || selectedFilter === 'webinars';

  const filteredResources = useMemo(() => {
    if (selectedFilter === 'wellbeing') {
      return searchResults.resources.filter(r => r.category === 'Wellbeing');
    }
    if (selectedFilter === 'send') {
      return searchResults.resources.filter(r => r.category === 'SEND');
    }
    if (selectedFilter === 'study') {
      return searchResults.resources.filter(r => r.category === 'Study Tips');
    }
    return searchResults.resources;
  }, [searchResults.resources, selectedFilter]);

  const totalVisibleResults =
    (showSubjects ? searchResults.subjects.length : 0) +
    (showResources ? filteredResources.length : 0) +
    (showWebinars ? searchResults.webinars.length : 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Search Header Banner */}
      <section className="bg-gradient-to-b from-[#EBF5FE] to-[#F8FAFC] border-b border-gray-200/80 py-10 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-[#E9E2FF] text-[#191919] text-xs font-bold tracking-wider uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Discover Skill Space
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#191919] tracking-tight">
              Explore Subjects, Topics & Resources
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed">
              Find 1-on-1 tutoring options, free guides, downloadable toolkits, webinars, and learning support across the whole Skill Space platform.
            </p>
          </div>

          {/* Search Bar Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative mb-6">
            <div className="relative flex items-center">
              <Search className="absolute left-4 sm:left-5 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for subjects or topics…"
                className="w-full pl-12 sm:pl-14 pr-28 py-3.5 sm:py-4 text-sm sm:text-base rounded-2xl border-2 border-gray-300 focus:border-[#7AC2F9] focus:ring-4 focus:ring-[#7AC2F9]/20 focus:outline-none text-gray-800 bg-white shadow-sm transition"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    router.push('/search');
                  }}
                  className="absolute right-24 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 sm:right-2.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#7AC2F9] hover:bg-[#6AB4ED] text-[#191919] font-bold text-sm rounded-xl transition shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Popular Search Suggestions */}
          <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
            <span className="font-semibold text-gray-600 flex items-center gap-1">
              Popular topics:
            </span>
            {POPULAR_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-3 py-1 rounded-full border transition font-medium ${
                  query.toLowerCase() === suggestion.toLowerCase()
                    ? 'bg-[#7AC2F9] text-[#191919] border-[#7AC2F9] font-bold'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Results Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Results', count: searchResults.totalMatches },
              { id: 'tutoring', label: 'Tutoring & Subjects', count: searchResults.subjects.length },
              { id: 'wellbeing', label: 'Wellbeing & Mental Health', count: searchResults.resources.filter(r => r.category === 'Wellbeing').length },
              { id: 'send', label: 'SEND Resources', count: searchResults.resources.filter(r => r.category === 'SEND').length },
              { id: 'study', label: 'Study Tips & Revision', count: searchResults.resources.filter(r => r.category === 'Study Tips').length },
              { id: 'webinars', label: 'Webinars & Sessions', count: searchResults.webinars.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                  selectedFilter === tab.id
                    ? 'bg-[#191919] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  selectedFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Showing <strong className="text-gray-800">{totalVisibleResults}</strong> result{totalVisibleResults !== 1 ? 's' : ''} {query ? `for "${query}"` : ''}
          </p>
        </div>

        {/* 1. SUBJECTS & TUTORING SECTION */}
        {showSubjects && searchResults.subjects.length > 0 && (
          <section className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F76B7] bg-[#EAF6FF] px-3 py-1 rounded-md">
                  1-to-1 Tutoring &amp; Learning Options
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#191919] mt-2 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-[#7AC2F9]" />
                  Subject Tutoring Programs ({searchResults.subjects.length})
                </h2>
              </div>
              <Link
                href="/tutoring"
                className="text-sm font-bold text-[#0F76B7] hover:text-blue-700 flex items-center gap-1 group"
              >
                How Tutoring Membership Works <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Explanatory Membership Callout */}
            <div className="bg-gradient-to-r from-blue-50 to-[#EAF6FF] border border-[#BDE7FF] rounded-2xl p-5 sm:p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-[#0F76B7] flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#0F76B7]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#191919]">
                    Tutoring is tailored 1-on-1 with DBS-checked specialists
                  </h3>
                  <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                    To deliver high quality, consistent learning, Skill Space uses flexible tutoring memberships (from £80/mo) or a £15 introductory session. Select any subject below to review curriculum coverage, then join a plan to be paired with the perfect matched tutor. Individual tutors are not browsed directly without a membership.
                  </p>
                </div>
              </div>
            </div>

            {/* Subject Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#7AC2F9] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                          {subject.category}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-[#191919] mt-1.5">
                          {subject.title}
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0F76B7] bg-[#EAF6FF] px-2.5 py-1 rounded-lg flex-shrink-0">
                        {subject.badge}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {subject.description}
                    </p>

                    {/* Levels */}
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Key Stages &amp; Levels Covered:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {subject.levels.map((level) => (
                          <span
                            key={level}
                            className="text-xs bg-gray-50 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200 font-medium"
                          >
                            {level}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Topics covered chips */}
                    <div className="mb-5">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        What Learners Focus On:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {subject.coverage.map((topic) => (
                          <span
                            key={topic}
                            className="text-xs bg-blue-50/60 text-[#0F76B7] px-2 py-0.5 rounded-md font-medium"
                          >
                            • {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Membership Notice Box */}
                    <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl mb-5 text-xs text-amber-900 flex items-start gap-2">
                      <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Tutoring Membership Required:</strong> {subject.membershipNote}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <Link
                      href={subject.actionHref}
                      className="flex-1 text-center py-2.5 px-4 bg-[#7AC2F9] hover:bg-[#6AB4ED] text-[#191919] font-bold text-xs sm:text-sm rounded-xl transition"
                    >
                      {subject.actionLabel}
                    </Link>
                    <Link
                      href={subject.introHref}
                      className="text-center py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold text-xs sm:text-sm rounded-xl transition"
                    >
                      {subject.introLabel}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. TOPICS, GUIDES & RESOURCES SECTION */}
        {showResources && filteredResources.length > 0 && (
          <section className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">
                  Guides, Toolkits &amp; Topic Hubs
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#191919] mt-2 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                  Resources &amp; Toolkits ({filteredResources.length})
                </h2>
              </div>
              <Link
                href="/resources"
                className="text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
              >
                Browse All Resources <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <article
                  key={resource.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        {resource.category}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        resource.accessType === 'Downloadable PDF'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {resource.accessType === 'Downloadable PDF' ? <Download className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {resource.accessType}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#191919] mb-2 hover:text-[#0F76B7] transition">
                      <Link href={resource.href}>
                        {resource.title}
                      </Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                      {resource.description}
                    </p>

                    {resource.meta && (
                      <p className="text-xs font-semibold text-gray-400 mb-4">
                        {resource.meta}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      {resource.type}
                    </span>
                    <Link
                      href={resource.href}
                      className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0F76B7] hover:text-blue-700"
                    >
                      {resource.accessType === 'Downloadable PDF' ? 'View Toolkit' : 'Read Guide'} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 3. WEBINARS & WORKSHOPS SECTION */}
        {showWebinars && searchResults.webinars.length > 0 && (
          <section className="mb-14">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-md">
                  Live &amp; On-Demand Sessions
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#191919] mt-2 flex items-center gap-2">
                  <Video className="w-6 h-6 text-purple-600" />
                  Webinars &amp; Masterclasses ({searchResults.webinars.length})
                </h2>
              </div>
              <Link
                href="/webinars"
                className="text-sm font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 group"
              >
                Browse Webinar Hub <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {searchResults.webinars.map((webinar) => (
                <div
                  key={webinar.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                        {webinar.audience}
                      </span>
                      <span className="text-xs font-extrabold text-[#0F76B7]">
                        {webinar.price === 0 ? 'Free' : `£${webinar.price}`}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#191919] mb-2">
                      {webinar.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                      {webinar.description}
                    </p>

                    <div className="space-y-1 text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{webinar.dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{webinar.timeStr}</span>
                      </div>
                      <p className="text-gray-700 font-medium pt-1">
                        Speaker: {webinar.speaker}
                      </p>
                    </div>

                    {webinar.isIncludedWithMembership && (
                      <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md mb-4 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Included with Tutoring Membership</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <Link
                      href={webinar.href}
                      className="w-full block text-center py-2 px-3 bg-[#7AC2F9] hover:bg-[#6AB4ED] text-[#191919] font-bold text-xs rounded-xl transition"
                    >
                      View Webinar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. EMPTY STATE */}
        {totalVisibleResults === 0 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0F76B7] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#191919] mb-2">
              No exact matches found for &quot;{query}&quot;
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mb-8 max-w-md mx-auto">
              Try searching with broader terms like <strong>Maths</strong>, <strong>Science</strong>, <strong>Anxiety</strong>, <strong>EHCP</strong>, or <strong>Revision</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <Link
                href="/tutoring"
                className="p-4 rounded-xl border border-gray-200 hover:border-[#7AC2F9] hover:bg-blue-50/50 transition group"
              >
                <GraduationCap className="w-5 h-5 text-[#0F76B7] mb-2" />
                <h3 className="font-bold text-sm text-[#191919] group-hover:text-[#0F76B7]">Tutoring Hub</h3>
                <p className="text-xs text-gray-500 mt-1">Explore subject options and learning memberships</p>
              </Link>
              <Link
                href="/resources"
                className="p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
              >
                <BookOpen className="w-5 h-5 text-emerald-600 mb-2" />
                <h3 className="font-bold text-sm text-[#191919] group-hover:text-emerald-700">Resource Library</h3>
                <p className="text-xs text-gray-500 mt-1">Wellbeing, SEND, and practical study toolkits</p>
              </Link>
              <Link
                href="/webinars"
                className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition group"
              >
                <Video className="w-5 h-5 text-purple-600 mb-2" />
                <h3 className="font-bold text-sm text-[#191919] group-hover:text-purple-700">Webinar Hub</h3>
                <p className="text-xs text-gray-500 mt-1">Live masterclasses and parent workshops</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AC2F9] mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium text-sm">Searching Skill Space...</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
