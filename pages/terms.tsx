import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service — TrustFiti</title>
        <meta name="description" content="TrustFiti Terms of Service." />
      </Head>
      <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600 leading-relaxed">
              Welcome to TrustFiti. These Terms of Service govern your use of our platform. By accessing or using TrustFiti,
              you agree to be bound by these terms.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Full terms of service will be published here soon. In the meantime, please use the platform responsibly
              and write honest, factual reviews.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
