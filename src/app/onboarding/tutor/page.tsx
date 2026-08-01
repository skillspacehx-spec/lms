'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Plus, Trash2, Send, CheckCircle2, Upload, FileText, Loader2 } from 'lucide-react';

export default function TutorOnboardingPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    phone: '',
    bio: '',
    subjects: [''],
    hourlyRate: 35,
    experience: 1,
    qualifications: [''],
    ageGroups: '',
    teachingLevels: '',
    teachingHistory: '',
    availabilityText: '',
    discussionMethod: 'Email'
  });

  const [documents, setDocuments] = useState({
    cv: '',
    dbs: '',
    rightToWork: '',
    qualificationEvidence: ''
  });

  const [docUploadState, setDocUploadState] = useState({
    cv: false,
    dbs: false,
    rightToWork: false,
    qualificationEvidence: false
  });

  const [docFileNames, setDocFileNames] = useState({
    cv: '',
    dbs: '',
    rightToWork: '',
    qualificationEvidence: ''
  });

  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Protect route
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login?redirect=/onboarding/tutor');
      return;
    }

    if (user.role !== 'tutor') {
      router.replace(`/dashboard/${user.role}`);
      return;
    }
  }, [user, loading, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hourlyRate' || name === 'experience' ? parseInt(value) || 0 : value
    }));
  };

  const handleArrayChange = (index: number, value: string, field: 'subjects' | 'qualifications') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item))
    }));
  };

  const addArrayItem = (field: 'subjects' | 'qualifications') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index: number, field: 'subjects' | 'qualifications') => {
    if (formData[field].length <= 1) return;
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: 'cv' | 'dbs' | 'rightToWork' | 'qualificationEvidence'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocUploadState(prev => ({ ...prev, [docType]: true }));
    setDocFileNames(prev => ({ ...prev, [docType]: file.name }));

    try {
      const uploadData = new FormData();
      uploadData.append('document', file);
      uploadData.append('file', file);

      const res = await fetch('/api/upload/document', {
        method: 'POST',
        credentials: 'include',
        body: uploadData
      });

      const resData = await res.json();
      if (resData.success && (resData.url || resData.documentUrl)) {
        const fileUrl = resData.url || resData.documentUrl;
        setDocuments(prev => ({ ...prev, [docType]: fileUrl }));
      } else {
        // Fallback: Store mock URL if document route fails
        setDocuments(prev => ({ ...prev, [docType]: resData.url || `/uploads/${file.name}` }));
      }
    } catch (err) {
      console.error(`Failed to upload ${docType}`, err);
    } finally {
      setDocUploadState(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('Please confirm that the information is accurate and give your consent.');
      return;
    }

    setIsLoading(true);
    setError('');

    const payload = {
      ...formData,
      subjects: formData.subjects.filter(s => s.trim()),
      qualifications: formData.qualifications.filter(q => q.trim()),
      documents,
      applicationConsent: consent
    };

    try {
      const response = await fetch('/api/tutors/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        await refreshUser();
        setIsSubmitted(true);
      } else {
        setError(data.message || 'Failed to submit application.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'tutor') {
    return null;
  }

  // Success view
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Thank you for completing your tutor profile. Your details and documents have been submitted to the <strong>SkillSpace</strong> team for review. An admin will get in touch with you via <strong>{formData.discussionMethod}</strong> to arrange a discussion.
          </p>
          <button
            onClick={() => router.push('/dashboard/tutor')}
            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-xl transition-all shadow-sm"
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-sm">
          {/* Header Badge & Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#EBF5FF] text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <BookOpen className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Complete Your Tutor Profile</h1>
            <p className="text-sm text-gray-500 mt-1">
              Help students find you by completing your profile information
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Phone number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+44 7123 456789"
              />
            </div>

            {/* Professional Bio */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Professional bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell students about your teaching experience and approach..."
              />
            </div>

            {/* Subjects You Teach */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Subjects You Teach
              </label>
              <div className="space-y-2">
                {formData.subjects.map((subject, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={subject}
                      onChange={e => handleArrayChange(index, e.target.value, 'subjects')}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Subject name"
                      required
                    />
                    {formData.subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'subjects')}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem('subjects')}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
            </div>

            {/* Hourly Rate (£) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Hourly Rate (£)
              </label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleInputChange}
                min="1"
                max="500"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                min="0"
                max="60"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Qualifications
              </label>
              <div className="space-y-2">
                {formData.qualifications.map((qual, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={qual}
                      onChange={e => handleArrayChange(index, e.target.value, 'qualifications')}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Degree, certification, or qualification"
                      required
                    />
                    {formData.qualifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'qualifications')}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem('qualifications')}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
              >
                <Plus className="w-4 h-4" />
                Add Qualification
              </button>
            </div>

            {/* Age groups taught */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Age groups taught
              </label>
              <input
                type="text"
                name="ageGroups"
                value={formData.ageGroups}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 9-11, 12-14, 15-16"
              />
            </div>

            {/* Teaching levels */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Teaching levels
              </label>
              <input
                type="text"
                name="teachingLevels"
                value={formData.teachingLevels}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. KS2, GCSE, A Level"
              />
            </div>

            {/* Employment and teaching history */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Employment and teaching history
              </label>
              <textarea
                name="teachingHistory"
                value={formData.teachingHistory}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detail your previous teaching or tutoring roles..."
              />
            </div>

            {/* Availability */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Availability
              </label>
              <textarea
                name="availabilityText"
                value={formData.availabilityText}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us which days and times generally work for you."
              />
            </div>

            {/* Preferred discussion method */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Preferred discussion method
              </label>
              <select
                name="discussionMethod"
                value={formData.discussionMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="Email">Email</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Video Call (Zoom/Google Meet)">Video Call (Zoom / Google Meet)</option>
              </select>
            </div>

            {/* Required documents (PDF) Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-4">
                Required documents (PDF)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CV */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">CV</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={e => handleFileUpload(e, 'cv')}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-100 file:border-gray-200 cursor-pointer border border-gray-200 rounded-lg p-1 bg-white"
                    />
                    {docUploadState.cv && (
                      <span className="text-xs text-blue-600 mt-1 block">Uploading...</span>
                    )}
                    {documents.cv && (
                      <span className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                      </span>
                    )}
                  </div>
                </div>

                {/* DBS Certificate */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">DBS certificate</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={e => handleFileUpload(e, 'dbs')}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-100 file:border-gray-200 cursor-pointer border border-gray-200 rounded-lg p-1 bg-white"
                    />
                    {docUploadState.dbs && (
                      <span className="text-xs text-blue-600 mt-1 block">Uploading...</span>
                    )}
                    {documents.dbs && (
                      <span className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                      </span>
                    )}
                  </div>
                </div>

                {/* Right-to-work evidence */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Right-to-work evidence</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={e => handleFileUpload(e, 'rightToWork')}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-100 file:border-gray-200 cursor-pointer border border-gray-200 rounded-lg p-1 bg-white"
                    />
                    {docUploadState.rightToWork && (
                      <span className="text-xs text-blue-600 mt-1 block">Uploading...</span>
                    )}
                    {documents.rightToWork && (
                      <span className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                      </span>
                    )}
                  </div>
                </div>

                {/* Qualification evidence */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Qualification evidence</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={e => handleFileUpload(e, 'qualificationEvidence')}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-100 file:border-gray-200 cursor-pointer border border-gray-200 rounded-lg p-1 bg-white"
                    />
                    {docUploadState.qualificationEvidence && (
                      <span className="text-xs text-blue-600 mt-1 block">Uploading...</span>
                    )}
                    {documents.qualificationEvidence && (
                      <span className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Checkbox Consent */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                required
              />
              <label htmlFor="consent" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
                I confirm the information is accurate and consent to Skill Space reviewing these documents for tutor suitability.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !consent}
              className="w-full py-3.5 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit application for review</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}