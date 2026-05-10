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
  Star,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  PenLine,
  Clock,
  BadgeCheck,
  ShieldAlert,
  MessageCircle,
  Rocket,
  ChevronDown,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import type { Company, Review } from '@/types';

// =============================================
// STATIC DATA
// =============================================

const howItWorks = [
  {
    step: 1,
    icon: Search,
    title: 'Search a Company',
    description: 'Find any business by name, phone, website, or social handle. We aggregate all identifiers so you always find what you need.',
    color: 'bg-brand-50 group-hover:bg-brand-100',
    iconColor: 'text-brand-600',
    badgeColor: 'text-brand-500',
  },
  {
    step: 2,
    icon: Star,
    title: 'Read & Write Reviews',
    description: 'Share your honest experience with a 1-5 star rating. Reviews are verified, fraud-checked, and help others make better decisions.',
    color: 'bg-gold-400/10 group-hover:bg-gold-400/20',
    iconColor: 'text-gold-500',
    badgeColor: 'text-gold-600',
  },
  {
    step: 3,
    icon: Building2,
    title: 'Claim Your Business',
    description: 'Own a listed company? Verify and claim it to respond to reviews, update details, and build customer trust.',
    color: 'bg-blue-50 group-hover:bg-blue-100',
    iconColor: 'text-blue-600',
    badgeColor: 'text-blue-600',
  },
];

const categories = [
  { name: 'Telecom', icon: 'signal', count: 234 },
  { name: 'Banking & Finance', icon: 'landmark', count: 189 },
  { name: 'E-Commerce', icon: 'shopping-cart', count: 156 },
  { name: 'Restaurants', icon: 'utensils', count: 342 },
  { name: 'Healthcare', icon: 'heart-pulse', count: 98 },
  { name: 'Real Estate', icon: 'home', count: 124 },
  { name: 'Education', icon: 'graduation-cap', count: 87 },
  { name: 'Transport', icon: 'car', count: 145 },
  { name: 'Technology', icon: 'monitor', count: 112 },
  { name: 'Hospitality', icon: 'bed-double', count: 76 },
  { name: 'Insurance', icon: 'shield', count: 65 },
  { name: 'Fashion & Beauty', icon: 'sparkles', count: 203 },
  { name: 'Supermarkets', icon: 'store', count: 89 },
  { name: 'Automotive', icon: 'wrench', count: 54 },
  { name: 'Government', icon: 'building', count: 42 },
  { name: 'Professional Services', icon: 'briefcase', count: 167 },
];

const popularSearches = ['Safaricom', 'Jumia', 'Equity Bank', 'Artcaffe'];

const ratingBreakdown = [
  { stars: 5, percent: 65 },
  { stars: 4, percent: 22 },
  { stars: 3, percent: 8 },
  { stars: 2, percent: 3 },
  { stars: 1, percent: 2 },
];

// =============================================
// COUNTER ANIMATION HOOK
// =============================================

function useCountUp(target: number | undefined, isDecimal = false) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!target || animated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 2000;
          const startTime = performance.now();
          const safeTarget = target;

          function update(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = safeTarget * ease;

            if (isDecimal) {
              setDisplay(current.toFixed(1));
            } else {
              setDisplay(Math.floor(current).toLocaleString());
            }

            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              setDisplay(isDecimal ? safeTarget.toFixed(1) : safeTarget.toLocaleString());
            }
          }

          requestAnimationFrame(update);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, isDecimal]);

  return { display, ref };
}

// =============================================
// SCROLL REVEAL HOOK
// =============================================

function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Animate rating bars inside
            entry.target.querySelectorAll('.rating-bar').forEach((bar) => {
              const el = bar as HTMLElement;
              setTimeout(() => {
                el.style.width = el.dataset.width + '%';
              }, 300);
            });

            // Animate trust score bar
            entry.target.querySelectorAll('.trust-score-bar').forEach((bar) => {
              const el = bar as HTMLElement;
              setTimeout(() => {
                el.style.width = el.dataset.target + '%';
              }, 400);
            });
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = containerRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}

// =============================================
// STAR FIELD COMPONENT
// =============================================

function StarField() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    for (let i = 0; i < 60; i++) {
      const star = document.createElement('div');
      star.className = 'absolute rounded-full bg-brand-400';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.setProperty('--duration', (2 + Math.random() * 4) + 's');
      star.style.setProperty('--delay', (Math.random() * 3) + 's');
      const size = (1 + Math.random() * 3) + 'px';
      star.style.width = size;
      star.style.height = size;
      star.style.animation = `star-twinkle var(--duration) ease-in-out infinite var(--delay)`;
      field.appendChild(star);
    }
  }, []);

  return <div ref={fieldRef} className="absolute inset-0 pointer-events-none" />;
}

// =============================================
// DEMO TRUST SCORE CARD
// =============================================

function TrustScoreDemo() {
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
          S
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Safaricom PLC</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
              <BadgeCheck className="w-3 h-3" /> Verified
            </span>
            <span className="text-xs text-slate-400">Telecom</span>
          </div>
        </div>
      </div>

      {/* Trust Score */}
      <div className="flex items-center gap-6 mb-6 p-5 rounded-2xl bg-gradient-to-r from-brand-50 to-emerald-50 border border-brand-100">
        <div className="text-center">
          <div className="text-4xl font-extrabold text-brand-700">9.2</div>
          <div className="text-xs font-semibold text-brand-600 mt-1">Trust Score</div>
        </div>
        <div className="flex-1">
          <div className="w-full h-2.5 bg-brand-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 trust-score-bar"
              style={{ width: '0%' }}
              data-target="92"
            />
          </div>
          <div className="flex justify-between text-[10px] text-brand-500 font-medium mt-1.5">
            <span>0</span><span>Low</span><span>Medium</span><span>High</span><span>10</span>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="space-y-2.5 mb-6">
        {ratingBreakdown.map((item) => (
          <div key={item.stars} className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600 w-6">{item.stars}*</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-400 rounded-full rating-bar"
                data-width={item.percent}
                style={{ width: '0%' }}
              />
            </div>
            <span className="text-xs text-slate-400 w-8 text-right">{item.percent}%</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((i) => (
          <Star key={i} className="w-4 h-4 text-gold-500 fill-gold-500" />
        ))}
        <Star className="w-4 h-4 text-gold-500 fill-gold-500 opacity-50" />
        <span className="font-bold text-slate-900 ml-1">4.2</span>
        <span className="text-slate-400 text-sm">(2,847 reviews)</span>
      </div>
    </div>
  );
}

// =============================================
// MAIN HOMEPAGE
// =============================================

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const revealContainer = useScrollReveal();

  // SWR data fetching
  const { data: companiesResponse, isLoading: companiesLoading } = useSWR(
    '/api/companies?sortBy=reviews&limit=6',
    (url: string) => fetch(url).then(res => res.json())
  );

  const { data: reviewsResponse, isLoading: reviewsLoading } = useSWR(
    '/api/reviews?limit=6&sortBy=recent',
    (url: string) => fetch(url).then(res => res.json())
  );

  const { data: statsResponse } = useSWR(
    '/api/stats',
    (url: string) => fetch(url).then(res => res.json())
  );

  const companies: Company[] = companiesResponse?.data || [];
  const reviews: Review[] = reviewsResponse?.data || [];
  const stats = statsResponse?.data;

  // Counter animations
  const companiesCount = useCountUp(stats?.companies);
  const reviewsCount = useCountUp(stats?.reviews);
  const avgRating = useCountUp(stats?.avgRating, true);

  // Search functionality
  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/companies?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
    }
  }, [searchQuery, router]);

  // Filter companies for search dropdown
  const searchResults = searchQuery.trim().length >= 1
    ? companies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const quickSearch = (term: string) => {
    setSearchQuery(term);
    setShowSearchDropdown(true);
  };

  return (
    <>
      <Head>
        <title>TrustFiti — Real Reviews, Real Trust</title>
        <meta
          name="description"
          content="TrustFiti is Kenya's trusted review platform. Read and write reviews for businesses, share your experiences, and help others make informed decisions."
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div ref={revealContainer}>
        {/* ============================================= */}
        {/* HERO SECTION                                   */}
        {/* ============================================= */}
        <section className="relative min-h-[100vh] flex items-center justify-center gradient-mesh overflow-hidden">
          <StarField />

          {/* Floating decorative elements */}
          <div className="absolute top-1/4 left-[10%] w-20 h-20 rounded-2xl glass-card flex items-center justify-center animate-float opacity-60 hidden md:flex">
            <Star className="w-8 h-8 text-gold-400" />
          </div>
          <div className="absolute top-1/3 right-[8%] w-16 h-16 rounded-2xl glass-card flex items-center justify-center animate-float-delayed opacity-50 hidden md:flex">
            <MessageCircle className="w-7 h-7 text-brand-300" />
          </div>
          <div className="absolute bottom-1/4 left-[15%] w-14 h-14 rounded-xl glass-card flex items-center justify-center animate-float-delayed opacity-40 hidden md:flex">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
          </div>
          <div className="absolute bottom-1/3 right-[12%] w-[72px] h-[72px] rounded-2xl glass-card flex items-center justify-center animate-float opacity-50 hidden md:flex">
            <ShieldCheck className="w-8 h-8 text-brand-200" />
          </div>

          {/* Pulse rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-brand-500/10 animate-pulse-ring" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-brand-400/10 animate-pulse-ring"
            style={{ animationDelay: '0.5s' }}
          />

          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-20">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400" />
              </span>
              <span className="text-sm font-medium text-brand-200">Trusted by thousands of users across Kenya</span>
            </div>

            {/* Heading */}
            <h1
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              Real Reviews.
              <br />
              <span className="shimmer-text">Real Trust.</span>
            </h1>

            {/* Subheading */}
            <p
              className="text-lg sm:text-xl text-brand-200/80 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
              style={{ animationDelay: '0.35s' }}
            >
              Discover honest reviews for businesses in Kenya. From telecoms to local shops &mdash; know who to trust before you spend.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div ref={searchRef} className="relative search-glow rounded-2xl transition-all duration-300">
                <form onSubmit={handleSearch}>
                  <div className="flex items-center bg-white rounded-2xl p-2 shadow-2xl shadow-black/20">
                    <div className="flex items-center gap-3 flex-1 pl-4">
                      <Search className="w-5 h-5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSearchDropdown(true);
                        }}
                        onFocus={() => {
                          if (searchQuery.trim().length >= 1) setShowSearchDropdown(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setShowSearchDropdown(false);
                        }}
                        placeholder="Search companies, brands, or services..."
                        className="w-full py-3 text-base text-slate-800 placeholder-slate-400 bg-transparent outline-none"
                        autoComplete="off"
                      />
                    </div>
                    <button
                      type="submit"
                      className="shrink-0 px-6 py-3 rounded-xl text-sm font-semibold text-white btn-primary"
                    >
                      <span className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" /> Search
                      </span>
                    </button>
                  </div>
                </form>

                {/* Search Dropdown */}
                {showSearchDropdown && searchQuery.trim().length >= 1 && (
                  <div className="search-dropdown active absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-slate-100 overflow-hidden z-50">
                    <div className="p-2">
                      {searchResults.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-sm text-slate-500 mb-3">
                            No companies found for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                          </p>
                          <Link
                            href={`/companies?q=${encodeURIComponent(searchQuery)}`}
                            onClick={() => setShowSearchDropdown(false)}
                            className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors inline-flex items-center gap-1"
                          >
                            <PlusCircle className="w-4 h-4" /> Browse all results
                          </Link>
                        </div>
                      ) : (
                        searchResults.slice(0, 5).map((c) => (
                          <Link
                            key={c.id}
                            href={`/companies/${c.slug}`}
                            onClick={() => setShowSearchDropdown(false)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {c.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900 truncate">{c.name}</span>
                                {c.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-brand-500 shrink-0" />}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>{c.averageRating.toFixed(1)}</span>
                                <span>&middot;</span>
                                <span>{c.totalReviews} reviews</span>
                                {c.industry && (
                                  <>
                                    <span>&middot;</span>
                                    <span>{c.industry}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick searches */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="text-xs text-brand-300/60">Popular:</span>
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => quickSearch(term)}
                    className="px-3 py-1 rounded-full text-xs font-medium text-brand-200/80 glass hover:bg-white/15 transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.65s' }}>
              <Link
                href="/reviews/write"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-white btn-primary shadow-xl shadow-brand-500/20 inline-flex items-center justify-center gap-2"
              >
                <span className="flex items-center justify-center gap-2">
                  <PenLine className="w-5 h-5" /> Write a Review
                </span>
              </Link>
              <Link
                href="/claim"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-white glass hover:bg-white/15 transition-all inline-flex items-center justify-center gap-2"
              >
                <span className="flex items-center justify-center gap-2">
                  <Building2 className="w-5 h-5" /> Claim Your Business
                </span>
              </Link>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* ============================================= */}
        {/* STATS BAR                                      */}
        {/* ============================================= */}
        <section className="relative -mt-16 z-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                <div className="text-center reveal">
                  <div ref={companiesCount.ref} className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {companiesCount.display}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Companies Listed</div>
                </div>
                <div className="text-center reveal" style={{ transitionDelay: '0.1s' }}>
                  <div ref={reviewsCount.ref} className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {reviewsCount.display}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Reviews Written</div>
                </div>
                <div className="text-center reveal" style={{ transitionDelay: '0.2s' }}>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {stats ? Math.floor((stats.reviews || 0) * 0.6).toLocaleString() : '0'}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Active Users</div>
                </div>
                <div className="text-center reveal" style={{ transitionDelay: '0.3s' }}>
                  <div className="flex items-center justify-center gap-1">
                    <span ref={avgRating.ref} className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {avgRating.display}
                    </span>
                    <Star className="w-5 h-5 text-gold-500 fill-gold-500" />
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Avg. Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================= */}
        {/* HOW IT WORKS                                   */}
        {/* ============================================= */}
        <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 reveal">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold mb-4">
                <Sparkles className="w-4 h-4" /> Simple &amp; Powerful
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                How TrustFiti Works
              </h2>
              <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                Three simple steps to transparency. Whether you&apos;re a customer or a business owner.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((item) => (
                <div key={item.step} className="reveal" style={{ transitionDelay: `${item.step * 0.1}s` }}>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-500/20 to-brand-700/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                    <div className="relative bg-white border border-slate-100 rounded-3xl p-8 hover:border-brand-200 transition-colors duration-300 h-full">
                      <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-6 transition-colors`}>
                        <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                      </div>
                      <div className={`text-xs font-bold ${item.badgeColor} tracking-widest uppercase mb-3`}>
                        Step 0{item.step}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                      <p className="text-slate-500 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================= */}
        {/* TRENDING COMPANIES                             */}
        {/* ============================================= */}
        <section id="trending" className="py-24 sm:py-32 px-4 sm:px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 reveal">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold mb-4">
                  <TrendingUp className="w-4 h-4" /> Trending Now
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Most Reviewed Companies
                </h2>
              </div>
              <Link
                href="/companies"
                className="mt-4 sm:mt-0 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors group"
              >
                View All Companies
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {companiesLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : companies.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company, i) => (
                  <div key={company.id} className="reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                    <CompanyCard company={company} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No companies listed yet. Be the first to add one!</p>
              </div>
            )}
          </div>
        </section>

        {/* ============================================= */}
        {/* CATEGORIES                                     */}
        {/* ============================================= */}
        <section id="categories" className="py-24 sm:py-32 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 reveal">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold mb-4">
                <LayoutGrid className="w-4 h-4" /> Browse by Category
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Explore Industries
              </h2>
              <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                Find reviews in the sector that matters to you.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 reveal" style={{ transitionDelay: '0.15s' }}>
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/companies?industry=${encodeURIComponent(cat.name)}`}
                  className="category-pill inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:shadow-md"
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">{cat.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================= */}
        {/* TRUST & TRANSPARENCY                           */}
        {/* ============================================= */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: Content */}
              <div className="reveal">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold mb-6">
                  <ShieldCheck className="w-4 h-4" /> Trust Engine
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                  Every Review is
                  <br />
                  <span className="text-brand-600">Weighted by Trust</span>
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed mb-8">
                  Our proprietary Trust Score goes beyond simple averages. We factor in review recency, verification status, reviewer reputation, and fraud signals to give you a score you can actually rely on.
                </p>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Recency Weighting</h4>
                      <p className="text-sm text-slate-500">Recent reviews carry more weight. A company&apos;s latest performance matters most.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center shrink-0 mt-0.5">
                      <BadgeCheck className="w-5 h-5 text-gold-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Verified Reviews</h4>
                      <p className="text-sm text-slate-500">Reviews from verified customers boost trust scores significantly.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldAlert className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Fraud Detection</h4>
                      <p className="text-sm text-slate-500">Multi-layered checks catch fake reviews, duplicate accounts, and coordinated manipulation.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Trust Score Demo */}
              <div className="reveal" style={{ transitionDelay: '0.2s' }}>
                <TrustScoreDemo />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================= */}
        {/* RECENT REVIEWS                                 */}
        {/* ============================================= */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 reveal">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-400/10 text-gold-600 text-sm font-semibold mb-4">
                <MessageCircle className="w-4 h-4" /> Fresh Feedback
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Recent Reviews
              </h2>
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review, i) => (
                  <div key={review.id} className="reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                    <ReviewCard review={review} showCompany homepage />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <p className="text-slate-600">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </section>

        {/* ============================================= */}
        {/* CTA SECTION                                    */}
        {/* ============================================= */}
        <section className="py-24 sm:py-32 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto reveal">
            <div className="relative rounded-3xl overflow-hidden gradient-mesh p-12 sm:p-16 text-center">
              {/* Decorative */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-400/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-brand-200 text-sm font-semibold mb-6">
                  <Rocket className="w-4 h-4" /> For Business Owners
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
                  Take Control of
                  <br />
                  Your Reputation
                </h2>
                <p className="text-lg text-brand-200/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Claim your business profile, respond to reviews, and show customers you care. Verification takes minutes &mdash; not days.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/claim"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-brand-900 bg-white hover:bg-brand-50 transition-all shadow-xl shadow-black/10 hover:shadow-brand-500/20 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
                  >
                    <Building2 className="w-5 h-5" /> Claim Your Business
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-white glass hover:bg-white/15 transition-all inline-flex items-center justify-center gap-2"
                  >
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
