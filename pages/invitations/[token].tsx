import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  PenSquare,
  ArrowLeft,
} from 'lucide-react';
import type { Invitation } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function InvitationPage() {
  const router = useRouter();
  const { token } = router.query;

  const { data, error, isLoading } = useSWR<{ invitation: Invitation }>(
    token ? `/api/invitations/${token}` : null,
    fetcher
  );

  if (!router.isReady || isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const invitation = data?.invitation;
  const isExpired = invitation
    ? new Date(invitation.expiresAt) < new Date()
    : false;
  const isUsed = invitation?.isUsed ?? false;
  const isInvalid = error || !invitation;

  const getRedirectUrl = () => {
    if (!invitation) return '/reviews/write';
    return `/reviews/write?companyId=${invitation.company.id}&companyName=${encodeURIComponent(invitation.company.name)}&invitationToken=${encodeURIComponent(invitation.token)}`;
  };

  return (
    <>
      <Head>
        <title>Review Invitation — TrustFiti</title>
      </Head>

      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Trust<span className="text-emerald-600">Fiti</span>
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {isInvalid ? (
              /* Invalid Token */
              <div className="p-6 sm:p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-red-500 mb-4">
                  <XCircle className="h-7 w-7" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  Invalid Invitation
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                  This invitation link is not valid. It may have been removed or
                  the URL might be incorrect.
                </p>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Go to Homepage
                  </Button>
                </Link>
              </div>
            ) : isExpired ? (
              /* Expired */
              <div className="p-6 sm:p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 text-amber-500 mb-4">
                  <Clock className="h-7 w-7" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  Invitation Expired
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                  This invitation has expired. Please contact{' '}
                  <strong>{invitation.company.name}</strong> for a new
                  invitation link.
                </p>
                <div className="flex flex-col gap-2">
                  <Link href="/companies">
                    <Button variant="outline" className="w-full">
                      Browse Companies
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button className="w-full">Go to Homepage</Button>
                  </Link>
                </div>
              </div>
            ) : isUsed ? (
              /* Already Used */
              <div className="p-6 sm:p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 text-gray-400 mb-4">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  Already Responded
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                  You have already submitted a review for{' '}
                  <strong>{invitation.company.name}</strong> using this
                  invitation.
                </p>
                {invitation.company.name && (
                  <Link href="/companies">
                    <Button variant="outline" className="w-full">
                      Browse More Companies
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              /* Valid Invitation */
              <div className="p-6 sm:p-8 text-center">
                {/* Company Info */}
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-emerald-50 mb-3">
                    {invitation.company.logo ? (
                      <img
                        src={invitation.company.logo}
                        alt={invitation.company.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-emerald-600" />
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    {invitation.company.name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    has invited you to share your experience
                  </p>
                </div>

                {/* Invitation Message */}
                {invitation.message && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-gray-600 italic">
                      &ldquo;{invitation.message}&rdquo;
                    </p>
                  </div>
                )}

                {/* Badge */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <Badge variant="success">Valid Invitation</Badge>
                </div>

                {/* CTA */}
                <Link href={getRedirectUrl()}>
                  <Button size="lg" className="w-full">
                    <PenSquare className="h-4 w-4" />
                    Write a Review
                  </Button>
                </Link>

                <p className="mt-4 text-xs text-gray-400">
                  This invitation expires on{' '}
                  {new Date(invitation.expiresAt).toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Back link */}
          <div className="text-center mt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
