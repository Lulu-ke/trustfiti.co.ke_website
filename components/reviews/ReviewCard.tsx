import React from 'react';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';
import StarRating from '@/components/reviews/StarRating';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { MessageSquare, Flag } from 'lucide-react';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  onFlag?: (reviewId: string) => void;
  showCompany?: boolean;
}

export default function ReviewCard({
  review,
  onFlag,
  showCompany = false,
}: ReviewCardProps) {
  const statusBadge: Record<string, { variant: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
    PUBLISHED: { variant: 'success', label: 'Published' },
    FEATURED: { variant: 'success', label: 'Featured' },
    FLAGGED: { variant: 'warning', label: 'Flagged' },
    HIDDEN: { variant: 'neutral', label: 'Hidden' },
  };

  const badgeInfo = review.isFeatured
    ? { variant: 'info' as const, label: 'Featured' }
    : statusBadge[review.status];

  return (
    <article className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      {/* Header: Reviewer Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={review.reviewer?.avatar}
            name={review.reviewer?.fullName}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {review.reviewer?.fullName || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-400">{timeAgo(review.createdAt)}</p>
          </div>
        </div>
        {badgeInfo && review.status !== 'PUBLISHED' && (
          <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
        )}
      </div>

      {/* Rating + Title */}
      <div className="mb-2">
        <StarRating value={review.rating} readonly size="sm" />
        {review.title && (
          <h4 className="text-base font-semibold text-gray-900 mt-2">
            {review.title}
          </h4>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
        {review.content}
      </p>

      {/* Company Info (optional) */}
      {showCompany && review.company && (
        <Link
          href={`/companies/${review.company.slug}`}
          className="inline-flex items-center gap-1.5 mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          {review.company.logo && (
            <img
              src={review.company.logo}
              alt=""
              className="w-4 h-4 rounded object-cover"
            />
          )}
          {review.company.name}
          {review.company.industry && (
            <span className="text-gray-400 font-normal">
              · {review.company.industry}
            </span>
          )}
        </Link>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <Link
          href={`/reviews/${review.id}`}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          Read more
        </Link>

        <div className="flex items-center gap-4">
          {/* Reply count */}
          {(review._count?.replies ?? (review.replies?.length ?? 0)) > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MessageSquare className="h-3.5 w-3.5" />
              {review._count?.replies ?? review.replies?.length}
            </span>
          )}

          {/* Flag button */}
          {onFlag && review.status === 'PUBLISHED' && (
            <button
              onClick={() => onFlag(review.id)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Flag this review"
            >
              <Flag className="h-3.5 w-3.5" />
              Report
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
