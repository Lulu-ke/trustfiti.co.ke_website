import React from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import StarRating from '@/components/reviews/StarRating';
import { MapPin, ArrowRight } from 'lucide-react';
import type { Company } from '@/types';

interface CompanyCardProps {
  company: Company;
}

const avatarColors = [
  { bg: '#E1F5EE', color: '#0F6E56' },
  { bg: '#FAEEDA', color: '#854F0B' },
  { bg: '#FAECE7', color: '#993C1D' },
  { bg: '#E6F1FB', color: '#185FA5' },
  { bg: '#EEEDFE', color: '#534AB7' },
  { bg: '#EAF3DE', color: '#3B6D11' },
  { bg: '#F5E6F3', color: '#7B2D6A' },
  { bg: '#E8F4FD', color: '#1A6B8A' },
  { bg: '#FFF3E0', color: '#A66B16' },
  { bg: '#E0F7F0', color: '#0A6B52' },
];

function getColorForName(name: string) {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const avatarColor = getColorForName(company.name);

  return (
    <Link href={`/companies/${company.slug}`}>
      <article className="company-card group">
        <div className="flex items-start gap-3.5 mb-4">
          {/* Logo */}
          <div
            className="w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0 font-head text-base font-extrabold"
            style={{ background: avatarColor.bg, color: avatarColor.color }}
          >
            {company.logo ? (
              <img src={company.logo} alt="" className="w-full h-full rounded-[12px] object-cover" />
            ) : (
              company.name.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-head text-base font-bold text-[var(--text-primary)] truncate group-hover:text-accent transition-colors">
              {company.name}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {company.industry}{company.city ? ` · ${company.city}` : ''}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          {company.isVerified && (
            <span className="badge badge-verified">&#10003; Verified</span>
          )}
          {!company.isVerified && company.isClaimed && (
            <span className="badge badge-claimed">&#10003; Claimed</span>
          )}
          {!company.isClaimed && !company.isVerified && (
            <span className="badge badge-unclaimed">&#2B21; Unclaimed</span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating value={company.averageRating} readonly size="sm" />
          <span className="font-head text-base font-bold text-[var(--text-primary)]">
            {company.averageRating.toFixed(1)}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {formatNumber(company.totalReviews)} reviews
          </span>
        </div>

        {/* Meta */}
        {company.city && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <MapPin className="w-3 h-3" />
            {company.city}{company.country !== 'Kenya' ? `, ${company.country}` : ', Kenya'}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
          <span className="text-[13px] font-medium text-accent hover:underline">
            Write a review <ArrowRight className="w-3 h-3 inline" />
          </span>
        </div>
      </article>
    </Link>
  );
}
