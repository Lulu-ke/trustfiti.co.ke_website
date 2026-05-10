import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy — TrustFiti</title>
        <meta name="description" content="TrustFiti Privacy Policy — how we handle your data." />
      </Head>
      <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600 leading-relaxed">
              At TrustFiti, we take your privacy seriously. This policy describes how we collect, use, and protect
              your personal information when you use our platform.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Full privacy policy details will be published here soon. We are committed to protecting your data
              and being transparent about our practices.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
