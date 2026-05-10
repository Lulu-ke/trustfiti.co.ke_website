import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import ClaimBusinessPage from './[companyId]';
import { Globe, Shield, Search } from 'lucide-react';

export default function ClaimPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const startSearch = router.query.search === 'true';

  if (status === 'loading') return <LoadingSpinner />;

  if (!session) {
    router.push(`/login?callbackUrl=${encodeURIComponent('/claim')}`);
    return null;
  }

  // If ?search=true, render the claim wizard directly
  if (startSearch) {
    return <ClaimBusinessPage />;
  }

  return (
    <>
      <Head>
        <title>Claim Your Business — TrustFiti</title>
        <meta name="description" content="Verify domain ownership to claim your business page on TrustFiti." />
      </Head>

      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 mb-6">
          <Globe className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Claim Your Business Page</h1>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Own a business listed on TrustFiti? Verify your domain ownership to claim your page,
          respond to reviews, and manage your online reputation.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-left">
            <Search className="h-6 w-6 text-emerald-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">1. Find Your Business</h3>
            <p className="text-sm text-gray-500">Search for your business in our directory</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-left">
            <Shield className="h-6 w-6 text-emerald-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">2. Verify Domain</h3>
            <p className="text-sm text-gray-500">Prove ownership via DNS, meta tag, or file upload</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-left">
            <Globe className="h-6 w-6 text-emerald-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">3. Manage Reviews</h3>
            <p className="text-sm text-gray-500">Respond to reviews and build your reputation</p>
          </div>
        </div>

        <Button size="lg" onClick={() => router.push('/claim?search=true')}>
          <Shield className="h-4 w-4" />
          Start Claiming
        </Button>
      </div>
    </>
  );
}
