import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';
import CompanyCard from '@/components/companies/CompanyCard';
import ReviewCard from '@/components/reviews/ReviewCard';
import SearchBar from '@/components/search/SearchBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ArrowRight,
  Building2,
  Star,
  Shield,
  Users,
  TrendingUp,
  PenSquare,
  Eye,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import type { Company, Review } from '@/types';

// =============================================
// STATIC DATA
// =============================================

const categories = [
  { name: 'Telecom', emoji: '📱' },
  { name: 'Banking', emoji: '🏦' },
  { name: 'E-commerce', emoji: '🛒' },
  { name: 'Healthcare', emoji: '🏥' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Restaurants', emoji: '🍽️' },
  { name: 'Real Estate', emoji: '🏠' },
  { name: 'Education', emoji: '📚' },
  { name: 'Tech & SaaS', emoji: '💻' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Insurance', emoji: '🛡️' },
  { name: 'Government', emoji: '🏛️' },
];

// =============================================
// MAIN HOMEPAGE
// =============================================

export default function HomePage() {
  const { data: companiesResponse, isLoading: companiesLoading } = useSWR(
    '/api/companies?sortBy=reviews&limit=6',
    (url: string) => fetch(url).then(res => res.json())
  );

  const { data: reviewsResponse, isLoading: reviewsLoading } = useSWR(
    '/api/reviews?limit=4&sortBy=newest',
    (url: string) => fetch(url).then(res => res.json())
  );

  const { data: statsResponse } = useSWR(
    '/api/stats',
    (url: string) => fetch(url).then(res => res.json())
  );

  const companies: Company[] = companiesResponse?.data || [];
  const reviews: Review[] = reviewsResponse?.data || [];
  const stats = statsResponse?.data;

  const formatStat = (n: number | undefined): string => {
    if (!n) return '0';
    if (n >= 1000) return Math.floor(n / 1000) + 'K+';
    return n.toLocaleString();
  };

  return (
    <>
      <Head>
        <title>Trustfiti – Read & Write Reviews for Kenyan Businesses</title>
        <meta
          name="description"
          content="TrustFiti is Kenya's most trusted review platform. Read honest reviews about businesses, share your experiences, and help the community make informed decisions."
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* ============================================= */}
      {/* HERO — Full-width, clean, single column       */}
      {/* ============================================= */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#FAFAF7]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#E1F5EE] opacity-30 blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#FAEEDA] opacity-20 blur-[100px] translate-y-1/2 -translate-x-1/3" />

        <div className="relative max-w-[1120px] mx-auto px-5 sm:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="max-w-[680px] mx-auto text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-[var(--border)] px-4 py-1.5 rounded-full text-[13px] font-medium text-[var(--text-secondary)] mb-7 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              Built for Kenya
            </div>

            {/* Headline */}
            <h1 className="font-head text-[clamp(32px,5.5vw,52px)] font-extrabold text-[var(--text-primary)] leading-[1.08] tracking-[-1.5px] mb-5">
              Don&apos;t guess.{' '}
              <span className="text-[var(--accent)]">Read the review</span>{' '}
              first.
            </h1>

            {/* Subheadline */}
            <p className="text-[17px] text-[var(--text-secondary)] leading-relaxed mb-10 max-w-[480px] mx-auto">
              Thousands of honest reviews from real customers. Find the best businesses in Kenya — or warn others about the worst.
            </p>
          </div>

          {/* Search — hero variant, centered */}
          <div className="max-w-[560px] mx-auto mb-12">
            <SearchBar
              placeholder="Search a company — e.g. Safaricom, KCB, Jumia..."
              variant="hero"
            />
          </div>

          {/* Quick links */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/reviews/write"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--accent)] text-white text-[15px] font-medium hover:bg-[var(--accent-dark)] transition-all shadow-md shadow-[var(--accent)]/20 hover:shadow-lg hover:shadow-[var(--accent)]/25 hover:-translate-y-0.5"
            >
              <PenSquare className="w-4 h-4" />
              Write a Review
            </Link>
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-white border border-[var(--border-md)] text-[var(--text-primary)] text-[15px] font-medium hover:bg-[var(--gray-50)] transition-all"
            >
              Browse Companies
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 max-w-[400px] mx-auto">
            {[
              { label: 'Companies', value: formatStat(stats?.companies), suffix: '+' },
              { label: 'Reviews', value: formatStat(stats?.reviews), suffix: '+' },
              { label: 'Avg Rating', value: stats?.avgRating ? stats.avgRating.toFixed(1) : '4.5', suffix: '' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-head text-[28px] font-extrabold text-[var(--text-primary)] leading-none">
                  {s.value}{s.suffix}
                </div>
                <div className="text-[13px] text-[var(--text-muted)] mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SOCIAL PROOF — Recent reviews marquee          */}
      {/* ============================================= */}
      {!reviewsLoading && reviews.length > 0 && (
        <section className="border-y border-[var(--border)] bg-white overflow-hidden">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-10 lg:py-14">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-head text-[22px] font-bold text-[var(--text-primary)]">
                  Latest Reviews
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  What people are saying right now
                </p>
              </div>
              <Link
                href="/companies"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
              >
                See all reviews
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {reviews.slice(0, 4).map((review) => (
                <ReviewCard key={review.id} review={review} showCompany homepage />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================= */}
      {/* CATEGORIES — Clean grid                        */}
      {/* ============================================= */}
      <section className="py-14 lg:py-20">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-head text-[22px] font-bold text-[var(--text-primary)]">
                Browse Categories
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Find businesses by industry
              </p>
            </div>
            <Link
              href="/companies"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
            >
              All categories
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/companies?industry=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center gap-2 p-4 rounded-[var(--radius-md)] bg-white border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-sm transition-all group text-center"
              >
                <span className="text-[24px] group-hover:scale-110 transition-transform">{cat.emoji}</span>
                <span className="text-[13px] font-medium text-[var(--text-primary)] leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* TRENDING COMPANIES                             */}
      {/* ============================================= */}
      <section className="py-14 lg:py-20 bg-white border-y border-[var(--border)]">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-head text-[22px] font-bold text-[var(--text-primary)]">
                Most Reviewed
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                The businesses getting the most attention
              </p>
            </div>
            <Link
              href="/companies"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
            >
              Browse all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {companiesLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : companies.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-md)]">
              <Building2 className="h-10 w-10 text-[var(--gray-100)] mx-auto mb-3" />
              <p className="text-[var(--text-secondary)] text-sm">No companies listed yet.</p>
              <Link href="/reviews/write" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] mt-2">
                Add the first one <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============================================= */}
      {/* HOW IT WORKS — Horizontal steps                */}
      {/* ============================================= */}
      <section className="py-14 lg:py-20">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="font-head text-[22px] font-bold text-[var(--text-primary)]">
              How It Works
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-[400px] mx-auto">
              Three steps to share your experience or find the right business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                num: '1',
                Icon: Eye,
                color: '#1D9E75',
                bg: '#E1F5EE',
                title: 'Search',
                desc: 'Find any Kenyan business by name, category, or location. If they\'re not listed, add them in seconds.',
              },
              {
                num: '2',
                Icon: Star,
                color: '#BA7517',
                bg: '#FAEEDA',
                title: 'Review',
                desc: 'Rate your experience honestly. Share the details that matter — good or bad — so others can decide.',
              },
              {
                num: '3',
                Icon: Shield,
                color: '#0F6E56',
                bg: '#EAF3DE',
                title: 'Trust',
                desc: 'Every review is protected by our fraud detection. Verified reviewers earn badges that carry more weight.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="relative bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-7 hover:shadow-md transition-shadow"
              >
                {/* Step number */}
                <span className="font-head text-[64px] font-extrabold text-[var(--gray-50)] absolute -top-2 right-4 leading-none select-none">
                  {step.num}
                </span>

                <div
                  className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center mb-5"
                  style={{ background: step.bg }}
                >
                  <step.Icon className="w-5 h-5" style={{ color: step.color }} />
                </div>

                <h3 className="font-head text-[17px] font-bold text-[var(--text-primary)] mb-2">
                  {step.title}
                </h3>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* FOR BUSINESSES — Clean split layout             */}
      {/* ============================================= */}
      <section className="py-14 lg:py-20 bg-[#0A2E20] text-white relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#1D9E75] opacity-10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#9FE1CB] opacity-10 blur-[80px]" />

        <div className="relative max-w-[1120px] mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-full text-[12px] font-medium text-white/80 tracking-wide uppercase mb-6">
                For Business Owners
              </div>

              <h2 className="font-head text-[clamp(26px,3.5vw,38px)] font-extrabold text-white leading-[1.12] tracking-[-1px] mb-4">
                Take control of your online reputation
              </h2>
              <p className="text-[16px] text-white/65 leading-relaxed mb-9 max-w-[440px]">
                Claim your business profile, respond to customer reviews, and track your trust score over time — all from one dashboard.
              </p>

              <div className="flex flex-col gap-5 mb-9">
                {[
                  { icon: Shield, title: 'Claim & Verify', desc: 'Prove you own the business. Get a verified badge that builds trust.' },
                  { icon: MessageSquare, title: 'Reply to Reviews', desc: 'Address feedback publicly. Show customers you care about their experience.' },
                  { icon: TrendingUp, title: 'Analytics Dashboard', desc: 'Track your rating trends, review volume, and customer sentiment.' },
                ].map((feat) => (
                  <div key={feat.title} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <feat.icon className="w-4 h-4 text-[#9FE1CB]" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-white mb-0.5">{feat.title}</h4>
                      <p className="text-[14px] text-white/55 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Link
                  href="/claim"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-white text-[#0A2E20] text-[15px] font-semibold hover:bg-[#E1F5EE] transition-all"
                >
                  Claim Your Business
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right — Stats card stack */}
            <div className="flex flex-col gap-4">
              {/* Main stat card */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-[var(--radius-lg)] p-7">
                <div className="text-[13px] text-white/55 mb-2">Average platform rating</div>
                <div className="flex items-end gap-3 mb-3">
                  <span className="font-head text-[48px] font-extrabold text-white leading-none">
                    {stats?.avgRating ? stats.avgRating.toFixed(1) : '4.5'}
                  </span>
                  <span className="text-[14px] text-white/45 mb-1.5">out of 5</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i <= Math.round(stats?.avgRating || 4.5)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Two smaller cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-[var(--radius-lg)] p-6 text-center">
                  <Users className="w-5 h-5 text-[#9FE1CB] mx-auto mb-2" />
                  <div className="font-head text-[28px] font-extrabold text-white leading-none">
                    {formatStat(stats?.companies)}
                  </div>
                  <div className="text-[13px] text-white/50 mt-1">Listed Businesses</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-[var(--radius-lg)] p-6 text-center">
                  <MessageSquare className="w-5 h-5 text-[#9FE1CB] mx-auto mb-2" />
                  <div className="font-head text-[28px] font-extrabold text-white leading-none">
                    {formatStat(stats?.reviews)}
                  </div>
                  <div className="text-[13px] text-white/50 mt-1">Honest Reviews</div>
                </div>
              </div>

              {/* CTA card */}
              <div className="bg-[#1D9E75] rounded-[var(--radius-lg)] p-5 flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold text-white">Ready to get started?</div>
                  <div className="text-[13px] text-white/70">It&apos;s free to claim your listing.</div>
                </div>
                <Link
                  href="/claim"
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-[#0A2E20] text-[13px] font-semibold hover:bg-[#E1F5EE] transition-all"
                >
                  Claim now
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* BOTTOM CTA                                     */}
      {/* ============================================= */}
      <section className="py-14 lg:py-20">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
          <div className="text-center max-w-[560px] mx-auto">
            <h2 className="font-head text-[clamp(24px,3.5vw,36px)] font-extrabold text-[var(--text-primary)] leading-tight tracking-[-1px] mb-4">
              Your review could help someone make the right choice today
            </h2>
            <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed mb-8">
              Whether it was a 5-star experience or a 1-star disaster, your honest feedback protects the next customer.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/reviews/write"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--accent)] text-white text-[15px] font-semibold hover:bg-[var(--accent-dark)] transition-all shadow-md shadow-[var(--accent)]/20"
              >
                <PenSquare className="w-4 h-4" />
                Write a Review Now
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-white border border-[var(--border-md)] text-[var(--text-primary)] text-[15px] font-medium hover:bg-[var(--gray-50)] transition-all"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* FOOTER MINI                                   */}
      {/* ============================================= */}
      <footer className="border-t border-[var(--border)] py-10">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <span className="font-head font-bold text-[15px] text-[var(--text-primary)]">
                Trust<span className="text-[var(--accent)]">fiti</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-[13px] text-[var(--text-muted)]">
              <Link href="/companies" className="hover:text-[var(--text-primary)] transition-colors">Browse</Link>
              <Link href="/reviews/write" className="hover:text-[var(--text-primary)] transition-colors">Write Review</Link>
              <Link href="/claim" className="hover:text-[var(--text-primary)] transition-colors">For Business</Link>
              <Link href="/login" className="hover:text-[var(--text-primary)] transition-colors">Sign In</Link>
            </div>

            <div className="text-[13px] text-[var(--text-muted)]">
              &copy; {new Date().getFullYear()} TrustFiti. Made in Kenya.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
