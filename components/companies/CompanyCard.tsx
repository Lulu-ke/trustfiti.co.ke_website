import React from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import StarRating from '@/components/reviews/StarRating';
import { MapPin, BadgeCheck, ChevronRight, Tag } from 'lucide-react';
import type { Company } from '@/types';

interface CompanyCardProps {
  company: Company;
}

const colorGradients = [
  'from-green-500 to-emerald-600',
  'from-orange-500 to-amber-600',
  'from-yellow-500 to-orange-500',
  'from-amber-600 to-yellow-700',
  'from-red-500 to-rose-600',
  'from-brown-600 to-amber-800',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-violet-600',
  'from-teal-500 to-cyan-600',
  'from-pink-500 to-rose-600',
];

function getColorForName(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorGradients[hash % colorGradients.length];
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const gradient = getColorForName(company.name);

  return (
    <Link href={`/companies/${company.slug}`}>
      <article className="company-card bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer group">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            {/* Logo / Initial */}
            <div className="flex-shrink-0">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                />
              ) : (
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg`}>
                  {company.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-slate-900 truncate group-hover:text-brand-700 transition-colors">
                  {company.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {company.isVerified && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px] font-semibold">
                    <BadgeCheck className="w-2.5 h-2.5" />
                    Verified
                  </span>
                )}
                {!company.isClaimed && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-semibold">
                    Unclaimed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <StarRating value={company.averageRating} readonly size="sm" />
            <span className="text-sm font-bold text-slate-900">
              {company.averageRating.toFixed(1)}
            </span>
            {company.totalReviews > 0 && (
              <span className="text-xs text-slate-400">
                ({formatNumber(company.totalReviews)})
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {company.industry && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {company.industry}
              </span>
            )}
            {company.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {company.city}
              </span>
            )}
          </div>
        </div>

        {/* Footer bar */}
        <div className="border-t border-slate-50 px-6 py-3 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-medium text-brand-600">View Reviews</span>
          <ChevronRight className="w-4 h-4 text-brand-500" />
        </div>
      </article>
    </Link>
  );
}
