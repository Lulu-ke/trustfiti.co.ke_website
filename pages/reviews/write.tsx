import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import ReviewForm from '@/components/reviews/ReviewForm';
import { PenSquare } from 'lucide-react';

export default function WriteReviewPage() {
  const router = useRouter();
  const { companyId } = router.query;

  const handleSuccess = () => {
    toast.success('Your review has been published!');
    router.push('/profile');
  };

  return (
    <>
      <Head>
        <title>Write a Review — TrustFiti</title>
        <meta
          name="description"
          content="Share your experience by writing a review for a company on TrustFiti."
        />
      </Head>

      <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-3">
              <PenSquare className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Write a Review
            </h1>
            <p className="text-gray-500 text-sm">
              Share your honest experience to help others make informed decisions
            </p>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
            <ReviewForm
              companyId={companyId as string | undefined}
              companyName={undefined}
              invitationToken={undefined}
              onSuccess={handleSuccess}
            />
          </div>

          {/* Guidelines */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              Review Guidelines
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Be honest and factual about your experience</li>
              <li>• Focus on the product or service, not personal attacks</li>
              <li>• Avoid profanity or offensive language</li>
              <li>• Don&apos;t include personal information like phone numbers</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
