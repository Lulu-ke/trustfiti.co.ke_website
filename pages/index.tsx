import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import CompanyCard from '@/components/companies/CompanyCard';
import ReviewCard from '@/components/reviews/ReviewCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  Search,
  ArrowRight,
  Building2,
  Star,
} from 'lucide-react';
import type { Company, Review } from '@/types';

// =============================================
// STATIC DATA
// =============================================

const categories = [
  { name: 'Telecom', emoji: '📡', count: '2.1k' },
  { name: 'Banking', emoji: '🏦', count: '840' },
  { name: 'E-commerce', emoji: '🛒', count: '1.4k' },
  { name: 'Healthcare', emoji: '🏥', count: '960' },
  { name: 'Transport', emoji: '🚗', count: '650' },
  { name: 'Restaurants', emoji: '🍽️', count: '3.2k' },
  { name: 'Real Estate', emoji: '🏗️', count: '720' },
  { name: 'Utilities', emoji: '⚡', count: '240' },
  { name: 'Education', emoji: '📚', count: '1.1k' },
  { name: 'Tech & SaaS', emoji: '💻', count: '480' },
  { name: 'Fashion', emoji: '👗', count: '890' },
  { name: 'Services', emoji: '🔧', count: '2.8k' },
];

const steps = [
  {
    num: '01',
    icon: '🔍',
    iconBg: '#E1F5EE',
    title: 'Find the company',
    description: 'Search by name, domain, or phone number. If it\'s not listed, you can add it in seconds — we prevent duplicates automatically.',
  },
  {
    num: '02',
    icon: '⭐',
    iconBg: '#FAEEDA',
    title: 'Share your experience',
    description: 'Rate from 1–5 stars, give it a title and tell your story. Draft saves automatically so you never lose your words mid-flow.',
  },
  {
    num: '03',
    icon: '🛡️',
    iconBg: '#EAF3DE',
    title: 'We protect your review',
    description: 'Our fraud detection runs in the background. Verified reviews carry more weight. Your reputation grows with every helpful contribution.',
  },
];

const bizFeatures = [
  { icon: '✅', bg: '#E1F5EE', title: 'Claim & verify your listing', description: 'Verify via email domain, phone OTP, or document upload. Get a verified badge and take control of your profile.' },
  { icon: '💬', bg: '#FAEEDA', title: 'Respond publicly to reviews', description: 'Every response is visible to all visitors. Show potential customers that you listen and act on feedback.' },
  { icon: '📊', bg: '#EAF3DE', title: 'Track rating trends', description: 'See how your trust score evolves week over week. Identify which products or branches are praised — or problematic.' },
];

const trustBarItems = [
  { icon: '🛡️', text: 'Fraud-protected reviews' },
  { icon: '✅', text: 'Verified business owners' },
  { icon: '🏅', text: 'Trusted reviewer badges' },
  { icon: '🇰🇪', text: 'Kenya-first platform' },
];

// =============================================
// MAIN HOMEPAGE
// =============================================

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: companiesResponse, isLoading: companiesLoading } = useSWR(
    '/api/companies?sortBy=reviews&limit=6',
    (url: string) => fetch(url).then(res => res.json())
  );

  const { data: reviewsResponse, isLoading: reviewsLoading } = useSWR(
    '/api/reviews?limit=3&sortBy=recent',
    (url: string) => fetch(url).then(res => res.json())
  );

  const { data: statsResponse } = useSWR(
    '/api/stats',
    (url: string) => fetch(url).then(res => res.json())
  );

  const companies: Company[] = companiesResponse?.data || [];
  const reviews: Review[] = reviewsResponse?.data || [];
  const stats = statsResponse?.data;

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/companies?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, router]);

  const formatStat = (n: number | undefined): string => {
    if (!n) return '0';
    if (n >= 1000) return Math.floor(n / 1000) + 'K+';
    return n.toLocaleString();
  };

  return (
    <>
      <Head>
        <title>Trustfiti – Kenya&apos;s Trusted Review Platform</title>
        <meta
          name="description"
          content="TrustFiti is Kenya's trusted review platform. Read and write reviews for businesses, share your experiences, and help others make informed decisions."
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* ============================================= */}
      {/* HERO                                          */}
      {/* ============================================= */}
      <section className="hero-bg min-h-[92vh] grid items-center relative overflow-hidden px-4 sm:px-8 py-20 lg:py-[100px]">
        <div className="hero-dots" />
        <div className="hero-glow" />

        <div className="max-w-[1160px] mx-auto relative z-[2] grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Left: Hero Content */}
          <div className="hero-stagger">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-white/12 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-medium text-white/90 tracking-wide uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9FE1CB]" />
              Kenya&apos;s #1 Review Platform
            </div>

            {/* Heading */}
            <h1 className="font-head text-[clamp(40px,5vw,62px)] font-extrabold text-white leading-[1.08] tracking-[-2px] mb-5">
              Find businesses you can <em className="not-italic text-[#9FE1CB]">actually</em> trust
            </h1>

            {/* Sub */}
            <p className="text-lg font-light text-white/78 leading-relaxed mb-9 max-w-[440px]">
              Real reviews from real Kenyans. Search companies, share experiences, and help your community make smarter decisions.
            </p>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap mb-12">
              <Link
                href="/companies"
                className="btn btn-white btn-lg"
              >
                <Search className="w-5 h-5" /> Search companies
              </Link>
              <Link
                href="/reviews/write"
                className="btn btn-outline-white btn-lg"
              >
                Write a review
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div>
                <div className="font-head text-[28px] font-extrabold text-white">
                  {formatStat(stats?.companies)}+
                </div>
                <div className="text-[13px] text-white/60">Companies listed</div>
              </div>
              <div>
                <div className="font-head text-[28px] font-extrabold text-white">
                  {formatStat(stats?.reviews)}+
                </div>
                <div className="text-[13px] text-white/60">Verified reviews</div>
              </div>
              <div>
                <div className="font-head text-[28px] font-extrabold text-white">
                  {stats?.avgRating ? stats.avgRating.toFixed(1) : '4.5'}
                </div>
                <div className="text-[13px] text-white/60 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Avg rating
                </div>
              </div>
            </div>
          </div>

          {/* Right: Search Card */}
          <div className="search-card">
            <h3 className="font-head text-xl font-bold text-[var(--text-primary)] mb-1.5">Find a company</h3>
            <p className="text-[13px] text-[var(--text-muted)] mb-5">Search by name, domain, or phone number</p>

            <form onSubmit={handleSearch}>
              <div className="search-input-wrap relative mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Safaricom, Jumia, KCB Bank..."
                  className="w-full"
                />
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--text-muted)] pointer-events-none" />
              </div>
            </form>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <Link href="/reviews/write" className="search-action-btn">
                <span className="text-[22px] mb-0.5">✍️</span>
                <span className="text-[13px] font-medium text-[var(--text-primary)]">Write a review</span>
                <span className="text-[11px] text-[var(--text-muted)]">Rate a company</span>
              </Link>
              <Link href="/claim" className="search-action-btn">
                <span className="text-[22px] mb-0.5">🏢</span>
                <span className="text-[13px] font-medium text-[var(--text-primary)]">Claim your business</span>
                <span className="text-[11px] text-[var(--text-muted)]">Take ownership</span>
              </Link>
            </div>

            <div className="flex items-center gap-2.5 my-4 text-[var(--text-muted)] text-xs before:content-[''] after:content-[''] before:flex-1 before:h-px before:bg-[var(--border)] after:flex-1 after:h-px after:bg-[var(--border)]">
              recently reviewed
            </div>

            <div className="flex flex-col gap-2">
              {companies.slice(0, 3).map((c) => (
                <Link
                  key={c.id}
                  href={`/companies/${c.slug}`}
                  className="flex items-center gap-2.5 p-2.5 border border-[var(--border)] rounded-[var(--radius-sm)] hover:border-[var(--border-md)] hover:bg-[var(--gray-50)] transition-all bg-white"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0 bg-[var(--teal-50)] text-[var(--teal-600)]">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[var(--text-primary)] truncate">{c.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{c.industry || 'General'}</div>
                  </div>
                  <div className="text-xs text-[#EF9F27] shrink-0">★ {c.averageRating.toFixed(1)}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* TRUST BAR                                     */}
      {/* ============================================= */}
      <div className="trust-bar py-5 px-4 sm:px-8">
        <div className="max-w-[1160px] mx-auto flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
          {trustBarItems.map((item) => (
            <div key={item.text} className="flex items-center gap-2.5 text-white text-sm">
              <span className="text-lg opacity-90">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================= */}
      {/* CATEGORIES                                    */}
      {/* ============================================= */}
      <section className="py-[88px] px-4 sm:px-8">
        <div className="max-w-[1160px] mx-auto">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">Browse by category</div>
            <h2 className="font-head text-[clamp(28px,4vw,42px)] font-extrabold text-[var(--text-primary)] tracking-[-1px] leading-tight mb-3.5">
              What are you looking for?
            </h2>
            <p className="text-[17px] text-[var(--text-secondary)] max-w-[520px] mx-auto leading-relaxed">
              From telecoms to hospitality — find and rate businesses across every sector in Kenya.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/companies?industry=${encodeURIComponent(cat.name)}`}
                className="cat-card"
              >
                <div className="text-[28px]">{cat.emoji}</div>
                <div className="text-[13px] font-medium text-[var(--text-primary)]">{cat.name}</div>
                <div className="text-[11px] text-[var(--text-muted)]">{cat.count} companies</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* FEATURED COMPANIES                            */}
      {/* ============================================= */}
      <section className="py-[88px] px-4 sm:px-8 bg-[var(--gray-50)] border-t border-[var(--border)]">
        <div className="max-w-[1160px] mx-auto">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">Trending now</div>
            <h2 className="font-head text-[clamp(28px,4vw,42px)] font-extrabold text-[var(--text-primary)] tracking-[-1px] leading-tight mb-3.5">
              Companies being talked about
            </h2>
            <p className="text-[17px] text-[var(--text-secondary)] max-w-[520px] mx-auto leading-relaxed">
              Most reviewed and rated businesses across Kenya this week.
            </p>
          </div>

          {companiesLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : companies.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-[var(--radius-lg)] border border-[var(--border)]">
              <Building2 className="h-10 w-10 text-[var(--gray-100)] mx-auto mb-3" />
              <p className="text-[var(--text-secondary)]">No companies listed yet. Be the first to add one!</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/companies" className="btn btn-ghost btn-lg">
              View all companies <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* RECENT REVIEWS                                */}
      {/* ============================================= */}
      <section className="py-[88px] px-4 sm:px-8 bg-[var(--gray-50)] border-t border-b border-[var(--border)]">
        <div className="max-w-[1160px] mx-auto">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">Community voices</div>
            <h2 className="font-head text-[clamp(28px,4vw,42px)] font-extrabold text-[var(--text-primary)] tracking-[-1px] leading-tight mb-3.5">
              What Kenyans are saying
            </h2>
            <p className="text-[17px] text-[var(--text-secondary)] max-w-[520px] mx-auto leading-relaxed">
              Fresh, unfiltered reviews from verified members of our community.
            </p>
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-5">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} showCompany homepage />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-[var(--radius-lg)] border border-[var(--border)]">
              <p className="text-[var(--text-secondary)]">No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================= */}
      {/* HOW IT WORKS                                  */}
      {/* ============================================= */}
      <section className="py-[88px] px-4 sm:px-8">
        <div className="max-w-[1160px] mx-auto">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">How it works</div>
            <h2 className="font-head text-[clamp(28px,4vw,42px)] font-extrabold text-[var(--text-primary)] tracking-[-1px] leading-tight mb-3.5">
              Simple. Transparent. Trusted.
            </h2>
            <p className="text-[17px] text-[var(--text-secondary)] max-w-[520px] mx-auto leading-relaxed">
              Three steps between your experience and a review that helps thousands of others.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-7">
            {steps.map((step) => (
              <div key={step.num} className="step-card">
                <span className="font-head text-[72px] font-extrabold text-[var(--gray-50)] absolute top-4 right-5 leading-none select-none">
                  {step.num}
                </span>
                <div className="w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl mb-5" style={{ background: step.iconBg }}>
                  {step.icon}
                </div>
                <h4 className="font-head text-lg font-bold text-[var(--text-primary)] mb-2.5">{step.title}</h4>
                <p className="text-sm text-[var(--text-secondary)] leading-[1.7]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* FOR BUSINESSES                                */}
      {/* ============================================= */}
      <section className="py-[88px] px-4 sm:px-8 bg-[var(--gray-50)] border-t border-[var(--border)]">
        <div className="max-w-[1160px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Features */}
            <div>
              <div className="section-tag mb-4">For business owners</div>
              <h2 className="font-head text-[clamp(28px,4vw,42px)] font-extrabold text-[var(--text-primary)] tracking-[-1px] leading-tight mb-3">
                Own your reputation on Trustfiti
              </h2>
              <p className="text-[17px] text-[var(--text-secondary)] mb-9 leading-relaxed">
                Claim your company listing, respond to reviews, and get insights into what customers think — all in one dashboard.
              </p>

              <div className="flex flex-col gap-6">
                {bizFeatures.map((feat) => (
                  <div key={feat.title} className="flex gap-4">
                    <div className="w-11 h-11 rounded-[12px] flex items-center justify-center text-xl shrink-0" style={{ background: feat.bg }}>
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className="font-head text-base font-bold text-[var(--text-primary)] mb-1">{feat.title}</h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feat.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-9">
                <Link href="/claim" className="btn btn-primary btn-lg">
                  Claim your business
                </Link>
                <Link href="/how-it-works" className="btn btn-ghost btn-lg">
                  Learn more
                </Link>
              </div>
            </div>

            {/* Right: Dashboard Visual */}
            <div className="biz-visual">
              {/* Trust Score Card */}
              <div className="bg-white rounded-[var(--radius-md)] p-5 border border-[var(--border)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">Trust score this month</div>
                <div className="flex items-baseline gap-3 mb-1.5">
                  <div className="font-head text-[32px] font-extrabold text-[var(--text-primary)]">
                    {stats?.avgRating ? stats.avgRating.toFixed(1) : '4.3'}
                  </div>
                  <div className="text-xs text-[var(--brand-400)] font-medium">Based on {formatStat(stats?.reviews)} reviews</div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4].map(i => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 opacity-50" />
                </div>
              </div>

              {/* Recent mini reviews */}
              <div>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.8px] mb-2.5">
                  Recent reviews
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { dot: '#639922', text: 'Excellent service at the Westgate branch', stars: '⭐⭐⭐⭐⭐', date: '2h ago' },
                    { dot: '#EF9F27', text: 'Good but the app needs fixing', stars: '⭐⭐⭐', date: '5h ago' },
                    { dot: '#639922', text: 'Fast response to my complaint — impressed', stars: '⭐⭐⭐⭐', date: '1d ago' },
                    { dot: '#E24B4A', text: 'Waiting 3 weeks for a refund, not OK', stars: '⭐⭐', date: '2d ago' },
                  ].map((r, i) => (
                    <div key={i} className="biz-mini-review">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: r.dot }} />
                      <div className="text-xs text-[var(--text-secondary)] flex-1 truncate">{r.text}</div>
                      <div className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">{r.date}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unresponded */}
              <div className="bg-white border border-[var(--border)] rounded-[var(--radius-md)] p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[var(--text-muted)]">Unresponded reviews</div>
                  <div className="font-head text-xl font-extrabold text-[var(--coral-400)]">
                    {reviews.length > 0 ? Math.max(1, reviews.length) : '0'}
                  </div>
                </div>
                <Link href="/login" className="btn btn-primary text-[13px] px-4 py-2">
                  Respond now <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* CTA SECTION                                   */}
      {/* ============================================= */}
      <section className="py-[88px] px-4 sm:px-8">
        <div className="max-w-[1160px] mx-auto">
          <div className="bg-[var(--text-primary)] rounded-[var(--radius-xl)] p-12 sm:p-16 lg:p-[72px] grid lg:grid-cols-[1fr_auto] gap-12 items-center">
            <div>
              <h2 className="font-head text-[clamp(26px,3.5vw,40px)] font-extrabold text-white tracking-[-1px] mb-3">
                Your experience matters to thousands of Kenyans
              </h2>
              <p className="text-base text-white/60">
                Join a growing community making smarter buying decisions together.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 items-start">
              <Link href="/login" className="btn btn-white btn-lg">
                Create free account
              </Link>
              <Link href="/reviews/write" className="btn btn-outline-white btn-lg">
                Write anonymously <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
