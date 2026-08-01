'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function IntroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tutors/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Empowering Learning.<br />
          <span className="text-blue-600">Inspiring Growth.</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
          Skill Share is an online learning platform offering expert tutoring, short courses, webinars, 
          and parent support — all designed to build academic success, confidence, and lifelong skills.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-200 p-2">
              <Search className="w-6 h-6 text-gray-400 ml-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for courses, topics or skills…"
                className="flex-1 px-4 py-4 text-lg border-none outline-none rounded-xl placeholder-gray-500"
              />
              <button
                type="submit"
                className="h-12 bg-[#7AC2F9] text-black rounded-full pl-5 pr-0 py-1.5 flex items-center group hover:bg-[#6AB4ED] transition-all font-semibold"
              >
                <span className="mr-3">Search</span>
                <span className="w-12 h-12 rounded-full bg-[#191919] text-white flex items-center justify-center -mr-1 group-hover:bg-[#2a2a2a] transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}