"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';

interface Review {
  _id: string;
  student: {
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
  categories?: {
    communication?: number;
    punctuality?: number;
    knowledge?: number;
    helpfulness?: number;
  };
}

export default function TutorReviews() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStars: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'tutor')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'tutor') {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?tutorId=${user?.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        calculateStats(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (reviewsList: Review[]) => {
    const total = reviewsList.length;
    if (total === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStars: 0
      });
      return;
    }

    const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / total;

    setStats({
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: total,
      fiveStars: reviewsList.filter(r => r.rating === 5).length,
      fourStars: reviewsList.filter(r => r.rating === 4).length,
      threeStars: reviewsList.filter(r => r.rating === 3).length,
      twoStars: reviewsList.filter(r => r.rating === 2).length,
      oneStars: reviewsList.filter(r => r.rating === 1).length
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getRatingPercentage = (count: number) => {
    return stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
  };

  if (loading || isLoading) return <div>Loading...</div>;
  if (!user || user.role !== 'tutor') return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Student Reviews
          </h1>
          <p className="text-lg text-gray-600">
            See what your students say about you
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Overall Rating */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-900 mb-2">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
              </div>
              <div className="flex items-center justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(stats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="font-bold text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = rating === 5 ? stats.fiveStars :
                             rating === 4 ? stats.fourStars :
                             rating === 3 ? stats.threeStars :
                             rating === 2 ? stats.twoStars : stats.oneStars;
                const percentage = getRatingPercentage(count);

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center w-20">
                      <span className="text-sm font-semibold text-gray-700">{rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 ml-1" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-600">
                Complete sessions to receive reviews from your students
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {review.student?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          {review.student?.name || 'Anonymous'}
                          {review.isVerified && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              Verified
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{review.comment}</p>

                  {review.categories && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                      {review.categories.communication && (
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-900">
                            {review.categories.communication}/5
                          </p>
                          <p className="text-xs text-gray-600">Communication</p>
                        </div>
                      )}
                      {review.categories.punctuality && (
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-900">
                            {review.categories.punctuality}/5
                          </p>
                          <p className="text-xs text-gray-600">Punctuality</p>
                        </div>
                      )}
                      {review.categories.knowledge && (
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-900">
                            {review.categories.knowledge}/5
                          </p>
                          <p className="text-xs text-gray-600">Knowledge</p>
                        </div>
                      )}
                      {review.categories.helpfulness && (
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-900">
                            {review.categories.helpfulness}/5
                          </p>
                          <p className="text-xs text-gray-600">Helpfulness</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
