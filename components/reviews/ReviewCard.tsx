import React from 'react';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';
import StarRating from '@/components/reviews/StarRating';
import { Building2, BadgeCheck } from 'lucide-react';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  onFlag?: (reviewId: string) => void;
  showCompany?: boolean;
  homepage?: boolean;
}

const avatarColors = [
  { bg: '#E1F5EE', color: '#0F6E56' },
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#EEEDFE', color: '#534AB7' },
  { bg: '#FAECE7', color: '#993C1D' },
  { bg: '#EAF3DE', color: '#3B6D11' },
  { bg: '#E6F1FB', color: '#185FA5' },
];

export default function ReviewCard({
  review,
  onFlag,
  showCompany = false,
  homepage = false,
}: ReviewCardProps) {
  const reviewerName = review.reviewer?.fullName || 'Anonymous';
  const initials = reviewerName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  const avatarColor = avatarColors[reviewerName.charCodeAt(0) % avatarColors.length];

  if (homepage) {
    return (
      <article className="review-card">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: avatarColor.bg, color: avatarColor.color }}
          >
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[var(--text-primary)]">{reviewerName}</span>
              {review.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-accent" />}
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {review.company?.industry || 'Kenya'} &middot; reviews
            </span>
          </div>
        </div>

        {/* Stars */}
        <div className="flex gap-0.5 mb-2.5">
          <StarRating value={review.rating} readonly size="sm" />
        </div>

        {/* Title */}
        {review.title && (
          <div className="text-[15px] font-semibold text-[var(--text-primary)] mb-2">
            {review.title}
          </div>
        )}

        {/* Body */}
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
          {review.content}
        </p>

        {/* Company tag */}
        {showCompany && review.company && (
          <Link
            href={`/companies/${review.company.slug}`}
            className="inline-flex items-center gap-1.5 mt-3.5 text-xs text-[var(--text-muted)] px-2.5 py-1.5 bg-[var(--gray-50)] rounded-[6px] hover:bg-[var(--teal-50)] transition-colors"
          >
            <Building2 className="w-3 h-3" />
            {review.company.name} &middot; {timeAgo(review.createdAt)}
          </Link>
        )}
      </article>
    );
  }

  return (
    <article className="review-card">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: avatarColor.bg, color: avatarColor.color }}
        >
          {initials}
        </div>
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">{reviewerName}</div>
          <div className="text-xs text-[var(--text-muted)]">{timeAgo(review.createdAt)}</div>
        </div>
      </div>
      <div className="flex gap-0.5 mb-2.5">
        <StarRating value={review.rating} readonly size="sm" />
      </div>
      {review.title && (
        <div className="text-base font-semibold text-[var(--text-primary)] mb-2">{review.title}</div>
      )}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">{review.content}</p>
      {showCompany && review.company && (
        <Link
          href={`/companies/${review.company.slug}`}
          className="inline-flex items-center gap-1.5 mt-3 text-xs text-[var(--text-muted)] px-2.5 py-1.5 bg-[var(--gray-50)] rounded-[6px] hover:bg-[var(--teal-50)] transition-colors"
        >
          {review.company.name} &middot; {timeAgo(review.createdAt)}
        </Link>
      )}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
        <Link href={`/reviews/${review.id}`} className="text-sm text-accent hover:underline font-medium">Read more</Link>
        {onFlag && review.status === 'PUBLISHED' && (
          <button
            onClick={() => onFlag(review.id)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--coral-400)] transition-colors"
          >
            Report
          </button>
        )}
      </div>
    </article>
  );
}
