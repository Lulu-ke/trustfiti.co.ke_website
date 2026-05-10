import React from 'react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import StarRating from '@/components/reviews/StarRating';
import Badge from '@/components/ui/Badge';
import { MapPin, CheckCircle } from 'lucide-react';
import type { Company } from '@/types';

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link href={`/companies/${company.slug}`}>
      <article className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            {company.logo ? (
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="w-14 h-14 rounded-lg object-cover border border-gray-100"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-400">
                  {company.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                {company.name}
              </h3>
              {company.isVerified && (
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <StarRating value={company.averageRating} readonly size="sm" />
              <span className="text-sm font-medium text-gray-700">
                {company.averageRating.toFixed(1)}
              </span>
              {company.totalReviews > 0 && (
                <span className="text-sm text-gray-400">
                  ({formatNumber(company.totalReviews)} reviews)
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {company.industry && (
                <Badge variant="neutral">{company.industry}</Badge>
              )}
              {company.city && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  {company.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
