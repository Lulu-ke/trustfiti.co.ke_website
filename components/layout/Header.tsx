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
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';

const navLinks = [
  { href: '/companies', label: 'Browse Companies' },
  { href: '/companies', label: 'Categories' },
  { href: '/reviews/write', label: 'Write a Review' },
  { href: '/claim', label: 'For Businesses' },
];

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <header className="sticky top-0 z-100 h-16 flex items-center justify-between px-4 sm:px-8 bg-[rgba(250,250,247,0.88)] backdrop-blur-[20px] border-b border-[rgba(60,55,40,0.12)]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-[10px] bg-accent flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <span className="font-head font-extrabold text-xl text-[var(--text-primary)] tracking-tight">
            Trust<span className="text-accent">fiti</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2.5">
          {status === 'authenticated' && <NotificationBell />}

          {status === 'authenticated' ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--gray-50)] transition-colors"
              >
                <Avatar src={session.user?.image} name={session.user?.name} size="sm" />
                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[var(--radius-md)] shadow-md border border-[var(--border)] py-1 animate-slide-down">
                  <div className="px-4 py-2 border-b border-[var(--border)]">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {session.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {session.user?.email || ''}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--gray-50)] transition-colors"
                  >
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--coral-400)] hover:bg-[var(--coral-50)] w-full text-left transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link href="/login" className="btn btn-primary">
                Sign up free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--gray-50)] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Menu */}
      <div className={cn('mobile-menu fixed inset-y-0 right-0 w-80 max-w-full bg-white z-[60] shadow-lg', mobileMenuOpen && 'open')}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-lg font-bold text-[var(--text-primary)]">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-[var(--radius-sm)] hover:bg-[var(--gray-50)] transition-colors"
            >
              <X className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[var(--radius-md)] border border-[var(--border-md)] bg-[var(--bg)] focus:bg-white focus:border-accent focus:outline-none transition-colors"
                />
              </div>
            </form>

            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-[var(--radius-md)] text-base font-medium text-[var(--text-secondary)] hover:bg-[var(--teal-50)] hover:text-[var(--accent)] transition-all"
              >
                {link.label}
              </Link>
            ))}

            <hr className="my-4 border-[var(--border)]" />

            {status === 'authenticated' ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-[var(--radius-md)] text-base font-medium text-[var(--text-secondary)] hover:bg-[var(--gray-50)] transition-all"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="px-4 py-3 rounded-[var(--radius-md)] text-base font-medium text-[var(--coral-400)] hover:bg-[var(--coral-50)] transition-all w-full text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-[var(--radius-md)] text-base font-medium text-[var(--text-secondary)] hover:bg-[var(--gray-50)] transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 w-full btn btn-primary text-center justify-center py-3"
                >
                  Sign up free
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
