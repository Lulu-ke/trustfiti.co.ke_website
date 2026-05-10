import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us — TrustFiti</title>
        <meta name="description" content="Learn about TrustFiti, Kenya's trusted review platform for businesses." />
      </Head>
      <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">About TrustFiti</h1>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed">
                TrustFiti is Kenya&apos;s trusted platform for genuine business reviews. Our mission is to help
                consumers make informed decisions by providing a transparent space for sharing real experiences
                with businesses across Kenya.
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                We believe in the power of honest feedback to drive quality and accountability in the marketplace.
                Whether you&apos;re reviewing a restaurant, a bank, or an online store, your voice matters.
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                More content coming soon. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
