import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import NotificationBell from '@/components/notifications/NotificationBell';
import {
  Search,
  Menu,
  X,
  PenSquare,
  Building2,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const navLinks = [
  { href: '/companies', label: 'Search' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/companies?sort=reviews', label: 'Trending' },
  { href: '/companies', label: 'Categories' },
];

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHomePage = router.pathname === '/';

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 80);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/companies?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // On homepage, the navbar is transparent until scrolled
  const navBg = isHomePage && !isScrolled
    ? 'bg-transparent'
    : 'bg-white border-b border-gray-200';

  const navTextColor = isHomePage && !isScrolled;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          navBg,
          isScrolled && !isHomePage ? 'sticky' : '',
          isScrolled && isHomePage ? 'nav-scrolled' : ''
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className={cn(
                'text-xl font-bold transition-colors',
                navTextColor ? 'text-white' : 'text-slate-900'
              )}>
                Trust<span className="text-brand-400">Fiti</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    navTextColor
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {status === 'authenticated' && <NotificationBell />}

              {status === 'authenticated' ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Avatar
                      src={session.user?.image}
                      name={session.user?.name}
                      size="sm"
                    />
                    <ChevronDown className={cn(
                      'h-4 w-4 transition-colors',
                      navTextColor ? 'text-white/60' : 'text-gray-500'
                    )} />
                  </button>
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 animate-slide-down">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session.user?.email || ''}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      navTextColor
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/login"
                    className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white inline-flex items-center gap-1"
                  >
                    <span>Get Started</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                'md:hidden p-2 rounded-lg transition-all',
                navTextColor ? 'text-white/80 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
              )}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={cn('mobile-menu fixed inset-y-0 right-0 w-80 max-w-full bg-white z-[60] shadow-2xl', mobileMenuOpen && 'open')}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-lg font-bold text-slate-900">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none transition-colors"
                />
              </div>
            </form>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/reviews/write"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all"
            >
              Write a Review
            </Link>
            <Link
              href="/claim"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-all"
            >
              Claim Your Business
            </Link>

            <hr className="my-4 border-slate-100" />

            {status === 'authenticated' ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 transition-all"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-all w-full text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 w-full px-5 py-3 rounded-xl text-base font-semibold text-white btn-primary text-center inline-block"
                >
                  <span>Get Started Free</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[55] transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
