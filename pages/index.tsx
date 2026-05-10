import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import CompanyCard from '@/components/companies/CompanyCard';
import ReviewCard from '@/components/reviews/ReviewCard';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  Search,
  Star,
  Building2,
  Shield,
  Users,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import type { Company, Review } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const howItWorks = [
  {
    step: 1,
    icon: Search,
    title: 'Find a Company',
    description:
      'Search for the business you want to review in our extensive directory of Kenyan companies.',
  },
  {
    step: 2,
    icon: Star,
    title: 'Write a Review',
    description:
      'Share your honest experience by rating and writing about the products or services you received.',
  },
  {
    step: 3,
    icon: Shield,
    title: 'Help Others Decide',
    description:
      'Your review helps other consumers make informed decisions and encourages businesses to improve.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: topCompanies, isLoading: companiesLoading } = useSWR<{
    companies: Company[];
  }>(`/api/companies?sort=rating&limit=6`, fetcher);

  const { data: recentReviews, isLoading: reviewsLoading } = useSWR<{
    reviews: Review[];
  }>(`/api/reviews?limit=3&sort=recent`, fetcher);

  const { data: statsData } = useSWR<{
    success: boolean;
    data: { companies: number; reviews: number; avgRating: number };
  }>('/api/stats', fetcher);

  const formatNumber = (n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
  };

  const stats = statsData?.data;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/companies?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <Head>
        <title>TrustFiti — Find & Share Trusted Reviews in Kenya</title>
        <meta
          name="description"
          content="TrustFiti is Kenya's trusted review platform. Read and write reviews for businesses, share your experiences, and help others make informed decisions."
        />
      </Head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
              Find & Share{' '}
              <span className="text-emerald-200">Trusted Reviews</span>
            </h1>
            <p className="text-base sm:text-lg text-emerald-100 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Read genuine reviews from real customers. Make informed decisions
              about businesses in Kenya and share your own experiences.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 max-w-xl mx-auto bg-white rounded-xl p-1.5 shadow-lg"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for companies..."
                  className="w-full pl-10 pr-4 py-3 text-sm text-gray-900 rounded-lg focus:outline-none"
                />
              </div>
              <Button type="submit" className="shrink-0">
                Search
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-emerald-200">
              <span>Popular:</span>
              {['Safaricom', 'NCBA Bank', 'Jumia', 'Java House'].map(
                (company) => (
                  <button
                    key={company}
                    onClick={() =>
                      router.push(
                        `/companies?q=${encodeURIComponent(company)}`
                      )
                    }
                    className="hover:text-white underline underline-offset-2 transition-colors"
                  >
                    {company}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Making informed decisions is easy with TrustFiti
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-xl p-6 sm:p-8 text-center border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Companies */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                Top Rated Companies
              </h2>
              <p className="text-gray-600">
                Highest rated businesses on TrustFiti
              </p>
            </div>
            <Link
              href="/companies"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {companiesLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : topCompanies?.companies?.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCompanies.companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No companies listed yet.</p>
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/companies"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600"
            >
              View all companies <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Reviews */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                Recent Reviews
              </h2>
              <p className="text-gray-600">
                Latest reviews from our community
              </p>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : recentReviews?.reviews?.length ? (
            <div className="grid md:grid-cols-3 gap-4">
              {recentReviews.reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  showCompany
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No reviews yet. Be the first to share your experience!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                {stats ? formatNumber(stats.reviews) : '—'}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Reviews
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                {stats ? formatNumber(stats.companies) : '—'}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Building2 className="h-4 w-4" />
                Companies
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                {stats ? stats.avgRating.toFixed(1) : '—'}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Star className="h-4 w-4" />
                Avg Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-emerald-200" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Join TrustFiti Today
          </h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
            Share your experiences, help others make informed decisions, and
            become part of Kenya&apos;s trusted review community.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-gray-100 focus-visible:ring-white"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
