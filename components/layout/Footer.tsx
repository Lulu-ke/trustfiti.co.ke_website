import React from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const footerColumns = [
  {
    title: 'Platform',
    links: [
      { label: 'Browse companies', href: '/companies' },
      { label: 'Write a review', href: '/reviews/write' },
      { label: 'Categories', href: '/companies' },
      { label: 'Trending', href: '/companies?sort=reviews' },
    ],
  },
  {
    title: 'Businesses',
    links: [
      { label: 'Claim your listing', href: '/claim' },
      { label: 'Business dashboard', href: '#', comingSoon: true },
      { label: 'Verification', href: '/how-it-works' },
      { label: 'Pricing', href: '#', comingSoon: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Trustfiti', href: '/about' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Trust & Safety', href: '#', comingSoon: true },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--text-primary)] pt-16 pb-8 px-4 sm:px-8">
      <div className="max-w-[1160px] mx-auto">
        {/* Top */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-head font-extrabold text-lg text-white mb-3">
              Trust<span className="text-[#9FE1CB]">fiti</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-[280px]">
              Kenya&apos;s trusted platform for honest company reviews. Built for consumers and businesses across East Africa.
            </p>
          </div>

          {/* Columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h5 className="font-head text-[13px] font-semibold text-white uppercase tracking-[0.8px] mb-4">
                {col.title}
              </h5>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'comingSoon' in link && link.comingSoon ? (
                      <button
                        onClick={() => toast('Coming soon!', { icon: '🔜' })}
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-white/35">
            &copy; {new Date().getFullYear()} Trustfiti. All rights reserved. &middot;{' '}
            <Link href="/privacy" className="text-white/35 hover:text-white/60 transition-colors">Privacy</Link>
            {' '}&middot;{' '}
            <Link href="/terms" className="text-white/35 hover:text-white/60 transition-colors">Terms</Link>
          </p>
          <p className="text-xs text-white/25">
            Made with &#10084;&#65039; in Nairobi, Kenya &#127474;&#127462;
          </p>
        </div>
      </div>
    </footer>
  );
}
