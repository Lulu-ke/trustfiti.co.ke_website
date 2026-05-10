import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X, Building2, Globe, MapPin, Tag } from 'lucide-react';
import Button from '@/components/ui/Button';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyAdded: (company: { id: string; name: string; slug: string; industry: string | null }) => void;
  prefilledName?: string;
}

interface FormErrors {
  name?: string;
  website?: string;
}

export default function AddCompanyModal({
  isOpen,
  onClose,
  onCompanyAdded,
  prefilledName = '',
}: AddCompanyModalProps) {
  const [name, setName] = useState(prefilledName);
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync prefilledName when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(prefilledName);
      setIndustry('');
      setWebsite('');
      setCity('');
      setError('');
      setFormErrors({});
      setIsSubmitting(false);
      // Focus name input after transition
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen, prefilledName]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!name.trim()) {
      errors.name = 'Company name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Company name must be at least 2 characters';
    }

    if (website.trim() && !isValidUrl(website.trim())) {
      errors.website = 'Please enter a valid URL (e.g. https://example.com)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload: Record<string, string> = {
        name: name.trim(),
      };

      if (industry.trim()) payload.industry = industry.trim();
      if (website.trim()) payload.website = website.trim();
      if (city.trim()) payload.city = city.trim();

      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Failed to add company');
        return;
      }

      const company = data.data;
      onCompanyAdded({
        id: company.id,
        name: company.name,
        slug: company.slug,
        industry: company.industry,
      });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-company-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-md bg-white rounded-[var(--radius-xl)]',
          'shadow-[var(--shadow-xl)] overflow-hidden',
          'animate-scale-in'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--teal-50)] flex items-center justify-center">
              <Building2 className="h-4.5 w-4.5 text-[var(--accent)]" />
            </div>
            <h2
              id="add-company-title"
              className="text-base font-semibold text-[var(--text-primary)]"
            >
              Add New Company
            </h2>
          </div>
          {!isSubmitting && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--gray-100)] transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Error display */}
          {error && (
            <div className="px-3.5 py-2.5 rounded-[var(--radius-md)] bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Company Name */}
          <div>
            <label
              htmlFor="company-name"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="company-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. Safaricom"
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className={cn(
                'w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-md)] border',
                'bg-white text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'outline-none transition-all duration-200',
                formErrors.name
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-[var(--border-md)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(29,158,117,0.1)]'
              )}
            />
            {formErrors.name && (
              <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
            )}
          </div>

          {/* Industry */}
          <div>
            <label
              htmlFor="company-industry"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Industry / Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input
                id="company-industry"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Telecommunications"
                disabled={isSubmitting}
                className={cn(
                  'w-full pl-9 pr-3.5 py-2.5 text-sm rounded-[var(--radius-md)] border',
                  'bg-white text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                  'outline-none transition-all duration-200',
                  'border-[var(--border-md)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(29,158,117,0.1)]'
                )}
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label
              htmlFor="company-website"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input
                id="company-website"
                type="url"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  if (formErrors.website) setFormErrors((prev) => ({ ...prev, website: undefined }));
                }}
                placeholder="https://example.com"
                disabled={isSubmitting}
                className={cn(
                  'w-full pl-9 pr-3.5 py-2.5 text-sm rounded-[var(--radius-md)] border',
                  'bg-white text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                  'outline-none transition-all duration-200',
                  formErrors.website
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-[var(--border-md)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(29,158,117,0.1)]'
                )}
              />
            </div>
            {formErrors.website && (
              <p className="mt-1 text-xs text-red-500">{formErrors.website}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="company-city"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input
                id="company-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Nairobi"
                disabled={isSubmitting}
                className={cn(
                  'w-full pl-9 pr-3.5 py-2.5 text-sm rounded-[var(--radius-md)] border',
                  'bg-white text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                  'outline-none transition-all duration-200',
                  'border-[var(--border-md)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(29,158,117,0.1)]'
                )}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[var(--gray-50)] border-t border-[var(--border)]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Adding...' : 'Add Company'}
          </Button>
        </div>
      </div>
    </div>
  );
}
