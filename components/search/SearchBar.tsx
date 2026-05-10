import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Search,
  X,
  Building2,
  Loader2,
  ArrowRight,
  Tag,
  Star,
} from 'lucide-react';

interface SearchCompany {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  industry: string | null;
  city: string | null;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
}

interface SearchCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count: { companies: number };
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  variant?: 'header' | 'hero' | 'minimal';
  onNavigate?: () => void;
}

export default function SearchBar({
  placeholder = 'Search company or category',
  className,
  variant = 'header',
  onNavigate,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [companies, setCompanies] = useState<SearchCompany[]>([]);
  const [categories, setCategories] = useState<SearchCategory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Total navigable items for keyboard nav
  const totalItems = companies.length + categories.length + (query.trim() ? 1 : 0);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setCompanies([]);
      setCategories([]);
      setIsOpen(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery.trim())}&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          setCompanies(data.data?.companies || []);
          setCategories(data.data?.categories || []);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch {
        setCompanies([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          if (query.trim()) {
            setIsOpen(true);
          }
        }
        if (e.key === 'Escape') {
          setIsFocused(false);
          inputRef.current?.blur();
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, totalItems - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < companies.length) {
          handleCompanyClick(companies[selectedIndex]);
        } else if (
          selectedIndex >= companies.length &&
          selectedIndex < companies.length + categories.length
        ) {
          const catIdx = selectedIndex - companies.length;
          handleCategoryClick(categories[catIdx]);
        } else if (selectedIndex === totalItems - 1 && query.trim()) {
          handleShowAllResults();
        } else if (query.trim()) {
          handleShowAllResults();
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [isOpen, selectedIndex, totalItems, companies, categories, query]
  );

  const handleCompanyClick = (company: SearchCompany) => {
    onNavigate?.();
    setQuery('');
    setIsOpen(false);
    router.push(`/companies/${company.slug}`);
  };

  const handleCategoryClick = (category: SearchCategory) => {
    onNavigate?.();
    setQuery('');
    setIsOpen(false);
    router.push(`/companies?industry=${encodeURIComponent(category.name)}`);
  };

  const handleShowAllResults = () => {
    onNavigate?.();
    const currentQuery = query.trim();
    setIsOpen(false);
    router.push(
      `/companies?q=${encodeURIComponent(currentQuery)}`
    );
  };

  const clearQuery = () => {
    setQuery('');
    setCompanies([]);
    setCategories([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (debouncedQuery.trim() && (companies.length > 0 || categories.length > 0)) {
      setIsOpen(true);
    }
  };

  // Variant-specific input classes
  const inputClasses = cn(
    'w-full font-body text-sm outline-none transition-all duration-200',
    variant === 'header' && [
      'pl-10 pr-9 py-2.5 rounded-[var(--radius-md)] border border-[var(--border-md)]',
      'bg-[var(--bg)] text-[var(--text-primary)]',
      'placeholder:text-[var(--text-muted)]',
      'focus:bg-white focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(29,158,117,0.1)]',
    ],
    variant === 'hero' && [
      'pl-11 pr-11 py-4 rounded-[var(--radius-md)]',
      'border-2 border-[var(--border-md)] bg-[var(--bg)] text-[var(--text-primary)]',
      'placeholder:text-[var(--text-muted)]',
      'focus:border-[var(--accent)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(29,158,117,0.1)]',
      'text-base',
    ],
    variant === 'minimal' && [
      'pl-10 pr-9 py-2 rounded-lg border border-gray-300 bg-white text-gray-900',
      'placeholder:text-gray-400',
      'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--teal-50)]',
    ]
  );

  const dropdownWidth = variant === 'hero' ? 'max-w-[540px]' : 'w-full';

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Input */}
      <div className="relative">
        <Search
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)]',
            variant === 'hero' ? 'left-4 h-5 w-5' : 'left-3 h-4 w-4'
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={inputClasses}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-activedescendant={
            selectedIndex >= 0 ? `search-option-${selectedIndex}` : undefined
          }
        />
        {query && (
          <button
            onClick={clearQuery}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors',
              variant === 'hero' ? 'right-12' : 'right-9'
            )}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <Loader2
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-[var(--accent)] animate-spin',
              variant === 'hero' ? 'right-12' : 'right-9'
            )}
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && isFocused && (
        <div
          className={cn(
            'absolute top-full mt-2 bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]',
            'border border-[var(--border)] overflow-hidden z-50',
            'animate-slide-down',
            'search-suggestions-scroll',
            dropdownWidth
          )}
          id="search-suggestions"
          role="listbox"
        >
          {companies.length === 0 && categories.length === 0 && !isLoading ? (
            /* No results */
            <div className="px-5 py-8 text-center">
              <Search className="h-8 w-8 text-[var(--gray-100)] mx-auto mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">
                No results for &ldquo;{query}&rdquo;
              </p>
              <button
                onClick={handleShowAllResults}
                className="mt-2 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-dark)] transition-colors"
              >
                Search anyway
              </button>
            </div>
          ) : (
            <>
              {/* Companies */}
              {companies.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-[var(--gray-50)] border-b border-[var(--border)]">
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Companies
                    </span>
                  </div>
                  {companies.map((company, index) => {
                    const itemIndex = index;
                    const isSelected = selectedIndex === itemIndex;
                    return (
                      <button
                        key={company.id}
                        id={`search-option-${itemIndex}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleCompanyClick(company)}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                          isSelected
                            ? 'bg-[var(--teal-50)]'
                            : 'hover:bg-[var(--gray-50)]'
                        )}
                      >
                        {/* Logo / Initial */}
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt=""
                            className="w-9 h-9 rounded-[var(--radius-sm)] object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--teal-50)] flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 text-[var(--accent)]" />
                          </div>
                        )}
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {company.name}
                            </span>
                            {company.isVerified && (
                              <svg
                                viewBox="0 0 24 24"
                                className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0"
                                fill="currentColor"
                              >
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {/* Stars */}
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-[#EF9F27] text-[#EF9F27]" />
                              <span className="text-xs font-medium text-[var(--text-secondary)]">
                                {company.averageRating.toFixed(1)}
                              </span>
                            </div>
                            {company.industry && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-[var(--gray-100)]" />
                                <span className="text-xs text-[var(--text-muted)] truncate">
                                  {company.industry}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Reviews count */}
                        <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                          {company.totalReviews} review{company.totalReviews !== 1 ? 's' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-[var(--gray-50)] border-b border-[var(--border)]">
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Categories
                    </span>
                  </div>
                  {categories.map((category, index) => {
                    const itemIndex = companies.length + index;
                    const isSelected = selectedIndex === itemIndex;
                    return (
                      <button
                        key={category.id}
                        id={`search-option-${itemIndex}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleCategoryClick(category)}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                          isSelected
                            ? 'bg-[var(--teal-50)]'
                            : 'hover:bg-[var(--gray-50)]'
                        )}
                      >
                        <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--amber-50)] flex items-center justify-center flex-shrink-0">
                          <Tag className="h-4 w-4 text-[var(--amber-400)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {category.icon ? `${category.icon} ` : ''}
                            {category.name}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                          {category._count.companies} business{category._count.companies !== 1 ? 'es' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Show All Results */}
              {query.trim() && (companies.length > 0 || categories.length > 0) && (
                <div className="border-t border-[var(--border)]">
                  <button
                    id={`search-option-${totalItems - 1}`}
                    role="option"
                    aria-selected={selectedIndex === totalItems - 1}
                    onClick={handleShowAllResults}
                    onMouseEnter={() => setSelectedIndex(totalItems - 1)}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                      selectedIndex === totalItems - 1
                        ? 'bg-[var(--teal-50)] text-[var(--accent)]'
                        : 'text-[var(--accent)] hover:bg-[var(--teal-50)]'
                    )}
                  >
                    Show All Results for &ldquo;{query}&rdquo;
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
