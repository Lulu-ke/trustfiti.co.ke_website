import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Search, Star, Shield, ArrowLeft } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <>
      <Head>
        <title>How It Works — TrustFiti</title>
        <meta name="description" content="Learn how TrustFiti works — find, review, and share your experiences with businesses in Kenya." />
      </Head>
      <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h1>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">Find a Company</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Search for the business you want to review in our extensive directory of Kenyan companies.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">Write a Review</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Share your honest experience by rating and writing about the products or services you received.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">Help Others Decide</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Your review helps other consumers make informed decisions and encourages businesses to improve.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
