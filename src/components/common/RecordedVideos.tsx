'use client';

import React, { useState, useEffect } from 'react';
import { Play, Download, Clock, Users, BookOpen, Search, Calendar, Filter, Eye, Share2 } from 'lucide-react';
import Link from 'next/link';

interface VideoRecord {
  _id: string;
  title: string;
  description: string;
  subject: string;
  duration: number;
  recordingDate: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  relatedClass?: {
    _id: string;
    title: string;
    subject: string;
    scheduledAt: string;
  };
  thumbnailUrl?: string;
  streamingUrl?: string;
  originalUrl?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  participantCount: number;
  quality: string;
  fileSize: number;
  allowDownload: boolean;
  allowSharing: boolean;
  isPublic: boolean;
}

interface RecordedVideosProps {
  userRole: 'student' | 'tutor' | 'parent' | 'admin';
  userId: string;
}

const RecordedVideos: React.FC<RecordedVideosProps> = ({ userRole, userId }) => {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    subject: '',
    instructor: '',
    search: '',
    status: 'all'
  });

  useEffect(() => {
    fetchVideos();
  }, [filter]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.subject) params.set('subject', filter.subject);
      if (filter.instructor) params.set('instructor', filter.instructor);
      if (filter.search) params.set('search', filter.search);
      if (filter.status !== 'all') params.set('status', filter.status);

      const response = await fetch(`/api/videos/process?${params}`);
      const data = await response.json();

      if (data.success) {
        setVideos(data.recordings);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePlayVideo = (video: VideoRecord) => {
    if (video.processingStatus === 'completed' && video.streamingUrl) {
      // Open video player modal or navigate to video page
      window.open(`/videos/${video._id}`, '_blank');
    } else if (video.originalUrl) {
      // Fallback to original URL
      window.open(video.originalUrl, '_blank');
    } else {
      alert('Video is not ready for playback yet. Please try again later.');
    }
  };

  const handleDownload = async (video: VideoRecord) => {
    if (!video.allowDownload) {
      alert('Download is not allowed for this video.');
      return;
    }

    if (video.originalUrl) {
      const link = document.createElement('a');
      link.href = video.originalUrl;
      link.download = `${video.title}.mp4`;
      link.click();
    } else {
      alert('Download link is not available.');
    }
  };

  const subjects = [...new Set(videos.map(v => v.subject))];
  const instructors = [...new Set(videos.map(v => v.instructor))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recorded Classes</h2>
          <p className="text-gray-600 mt-1">
            Access recorded class sessions and educational content
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filter.subject}
            onChange={(e) => setFilter(prev => ({ ...prev, subject: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <select
            value={filter.instructor}
            onChange={(e) => setFilter(prev => ({ ...prev, instructor: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Instructors</option>
            {instructors.map(instructor => (
              <option key={instructor._id} value={instructor._id}>{instructor.name}</option>
            ))}
          </select>

          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Ready to Watch</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-2">Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recordings found</h3>
          <p className="text-gray-500">
            No recorded classes match your current filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video._id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-200">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                    <Play className="w-12 h-12 text-blue-400" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handlePlayVideo(video)}
                    className="opacity-0 hover:opacity-100 bg-white bg-opacity-90 rounded-full p-3 transition-opacity"
                    disabled={video.processingStatus !== 'completed' && !video.originalUrl}
                  >
                    <Play className="w-6 h-6 text-gray-800" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(video.processingStatus)}`}>
                    {video.processingStatus}
                  </span>
                </div>

                {/* Duration */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                    {video.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {video.description}
                </p>

                {/* Metadata */}
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {video.subject}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {video.participantCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(video.recordingDate).toLocaleDateString()}
                    </span>
                    <span>{formatFileSize(video.fileSize)}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-gray-700 font-medium">
                      {video.instructor.name}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePlayVideo(video)}
                      disabled={video.processingStatus !== 'completed' && !video.originalUrl}
                      className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                      title="Play Video"
                    >
                      <Play className="w-4 h-4" />
                    </button>

                    {video.allowDownload && (
                      <button
                        onClick={() => handleDownload(video)}
                        className="text-green-600 hover:text-green-700"
                        title="Download Video"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    {video.allowSharing && (
                      <button
                        className="text-purple-600 hover:text-purple-700"
                        title="Share Video"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <Link
                    href={`/videos/${video._id}`}
                    className="text-gray-600 hover:text-gray-700"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Processing Notice */}
      {videos.some(v => v.processingStatus === 'processing' || v.processingStatus === 'pending') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
            <p className="text-yellow-800 text-sm">
              Some videos are still being processed. They will be available for streaming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordedVideos;