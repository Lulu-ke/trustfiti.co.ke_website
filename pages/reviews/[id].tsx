import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import StarRating from '@/components/reviews/StarRating';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  formatDate,
  timeAgo,
} from '@/lib/utils';
import {
  MessageSquare,
  Flag,
  Edit3,
  Trash2,
  ChevronLeft,
  Building2,
  Clock,
  Star,
} from 'lucide-react';
import type { Review } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReviewDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const { data, error, isLoading } = useSWR<Review & { replies?: Review['replies'] }>(
    id ? `/api/reviews/${id}` : null,
    fetcher
  );

  const handleFlag = async () => {
    try {
      const res = await fetch(`/api/reviews/${id}/flag`, { method: 'POST' });
      if (res.ok) {
        toast.success('Review reported. We will review it shortly.');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to report review');
      }
    } catch {
      toast.error('Failed to report review');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Review deleted successfully.');
        router.push('/profile');
      } else {
        toast.error('Failed to delete review');
      }
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const isOwner = session?.user && data && (session.user as Record<string, unknown>).id === data.reviewerId;

  const canEdit = isOwner && data && (() => {
    const created = new Date(data.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 48;
  })();

  if (isLoading || !router.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Review not found
          </h1>
          <p className="text-gray-500 mb-4">
            This review may have been removed or doesn&apos;t exist.
          </p>
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const review = data;

  return (
    <>
      <Head>
        <title>{review.title || 'Review'} — TrustFiti</title>
        <meta name="description" content={review.content.substring(0, 160)} />
      </Head>

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <Link
            href={review.company?.slug ? `/companies/${review.company.slug}` : '/companies'}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
                {/* Status Badge */}
                {review.isFeatured && (
                  <Badge variant="info" className="mb-4">
                    <Star className="h-3 w-3 inline mr-1 fill-current" />
                    Featured Review
                  </Badge>
                )}

                {/* Reviewer Info */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    src={review.reviewer?.avatar}
                    name={review.reviewer?.fullName}
                    size="md"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {review.reviewer?.fullName || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{formatDate(review.createdAt)}</span>
                      <span>·</span>
                      <span>{timeAgo(review.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Rating + Title */}
                <div className="mb-4">
                  <StarRating value={review.rating} readonly size="lg" />
                  {review.title && (
                    <h1 className="text-xl font-bold text-gray-900 mt-3">
                      {review.title}
                    </h1>
                  )}
                </div>

                {/* Content */}
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    {review._count?.replies !== undefined && (
                      <span className="flex items-center gap-1 text-sm text-gray-400">
                        <MessageSquare className="h-4 w-4" />
                        {review._count.replies} {review._count.replies === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <Link href={`/reviews/${id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                    )}
                    {canEdit && (
                      <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    )}
                    {!isOwner && (
                      <Button variant="ghost" size="sm" onClick={handleFlag} className="text-gray-400 hover:text-red-500">
                        <Flag className="h-4 w-4" />
                        Report
                      </Button>
                    )}
                  </div>
                </div>

                {/* Replies Section */}
                {review.replies && review.replies.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                      Replies ({review.replies.length})
                    </h3>
                    <div className="space-y-4">
                      {review.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar
                              src={reply.author?.avatar}
                              name={reply.author?.fullName}
                              size="sm"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {reply.author?.fullName || 'Company Representative'}
                            </span>
                            <Badge variant="success" className="text-xs">
                              Business Reply
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {timeAgo(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Company Card */}
              {review.company && (
                <Link href={`/companies/${review.company.slug}`}>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      {review.company.logo ? (
                        <img
                          src={review.company.logo}
                          alt={review.company.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {review.company.name}
                        </h3>
                        {review.company.industry && (
                          <p className="text-xs text-gray-500">
                            {review.company.industry}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                      View company profile
                      <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
                    </div>
                  </div>
                </Link>
              )}

              {/* Review Info */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Review Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Published {formatDate(review.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span>{review.rating} out of 5</span>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Edit3 className="h-4 w-4" />
                      <span>Editable for 48 hours</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
