import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact Us — TrustFiti</title>
        <meta name="description" content="Get in touch with the TrustFiti team." />
      </Head>
      <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Have a question or feedback? We&apos;d love to hear from you.</p>
              <p className="text-gray-500 text-sm mb-6">
                Contact us at <span className="font-medium text-emerald-600">support@trustfiti.co.ke</span>
              </p>
              <p className="text-gray-400 text-sm">
                Our contact form and more options are coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
