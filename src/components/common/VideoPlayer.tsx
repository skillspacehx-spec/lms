'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  Share2,
  BookmarkPlus,
  Clock,
  Eye,
  MessageCircle
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  autoplay?: boolean;
  controls?: boolean;
  watermark?: boolean;
  downloadAllowed?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  className?: string;
}

interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isLoading: boolean;
  showControls: boolean;
  playbackRate: number;
  quality: string;
}

export default function VideoPlayer({
  src,
  title,
  thumbnail,
  duration: propDuration,
  autoplay = false,
  controls = true,
  watermark = true,
  downloadAllowed = false,
  onProgress,
  onComplete,
  onTimeUpdate,
  className = ''
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: propDuration || 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    isLoading: true,
    showControls: true,
    playbackRate: 1,
    quality: 'auto'
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: video.duration,
        isLoading: false
      }));
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      
      setState(prev => ({
        ...prev,
        currentTime
      }));

      if (onTimeUpdate) {
        onTimeUpdate(currentTime, duration);
      }

      if (onProgress) {
        const progress = (currentTime / duration) * 100;
        onProgress(progress);
      }
    };

    const handleEnded = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false
      }));
      
      if (onComplete) {
        onComplete();
      }
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    const handleWaiting = () => {
      setState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setState(prev => ({ ...prev, isLoading: false }));
    };

    const handleVolumeChange = () => {
      setState(prev => ({
        ...prev,
        volume: video.volume,
        isMuted: video.muted
      }));
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('volumechange', handleVolumeChange);

    if (autoplay) {
      video.play().catch(() => {
        // Autoplay failed - this is expected in many browsers
      });
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [autoplay, onTimeUpdate, onProgress, onComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (state.isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * state.duration;

    video.currentTime = newTime;
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    video.muted = newVolume === 0;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setState(prev => ({ ...prev, isFullscreen: true }));
      });
    } else {
      document.exitFullscreen().then(() => {
        setState(prev => ({ ...prev, isFullscreen: false }));
      });
    }
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, state.duration));
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setState(prev => ({ ...prev, playbackRate: rate }));
    setShowSettings(false);
  };

  const showControlsTemporarily = () => {
    setState(prev => ({ ...prev, showControls: true }));
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (state.isPlaying) {
        setState(prev => ({ ...prev, showControls: false }));
      }
    }, 3000);
  };

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadVideo = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title || 'video';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareVideo = () => {
    if (navigator.share) {
      navigator.share({
        title,
        url: window.location.href
      });
    } else {
      setShowShareModal(true);
    }
  };

  const progressPercentage = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => setState(prev => ({ ...prev, showControls: state.isPlaying ? false : true }))}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        className="w-full h-full object-cover"
        onClick={togglePlay}
        preload="metadata"
      />

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Watermark */}
      {watermark && (
        <div className="absolute top-4 left-4 text-white text-sm font-medium opacity-70 z-10">
          Skill Space Learning Hub
        </div>
      )}

      {/* Center Play Button */}
      {!state.isPlaying && !state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all duration-200 transform hover:scale-110"
          >
            <Play className="w-8 h-8 text-gray-800 ml-1" />
          </button>
        </div>
      )}

      {/* Controls Overlay */}
      {controls && (
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 ${
            state.showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Bar */}
          <div className="px-4 pt-4">
            <div
              ref={progressBarRef}
              className="relative h-2 bg-white bg-opacity-30 rounded-full cursor-pointer hover:h-3 transition-all duration-200"
              onClick={handleSeek}
            >
              <div
                className="absolute top-0 left-0 h-full bg-[#7AC2F9] rounded-full transition-all duration-100"
                style={{ width: `${progressPercentage}%` }}
              />
              <div
                className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-[#7AC2F9] rounded-full border-2 border-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-200"
                style={{ left: `calc(${progressPercentage}% - 8px)` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-[#7AC2F9] transition-colors duration-200"
              >
                {state.isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              {/* Skip Buttons */}
              <button
                onClick={() => skipTime(-10)}
                className="text-white hover:text-[#7AC2F9] transition-colors duration-200"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => skipTime(10)}
                className="text-white hover:text-[#7AC2F9] transition-colors duration-200"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2 group">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-[#7AC2F9] transition-colors duration-200"
                >
                  {state.isMuted || state.volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={state.isMuted ? 0 : state.volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 accent-[#7AC2F9] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                />
              </div>

              {/* Time Display */}
              <span className="text-white text-sm">
                {formatTime(state.currentTime)} / {formatTime(state.duration)}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Action Buttons */}
              {downloadAllowed && (
                <button
                  onClick={downloadVideo}
                  className="text-white hover:text-[#7AC2F9] transition-colors duration-200"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={shareVideo}
                className="text-white hover:text-[#7AC2F9] transition-colors duration-200"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                className="text-white hover:text-[#7AC2F9] transition-colors duration-200"
                title="Add to Bookmark"
              >
                <BookmarkPlus className="w-5 h-5" />
              </button>

              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-[#7AC2F9] transition-colors duration-200"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded-lg p-4 min-w-48">
                    <div className="text-white text-sm space-y-3">
                      <div>
                        <label className="block text-gray-300 mb-2">Playback Speed</label>
                        <div className="space-y-1">
                          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                            <button
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className={`block w-full text-left px-2 py-1 rounded hover:bg-white hover:bg-opacity-20 ${
                                state.playbackRate === rate ? 'text-[#7AC2F9]' : ''
                              }`}
                            >
                              {rate}x {rate === 1 ? '(Normal)' : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-[#7AC2F9] transition-colors duration-200"
              >
                {state.isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Video</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShowShareModal(false);
                }}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`);
                  setShowShareModal(false);
                }}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Share on Twitter
              </button>
              <button
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
                  setShowShareModal(false);
                }}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Share on Facebook
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}