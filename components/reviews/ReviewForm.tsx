import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StarRating from '@/components/reviews/StarRating';
import CompanySearch from '@/components/companies/CompanySearch';
import { Send, AlertCircle } from 'lucide-react';
import type { Company } from '@/types';

interface ReviewFormProps {
  companyId?: string;
  companyName?: string;
  invitationToken?: string;
  onSuccess?: () => void;
}

interface FormErrors {
  company?: string;
  rating?: string;
  title?: string;
  content?: string;
}

export default function ReviewForm({
  companyId,
  companyName,
  invitationToken,
  onSuccess,
}: ReviewFormProps) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(
    companyId && companyName
      ? {
          id: companyId,
          name: companyName,
          slug: '',
          description: null,
          logo: null,
          coverImage: null,
          website: null,
          industry: null,
          address: null,
          city: null,
          country: 'KE',
          averageRating: 0,
          totalReviews: 0,
          isVerified: false,
          isActive: true,
          isFeatured: false,
          createdAt: new Date().toISOString(),
        }
      : null
  );
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const maxContentLength = 2000;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!selectedCompany) newErrors.company = 'Please select a company';
    if (rating === 0) newErrors.rating = 'Please select a rating';
    if (!title.trim()) newErrors.title = 'Please enter a title';
    else if (title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!content.trim()) newErrors.content = 'Please write your review';
    else if (content.trim().length < 20)
      newErrors.content = 'Review must be at least 20 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: Record<string, string | number> = {
        companyId: selectedCompany!.id,
        rating,
        title: title.trim(),
        content: content.trim(),
      };
      if (invitationToken) payload.invitationToken = invitationToken;

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit review');
      }

      onSuccess?.();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {submitError}
        </div>
      )}

      {/* Company Selector */}
      {!companyId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Company <span className="text-red-500">*</span>
          </label>
          <CompanySearch onSelect={setSelectedCompany} />
          {selectedCompany && (
            <p className="mt-1.5 text-sm text-emerald-600 font-medium">
              Reviewing: {selectedCompany.name}
            </p>
          )}
          {errors.company && (
            <p className="mt-1.5 text-sm text-red-600">{errors.company}</p>
          )}
        </div>
      )}

      {selectedCompany && !companyId && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700">
            {selectedCompany.name}
          </p>
          {selectedCompany.industry && (
            <p className="text-xs text-gray-500">{selectedCompany.industry}</p>
          )}
        </div>
      )}

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <StarRating
            value={rating}
            onChange={setRating}
            size="lg"
          />
          {rating > 0 && (
            <span className="text-sm text-gray-500">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Bad'}
              {rating === 3 && 'Average'}
              {rating === 4 && 'Good'}
              {rating === 5 && 'Excellent'}
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="mt-1.5 text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      {/* Title */}
      <Input
        label="Review Title"
        placeholder="Summarize your experience"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        maxLength={100}
      />

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell others about your experience with this company..."
          rows={5}
          maxLength={maxContentLength}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
            'transition-colors duration-150 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            errors.content
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
          )}
        />
        <div className="flex justify-between mt-1.5">
          {errors.content ? (
            <p className="text-sm text-red-600">{errors.content}</p>
          ) : (
            <span />
          )}
          <p
            className={cn(
              'text-xs',
              content.length > maxContentLength * 0.9
                ? 'text-red-500'
                : 'text-gray-400'
            )}
          >
            {content.length}/{maxContentLength}
          </p>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        loading={isSubmitting}
        className="w-full"
      >
        <Send className="h-4 w-4" />
        Publish Review
      </Button>
    </form>
  );
}
