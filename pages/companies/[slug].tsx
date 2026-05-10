import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Link from 'next/link';
import StarRating from '@/components/reviews/StarRating';
import ReviewList from '@/components/reviews/ReviewList';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  MapPin,
  Globe,
  CheckCircle,
  Star,
  PenSquare,
  Building2,
  ExternalLink,
} from 'lucide-react';
import type { Company } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CompanyWithStats extends Company {
  ratingDistribution?: { rating: number; count: number }[];
}

export default function CompanyProfilePage() {
  const router = useRouter();
  const { slug } = router.query;
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const { data, error, isLoading } = useSWR<CompanyWithStats>(
    slug ? `/api/companies/${slug}` : null,
    fetcher
  );



  if (router.isReady && !slug) return null;

  if (isLoading) {
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
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Company not found
          </h1>
          <p className="text-gray-500 mb-4">
            The company you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/companies" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
            Browse all companies
          </Link>
        </div>
      </div>
    );
  }

  const company = data;
  const ratingDist = company.ratingDistribution ?? [];

  const maxDistCount = Math.max(...ratingDist.map((d) => d.count), 1);

  return (
    <>
      <Head>
        <title>{company.name} Reviews — TrustFiti</title>
        <meta name="description" content={`Read reviews for ${company.name}. ${company.totalReviews} reviews with ${company.averageRating.toFixed(1)} average rating on TrustFiti.`} />
        <link rel="canonical" href={`https://trustfiti.co.ke/companies/${company.slug}`} />

        {/* Open Graph */}
        <meta property="og:title" content={`${company.name} Reviews — TrustFiti`} />
        <meta property="og:description" content={`${company.totalReviews} reviews with ${company.averageRating.toFixed(1)} average rating`} />
        <meta property="og:url" content={`https://trustfiti.co.ke/companies/${company.slug}`} />
        <meta property="og:type" content="business.business" />
        {company.logo && <meta property="og:image" content={company.logo} />}

        {/* Twitter Card */}
        <meta name="twitter:title" content={`${company.name} Reviews — TrustFiti`} />
        <meta name="twitter:description" content={`${company.totalReviews} reviews with ${company.averageRating.toFixed(1)} average rating`} />

        {/* Structured Data: LocalBusiness with AggregateRating */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": company.industry === "Restaurant" || company.industry === "Cafe"
                ? "Restaurant"
                : "LocalBusiness",
              name: company.name,
              url: `https://trustfiti.co.ke/companies/${company.slug}`,
              description: company.description || `Read reviews for ${company.name} on TrustFiti`,
              image: company.logo || "https://trustfiti.co.ke/logo.png",
              address: company.address
                ? {
                    "@type": "PostalAddress",
                    streetAddress: company.address,
                    addressLocality: company.city || "",
                    addressCountry: company.country,
                  }
                : undefined,
              ...(company.website && { sameAs: [company.website] }),
              aggregateRating: company.totalReviews > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: company.averageRating.toFixed(1),
                    bestRating: "5",
                    worstRating: "1",
                    reviewCount: company.totalReviews,
                  }
                : undefined,
            }),
          }}
        />
      </Head>

      <div>
        {/* Cover */}
        <div className="h-40 sm:h-52 bg-gradient-to-r from-emerald-600 to-teal-600 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Company Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Logo */}
              <div className="-mt-20 sm:-mt-20">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-gray-100 flex items-center justify-center border-4 border-white shadow-md">
                    <span className="text-4xl font-bold text-gray-400">
                      {company.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 pt-0 sm:pt-10">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {company.name}
                  </h1>
                  {company.isVerified && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Verified
                    </Badge>
                  )}
                </div>

                {company.description && (
                  <p className="text-gray-600 text-sm mb-3 max-w-2xl">
                    {company.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {company.industry && (
                    <Badge variant="neutral">{company.industry}</Badge>
                  )}
                  {company.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {company.city}, {company.country}
                    </span>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="sm:pt-10 self-start">
                <Link href={`/reviews/write?companyId=${company.id}&companyName=${encodeURIComponent(company.name)}`}>
                  <Button size="lg">
                    <PenSquare className="h-4 w-4" />
                    Write a Review
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-6 sm:gap-10">
              {/* Average Rating */}
              <div className="text-center sm:text-left">
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {company.averageRating.toFixed(1)}
                </div>
                <StarRating value={company.averageRating} readonly size="md" />
                <p className="text-sm text-gray-500 mt-1">
                  Based on {company.totalReviews.toLocaleString()} reviews
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1 max-w-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Rating Distribution
                </h3>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const dist = ratingDist.find((d) => d.rating === star);
                    const count = dist?.count ?? 0;
                    const width = (count / maxDistCount) * 100;

                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-3 text-right">
                          {star}
                        </span>
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Reviews
              <span className="text-gray-400 font-normal ml-2">
                ({company.totalReviews})
              </span>
            </h2>

            <div className="flex items-center gap-3">
              {/* Rating Filter */}
              <div className="flex items-center gap-1">
                {([5, 4, 3, 2, 1] as const).map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setRatingFilter(ratingFilter === star ? null : star)
                    }
                    className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                      ratingFilter === star
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {star}<Star className="h-3 w-3 inline fill-current" />
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:border-emerald-500 focus:outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>

          <ReviewList
            companyId={company.id}
            sortBy={sortBy}
            ratingFilter={ratingFilter}
          />
        </div>
      </div>
    </>
  );
}
