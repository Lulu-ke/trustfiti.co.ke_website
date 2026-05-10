import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import OTPInput from '@/components/auth/OTPInput';
import { Shield, Smartphone, ArrowLeft, Phone } from 'lucide-react';

export default function VerifyOTPPage() {
  const { status } = useSession();
  const router = useRouter();
  const { phone, sessionToken } = router.query;

  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
    if (!phone && router.isReady) {
      router.replace('/login');
    }
  }, [status, router, phone]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerifyOTP = async (code: string) => {
    setOtpError('');
    const phoneStr = phone as string;

    try {
      const res = await signIn('credentials', {
        phoneNumber: phoneStr,
        otpCode: code,
        sessionToken: sessionToken as string || '',
        redirect: false,
      });

      if (res?.error) {
        setOtpError('Invalid OTP code. Please try again.');
        return;
      }

      toast.success('Phone verified successfully!');
      router.push('/');
    } catch {
      setOtpError('Verification failed. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    setResendTimer(60);
    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      toast.success('New OTP sent to your phone');
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  const formatPhone = () => {
    const p = (phone as string) || '';
    return p;
  };

  if (status === 'loading' || !router.isReady) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-emerald-600" />
      </div>
    );
  }

  if (!phone) return null;

  return (
    <>
      <Head>
        <title>Verify Phone — TrustFiti</title>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Phone
            </h1>
            <p className="text-gray-500 text-sm">
              Enter the 6-digit code sent to your phone
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
            {/* Phone display */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Verifying phone number</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatPhone()}
                </p>
              </div>
            </div>

            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-2">
                <Smartphone className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Enter the code
              </h2>
              <p className="text-sm text-gray-500">
                Check your SMS messages for the verification code
              </p>
            </div>

            <div className="mt-6">
              <OTPInput
                onComplete={handleVerifyOTP}
                onResend={handleResendOTP}
                resendTimer={resendTimer}
                error={otpError}
              />
            </div>

            <Button
              variant="ghost"
              onClick={() => router.push('/login')}
              className="w-full mt-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Button>
          </div>

          {/* Trust badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="h-3.5 w-3.5" />
            <span>Your data is safe and secure</span>
          </div>
        </div>
      </div>
    </>
  );
}
