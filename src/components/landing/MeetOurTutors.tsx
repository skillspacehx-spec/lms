'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Shield, ChevronDown } from 'lucide-react';
import Button from '../common/Button';

interface Tutor {
  _id: string;
  name: string;
  avatar?: string;
  subjects: string[];
  bio: string;
  experience: number;
  qualifications: string[];
}

const SUBJECTS = ['All Subjects', 'Mathematics', 'English', 'Science', 'History', 'Geography', 'French', 'Spanish', 'Physics', 'Chemistry', 'Biology'];
const AGE_GROUPS = ['All Ages', '5-8', '9-11', '12-14', '15-16', '17-18'];
const EXPERIENCE_OPTIONS = [
  { label: 'Any Experience', value: '' },
  { label: '1+ years', value: '1' },
  { label: '3+ years', value: '3' },
  { label: '5+ years', value: '5' },
  { label: '10+ years', value: '10' },
];

export default function MeetOurTutors() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subject, setSubject] = useState('All Subjects');
  const [ageGroup, setAgeGroup] = useState('All Ages');
  const [experience, setExperience] = useState('');

  useEffect(() => {
    fetchTutors();
  }, [subject, ageGroup, experience]);

  const fetchTutors = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '6' });
      if (subject !== 'All Subjects') params.set('subject', subject);
      if (ageGroup !== 'All Ages') params.set('ageGroup', ageGroup);
      if (experience) params.set('experience', experience);

      const response = await fetch(`/api/tutors?${params.toString()}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setTutors(data.tutors || []);
      }
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTutorInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const getAgeRange = (experience: number) => {
    if (experience >= 5) return 'All ages';
    if (experience >= 3) return 'Ages 8-18';
    return 'Ages 5-16';
  };

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Meet Our Trusted Tutors
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Personalised learning support from DBS-checked tutors experienced in working with young people.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          {/* Subject Filter */}
          <div className="flex-1 relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">Subject</label>
            <div className="relative">
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] cursor-pointer"
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Age Group Filter */}
          <div className="flex-1 relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">Age Group</label>
            <div className="relative">
              <select
                value={ageGroup}
                onChange={e => setAgeGroup(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] cursor-pointer"
              >
                {AGE_GROUPS.map(a => <option key={a} value={a}>{a === 'All Ages' ? 'All Ages' : `Ages ${a}`}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Experience Filter */}
          <div className="flex-1 relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">Experience</label>
            <div className="relative">
              <select
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#7AC2F9] cursor-pointer"
              >
                {EXPERIENCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Reset */}
          {(subject !== 'All Subjects' || ageGroup !== 'All Ages' || experience) && (
            <div className="flex items-end">
              <button
                onClick={() => { setSubject('All Subjects'); setAgeGroup('All Ages'); setExperience(''); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Tutors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              </div>
            ))
          ) : tutors.length === 0 ? (
            <div className="col-span-3 text-center py-16">
              <p className="text-gray-500 text-lg mb-4">No tutors found matching your filters.</p>
              <button
                onClick={() => { setSubject('All Subjects'); setAgeGroup('All Ages'); setExperience(''); }}
                className="text-[#7AC2F9] font-semibold hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            tutors.map(tutor => (
              <Link
                key={tutor._id}
                href={`/tutors/${tutor._id}`}
                className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Tutor Photo */}
                <div className="text-center mb-4">
                  {tutor.avatar ? (
                    <Image
                      src={tutor.avatar}
                      alt={tutor.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover mx-auto ring-2 ring-[#7AC2F9] ring-offset-2"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto ring-2 ring-[#7AC2F9] ring-offset-2">
                      {getTutorInitials(tutor.name)}
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2 group-hover:text-[#7AC2F9] transition-colors">
                  {tutor.name}
                </h3>

                <div className="text-center mb-2">
                  <span className="text-gray-600 text-sm">
                    {tutor.subjects.slice(0, 2).join(', ')}
                    {tutor.subjects.length > 2 && ` +${tutor.subjects.length - 2} more`}
                  </span>
                </div>

                <div className="text-center mb-3">
                  <span className="text-gray-500 text-sm">{getAgeRange(tutor.experience || 0)}</span>
                </div>

                <p className="text-gray-600 text-sm text-center mb-4 line-clamp-2">{tutor.bio}</p>

                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <Shield className="w-3 h-3 mr-1" />
                    DBS Checked
                  </span>
                  {tutor.experience >= 3 && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      <Check className="w-3 h-3 mr-1" />
                      SEN Experience
                    </span>
                  )}
                </div>

                <div className="text-center">
                  <span className="inline-block px-5 py-2 bg-[#7AC2F9] text-[#191919] rounded-full text-sm font-bold group-hover:bg-[#6AB4ED] transition-colors">
                    View Profile
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Link href="/tutors/browse" className="text-blue-600 hover:underline font-medium">
            View all our tutors
          </Link>
        </div>
      </div>
    </section>
  );
}
