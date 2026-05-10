import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import ReviewForm from '@/components/reviews/ReviewForm';
import Button from '@/components/ui/Button';
import { PenSquare, Lock } from 'lucide-react';
import Link from 'next/link';

export default function WriteReviewPage() {
  const { status } = useSession();
  const router = useRouter();
  const { companyId, companyName, invitationToken } = router.query;

  if (status === 'loading') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-emerald-600" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Sign in required
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            You need to be signed in to write a review.
          </p>
          <Link href="/login">
            <Button size="lg" className="w-full">
              Sign In to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSuccess = () => {
    toast.success('Your review has been published!');
    const cid = companyId as string;
    if (cid) {
      router.push(`/companies/${encodeURIComponent(companyName as string)}`);
    } else {
      router.push('/profile');
    }
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
              companyName={companyName as string | undefined}
              invitationToken={invitationToken as string | undefined}
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
