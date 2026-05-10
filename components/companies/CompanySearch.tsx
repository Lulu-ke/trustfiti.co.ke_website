import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, X, Building2, Loader2 } from 'lucide-react';
import type { Company } from '@/types';

interface CompanySearchProps {
  onSelect: (company: Company) => void;
  placeholder?: string;
  className?: string;
}

export default function CompanySearch({
  onSelect,
  placeholder = 'Search for a company...',
  className,
}: CompanySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/companies?q=${encodeURIComponent(debouncedQuery.trim())}&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.companies || []);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (company: Company) => {
    onSelect(company);
    setQuery(company.name);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="company-search-results"
          aria-activedescendant={
            selectedIndex >= 0 ? `company-option-${selectedIndex}` : undefined
          }
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <ul
          id="company-search-results"
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 animate-slide-down max-h-64 overflow-y-auto"
        >
          {results.map((company, index) => (
            <li
              key={company.id}
              id={`company-option-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSelect(company)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors',
                index === selectedIndex
                  ? 'bg-emerald-50'
                  : 'hover:bg-gray-50'
              )}
            >
              {company.logo ? (
                <img
                  src={company.logo}
                  alt=""
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-4 w-4 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {company.name}
                </p>
                {company.industry && (
                  <p className="text-xs text-gray-500">{company.industry}</p>
                )}
              </div>
              {company.city && (
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {company.city}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOpen && !isLoading && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 animate-slide-down">
          <p className="text-sm text-gray-500 text-center">No companies found</p>
        </div>
      )}
    </div>
  );
}
