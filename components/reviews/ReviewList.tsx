import React, { useState } from 'react';
import useSWR from 'swr';
import ReviewCard from './ReviewCard';
import Pagination from '@/components/ui/Pagination';
import { MessageSquare } from 'lucide-react';
import type { Review, Pagination as PaginationType } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ReviewListProps {
  initialPage?: number;
  companyId?: string;
  reviewerId?: string;
  sortBy?: 'recent' | 'highest' | 'lowest';
  ratingFilter?: number | null;
  onFlag?: (reviewId: string) => void;
}

export default function ReviewList({
  initialPage = 1,
  companyId,
  reviewerId,
  sortBy = 'recent',
  ratingFilter = null,
  onFlag,
}: ReviewListProps) {
  const [page, setPage] = useState(initialPage);

  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
    sort: sortBy,
  });
  if (companyId) params.set('companyId', companyId);
  if (reviewerId) params.set('reviewerId', reviewerId);
  if (ratingFilter) params.set('rating', ratingFilter.toString());

  const { data, error, isLoading } = useSWR<{
    reviews: Review[];
    pagination: PaginationType;
  }>(`/api/reviews?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
  });

  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;

  const renderSkeleton = () => (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="skeleton h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
          </div>
          <div className="skeleton h-4 w-24 rounded mb-2" />
          <div className="skeleton h-4 w-full rounded mb-1" />
          <div className="skeleton h-4 w-3/4 rounded" />
        </div>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-medium text-gray-900 mb-1">
          Failed to load reviews
        </h3>
        <p className="text-sm text-gray-500">
          Something went wrong. Please try again.
        </p>
      </div>
    );
  }

  if (!isLoading && reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-medium text-gray-900 mb-1">
          No reviews yet
        </h3>
        <p className="text-sm text-gray-500">
          Be the first to share your experience.
        </p>
      </div>
    );
  }

  return (
    <div>
      {isLoading && !data ? (
        renderSkeleton()
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onFlag={onFlag}
              showCompany={!companyId}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
