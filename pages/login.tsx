import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import PhoneInput from '@/components/auth/PhoneInput';
import OTPInput from '@/components/auth/OTPInput';
import { Shield, Phone, Smartphone, ArrowRight } from 'lucide-react';

type View = 'phone' | 'otp';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [view, setView] = useState<View>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [sessionId, setSessionId] = useState('');

  React.useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = (router.query.callbackUrl as string) || '/';
      router.replace(callbackUrl);
    }
  }, [status, router]);

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const startResendTimer = () => {
    setResendTimer(60);
  };

  const validatePhone = (): boolean => {
    const digits = phoneNumber.replace(/\s/g, '');
    if (!digits) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (digits.length !== 9) {
      setPhoneError('Please enter a valid 9-digit phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSendOTP = async () => {
    if (!validatePhone()) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: `+254${phoneNumber.replace(/\s/g, '')}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send OTP');
      }

      const data = await res.json();
      setSessionId(data.sessionId || '');
      setView('otp');
      startResendTimer();
      toast.success('OTP sent to your phone');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    setOtpError('');
    try {
      const res = await signIn('credentials', {
        phoneNumber: `+254${phoneNumber.replace(/\s/g, '')}`,
        otpCode: code,
        sessionToken: sessionId,
        redirect: false,
      });

      if (res?.error) {
        setOtpError('Invalid OTP code. Please try again.');
        return;
      }

      toast.success('Welcome to TrustFiti!');
      const callbackUrl = (router.query.callbackUrl as string) || '/';
      router.push(callbackUrl);
    } catch {
      setOtpError('Verification failed. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    startResendTimer();
    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: `+254${phoneNumber.replace(/\s/g, '')}`,
        }),
      });
      toast.success('New OTP sent to your phone');
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  const formatDisplayPhone = () => {
    const digits = phoneNumber.replace(/\s/g, '');
    return `+254 ${digits}`;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sign In — TrustFiti</title>
        <meta
          name="description"
          content="Sign in to TrustFiti to write reviews and manage your account."
        />
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
              Welcome to TrustFiti
            </h1>
            <p className="text-gray-500 text-sm">
              Sign in to share reviews and join the community
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
            {view === 'phone' ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Enter your phone number
                    </h2>
                    <p className="text-sm text-gray-500">
                      We&apos;ll send you a verification code
                    </p>
                  </div>
                </div>

                <PhoneInput
                  value={phoneNumber}
                  onChange={(v) => {
                    setPhoneNumber(v);
                    setPhoneError('');
                  }}
                  error={phoneError}
                />

                <Button
                  onClick={handleSendOTP}
                  loading={isSending}
                  className="w-full mt-6"
                  size="lg"
                >
                  Send Verification Code
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Enter verification code
                    </h2>
                    <p className="text-sm text-gray-500">
                      Sent to {formatDisplayPhone()}
                    </p>
                  </div>
                </div>

                <OTPInput
                  onComplete={handleVerifyOTP}
                  onResend={handleResendOTP}
                  resendTimer={resendTimer}
                  error={otpError}
                />

                <Button
                  variant="outline"
                  onClick={() => {
                    setView('phone');
                    setOtpError('');
                  }}
                  className="w-full mt-6"
                >
                  Change phone number
                </Button>
              </div>
            )}
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
