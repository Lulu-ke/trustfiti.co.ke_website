import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Layout from '@/components/layout/Layout';
import {
  Globe,
  Shield,
  FileCode,
  Server,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Step = 'search' | 'details' | 'verify';

interface CompanyResult {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  city?: string;
  website?: string;
  averageRating: number;
  totalReviews: number;
  isClaimed: boolean;
}

export default function ClaimBusinessPage() {
  const router = useRouter();
  const { companyId } = router.query;
  const { data: session, status } = useSession();

  const [step, setStep] = useState<Step>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CompanyResult[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResult | null>(null);
  const [method, setMethod] = useState<'DNS_TXT' | 'META_TAG' | 'HTML_FILE'>('DNS_TXT');
  const [domain, setDomain] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [claimStatus, setClaimStatus] = useState<any>(null);

  // If companyId is in URL, skip to details
  React.useEffect(() => {
    if (companyId && typeof companyId === 'string') {
      fetchCompanyById(companyId);
    }
  }, [companyId]);

  const fetchCompanyById = async (id: string) => {
    try {
      const res = await fetch(`/api/companies/${id}`);
      if (res.ok) {
        const company = await res.json();
        if (!company.isClaimed) {
          setSelectedCompany(company);
          setDomain(company.website || '');
          setStep('details');
        }
      }
    } catch {}
  };

  if (status === 'loading') return <LoadingSpinner />;

  // Redirect to login if not authenticated
  if (!session) {
    router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
    return null;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(`/api/companies?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await res.json();
      const unclaimed = (data.companies || []).filter((c: CompanyResult) => !c.isClaimed);
      setSearchResults(unclaimed);
    } catch {
      toast.error('Failed to search companies');
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          domain,
          method,
          contactName,
          contactEmail,
          contactPhone,
          additionalInfo,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setClaimId(data.data.claimId);
        // Fetch claim status/instructions
        const claimRes = await fetch(`/api/claim/${data.data.claimId}`);
        const claimData = await claimRes.json();
        if (claimData.success) {
          setClaimStatus(claimData.data);
        }
        setStep('verify');
        toast.success('Claim submitted! Follow the instructions to verify.');
      } else {
        toast.error(data.message || 'Failed to submit claim');
      }
    } catch {
      toast.error('Failed to submit claim request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!claimId) return;
    setVerifying(true);
    try {
      const res = await fetch(`/api/claim/${claimId}`, { method: 'POST' });
      const data = await res.json();

      if (data.success && data.data?.verified) {
        setClaimStatus((prev: any) => ({ ...prev, status: 'VERIFIED' }));
        toast.success('Verified! You are now the owner of this business.');
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch {
      toast.error('Verification request failed');
    } finally {
      setVerifying(false);
    }
  };

  const methodConfig = {
    DNS_TXT: { icon: Server, label: 'DNS TXT Record', desc: 'Add a TXT record to your domain DNS settings' },
    META_TAG: { icon: FileCode, label: 'HTML Meta Tag', desc: 'Add a meta tag to your website homepage' },
    HTML_FILE: { icon: Globe, label: 'HTML File Upload', desc: 'Upload a verification file to your website root' },
  };

  const statusIcon = claimStatus?.status === 'VERIFIED'
    ? CheckCircle
    : claimStatus?.status === 'EXPIRED' || claimStatus?.status === 'REJECTED'
    ? XCircle
    : Clock;

  const StatusIcon = statusIcon;

  return (
    <Layout>
      <Head>
        <title>Claim Your Business — TrustFiti</title>
        <meta name="description" content="Claim your business page on TrustFiti and manage your reviews, respond to customers, and build trust." />
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => step === 'verify' ? setStep('details') : step === 'details' ? setStep('search') : router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 'verify' ? 'Back to claim details' : step === 'details' ? 'Back to search' : 'Go back'}
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Claim Your Business</h1>
          <p className="text-gray-600 mt-2">
            Verify domain ownership to claim your business page and manage your reviews.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-8">
          {['Find Business', 'Claim Details', 'Verify Domain'].map((label, i) => {
            const steps: Step[] = ['search', 'details', 'verify'];
            const isActive = steps[i] === step;
            const isDone = steps.indexOf(step) > i;
            return (
              <React.Fragment key={label}>
                {i > 0 && <div className={`flex-1 h-0.5 ${isDone ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isActive ? 'bg-emerald-600 text-white' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isDone ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Step 1: Search */}
        {step === 'search' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <form onSubmit={handleSearch}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for your business
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter business name..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
                <Button type="submit">Search</Button>
              </div>
            </form>

            {searchResults.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-medium text-gray-500">
                  {searchResults.length} unclaimed business{searchResults.length !== 1 ? 'es' : ''} found
                </h3>
                {searchResults.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setSelectedCompany(company);
                      setDomain(company.website || '');
                      setStep('details');
                    }}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{company.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        {company.industry && <span>{company.industry}</span>}
                        {company.city && <span>{company.city}</span>}
                        {company.website && <span className="text-emerald-600">{company.website}</span>}
                      </div>
                    </div>
                    <div className="text-emerald-600">
                      <Globe className="h-5 w-5" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && (
              <div className="mt-6 text-center py-8">
                <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-gray-500">No unclaimed businesses found. If your business isn&apos;t listed, it may have already been claimed or doesn&apos;t exist yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Claim Details */}
        {step === 'details' && selectedCompany && (
          <form onSubmit={handleSubmitClaim} className="space-y-6">
            {/* Selected Company */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm font-medium text-emerald-800">Claiming:</p>
              <p className="text-lg font-bold text-emerald-900">{selectedCompany.name}</p>
              {selectedCompany.website && (
                <p className="text-sm text-emerald-700">{selectedCompany.website}</p>
              )}
            </div>

            {/* Verification Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Choose Verification Method
              </h2>
              <div className="grid gap-3">
                {(Object.entries(methodConfig) as [keyof typeof methodConfig, typeof methodConfig.DNS_TXT][]).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMethod(key)}
                      className={`flex items-start gap-4 p-4 border rounded-lg text-left transition-colors ${
                        method === key
                          ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mt-0.5 ${method === key ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <div>
                        <p className={`font-medium ${method === key ? 'text-emerald-900' : 'text-gray-700'}`}>
                          {config.label}
                        </p>
                        <p className="text-sm text-gray-500">{config.desc}</p>
                      </div>
                      <Shield className={`h-5 w-5 ml-auto ${method === key ? 'text-emerald-600' : 'text-gray-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain to Verify *
                  </label>
                  <input
                    type="url"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="https://example.com"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">The domain you&apos;ll add the verification to</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="john@company.com"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information (optional)
                  </label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={3}
                    placeholder="Any additional details about your claim..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setStep('search')}>Back</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Verify */}
        {step === 'verify' && claimStatus && (
          <div className="space-y-6">
            {/* Status */}
            <div className={`rounded-xl border p-6 ${
              claimStatus.status === 'VERIFIED'
                ? 'bg-emerald-50 border-emerald-200'
                : claimStatus.status === 'EXPIRED' || claimStatus.status === 'REJECTED'
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-3">
                <StatusIcon className={`h-6 w-6 ${
                  claimStatus.status === 'VERIFIED' ? 'text-emerald-600'
                  : claimStatus.status === 'EXPIRED' || claimStatus.status === 'REJECTED'
                  ? 'text-red-500' : 'text-yellow-500'
                }`} />
                <div>
                  <h3 className="font-semibold">
                    {claimStatus.status === 'VERIFIED' ? 'Claim Verified!'
                    : claimStatus.status === 'EXPIRED' ? 'Claim Expired'
                    : claimStatus.status === 'REJECTED' ? 'Claim Rejected'
                    : 'Pending Verification'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {claimStatus.status === 'VERIFIED'
                      ? `You are now the owner of "${claimStatus.company?.name}". Visit the Company Dashboard to manage your business.`
                      : claimStatus.status === 'EXPIRED'
                      ? 'Your claim has expired. Please submit a new claim.'
                      : claimStatus.status === 'REJECTED'
                      ? `Reason: ${claimStatus.rejectionReason || 'Not specified'}`
                      : `Expires: ${new Date(claimStatus.expiresAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Instructions */}
            {claimStatus.status === 'PENDING' && claimStatus.verificationCode && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Verification Instructions — {claimStatus.instructions?.title}
                </h2>
                <p className="text-sm text-gray-500 mb-4">Domain: {claimStatus.domain}</p>

                {/* Verification Code */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">YOUR VERIFICATION CODE</p>
                  <code className="text-lg font-mono font-bold text-gray-900 select-all break-all">
                    {claimStatus.verificationCode}
                  </code>
                </div>

                {/* Steps */}
                <ol className="space-y-3 mb-6">
                  {claimStatus.instructions?.steps.map((instruction: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="whitespace-pre-wrap">{instruction}</span>
                    </li>
                  ))}
                </ol>

                <div className="flex justify-end gap-3">
                  <Button
                    onClick={handleVerify}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Verify Domain
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Verified CTA */}
            {claimStatus.status === 'VERIFIED' && (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">All Set!</h2>
                <p className="text-gray-600 mb-6">
                  Your business is now claimed and verified. Head to the Company Dashboard to manage reviews, respond to customers, and track your reputation.
                </p>
                <Button onClick={() => router.push('https://company.trustfiti.co.ke')}>
                  Go to Company Dashboard
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
