import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import StarRating from '@/components/reviews/StarRating';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowLeft, Send, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EditReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const { data, error, isLoading } = useSWR<
    { success: boolean; data: any }
  >(id ? `/api/reviews/${id}` : null, fetcher);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Pre-fill form when data loads
  useEffect(() => {
    if (data?.data) {
      const review = data.data;
      setRating(review.rating || 0);
      setTitle(review.title || '');
      setContent(review.content || '');
    }
  }, [data]);

  if (status === 'loading' || isLoading || !router.isReady) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.replace(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
    return null;
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Review not found</h1>
          <p className="text-gray-500 mb-4">This review may have been removed or doesn&apos;t exist.</p>
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const review = data.data;
  const userId = (session?.user as Record<string, unknown>)?.id as string;
  const isOwner = userId === review.reviewerId;

  // Check 48-hour edit window
  const created = new Date(review.createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  const canEdit = isOwner && hoursDiff <= 48 && review.status !== 'REMOVED';

  if (!canEdit) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {!isOwner ? 'Access Denied' : 'Edit Window Expired'}
          </h1>
          <p className="text-gray-500 mb-4">
            {!isOwner
              ? 'You can only edit your own reviews.'
              : 'Reviews can only be edited within 48 hours of posting.'}
          </p>
          <Link href={`/reviews/${id}`}>
            <Button variant="outline">Back to Review</Button>
          </Link>
        </div>
      </div>
    );
  }

  const maxContentLength = 2000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Validate
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!title.trim() || title.trim().length < 5) {
      toast.error('Title must be at least 5 characters');
      return;
    }
    if (!content.trim() || content.trim().length < 20) {
      toast.error('Review must be at least 20 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || d.error || 'Failed to update review');
      }

      toast.success('Review updated successfully!');
      router.push(`/reviews/${id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Edit Review — TrustFiti</title>
        <meta name="description" content="Edit your review on TrustFiti." />
      </Head>

      <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <Link
            href={`/reviews/${id}`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Review
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Review</h1>
            <p className="text-gray-500 text-sm">
              Update your review for{' '}
              <span className="font-medium text-gray-700">
                {review.company?.name || 'this company'}
              </span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
            {submitError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {submitError}
              </div>
            )}

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <StarRating value={rating} onChange={setRating} size="lg" />
                {rating > 0 && (
                  <span className="text-sm text-gray-500">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Bad'}
                    {rating === 3 && 'Average'}
                    {rating === 4 && 'Good'}
                    {rating === 5 && 'Excellent'}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <Input
              label="Review Title"
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell others about your experience with this company..."
                rows={5}
                maxLength={maxContentLength}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-150 resize-none focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-emerald-500 focus:ring-emerald-200"
              />
              <div className="flex justify-end mt-1.5">
                <p className={`text-xs ${content.length > maxContentLength * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                  {content.length}/{maxContentLength}
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <Link href={`/reviews/${id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={isSubmitting} className="flex-1">
                <Send className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
