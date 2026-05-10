import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import CompanyCard from '@/components/companies/CompanyCard';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SearchBar from '@/components/search/SearchBar';
import { SlidersHorizontal, Building2 } from 'lucide-react';
import type { Company, Pagination as PaginationType } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const sortOptions = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'name', label: 'Name A-Z' },
];

export default function CompaniesPage() {
  const router = useRouter();
  const { q, industry, city, sort: sortParam } = router.query;

  const [searchQuery, setSearchQuery] = useState((q as string) || '');
  const [selectedIndustry, setSelectedIndustry] = useState((industry as string) || '');
  const [selectedCity, setSelectedCity] = useState((city as string) || '');
  const [sortBy, setSortBy] = useState((sortParam as string) || 'rating');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL params to state on navigation
  useEffect(() => {
    setSearchQuery((q as string) || '');
    setSelectedIndustry((industry as string) || '');
    setSelectedCity((city as string) || '');
    setSortBy((sortParam as string) || 'rating');
    setPage(1);
  }, [q, industry, city, sortParam]);

  const params = new URLSearchParams({
    page: page.toString(),
    limit: '12',
    sort: sortBy,
  });
  if (searchQuery) params.set('q', searchQuery);
  if (selectedIndustry) params.set('industry', selectedIndustry);
  if (selectedCity) params.set('city', selectedCity);

  const { data, error, isLoading } = useSWR<{
    companies: Company[];
    pagination: PaginationType;
    filters: { industries: string[]; cities: string[] };
  }>(`/api/companies?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
  });

  const companies = data?.companies ?? [];
  const pagination = data?.pagination;
  const filters = data?.filters;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('');
    setSelectedCity('');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || selectedIndustry || selectedCity;

  return (
    <>
      <Head>
        <title>Browse Companies — TrustFiti</title>
        <meta
          name="description"
          content="Browse and search companies on TrustFiti. Read reviews and find trusted businesses in Kenya."
        />
      </Head>

      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Browse Companies
            </h1>
            <p className="text-gray-600">
              Discover and review businesses across Kenya
            </p>

            {/* Search & Sort Bar */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <SearchBar
                  placeholder="Search companies by name..."
                  onNavigate={() => {}}
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>
              </div>
            </div>

            {/* Filter Row */}
            {showFilters && (
              <div className="mt-4 flex flex-wrap gap-3 animate-slide-down">
                {filters?.industries && filters.industries.length > 0 && (
                  <select
                    value={selectedIndustry}
                    onChange={(e) => {
                      setSelectedIndustry(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">All Industries</option>
                    {filters.industries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                )}

                {filters?.cities && filters.cities.length > 0 && (
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">All Cities</option>
                    {filters.cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading && !data ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Failed to load companies
              </h3>
              <p className="text-sm text-gray-500">
                Something went wrong. Please try again.
              </p>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No companies found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters.'
                  : 'No companies have been listed yet.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                Showing {companies.length} of{' '}
                {pagination?.total ?? 0} companies
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
