import React from 'react';
import { useRouter } from 'next/router';
import ClaimPage from '../index';

// /claim/start redirects to the claim flow — reuse the main Claim page
export default function ClaimStartPage() {
  return <ClaimPage />;
}
