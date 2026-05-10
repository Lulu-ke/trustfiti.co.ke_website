import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import PhoneInput from '@/components/auth/PhoneInput';
import OTPInput from '@/components/auth/OTPInput';
import { cn } from '@/lib/utils';
import {
  Shield,
  Phone,
  Smartphone,
  ArrowRight,
  Mail,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';

type AuthTab = 'phone' | 'email' | 'google';
type PhoneView = 'phone' | 'otp';
type EmailMode = 'login' | 'register';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<AuthTab>('phone');

  // Phone OTP state
  const [phoneView, setPhoneView] = useState<PhoneView>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [sessionId, setSessionId] = useState('');

  // Email state
  const [emailMode, setEmailMode] = useState<EmailMode>('login');
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailFullName, setEmailFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailPasswordError, setEmailPasswordError] = useState('');
  const [emailFullNameError, setEmailFullNameError] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = (router.query.callbackUrl as string) || '/';
      router.replace(callbackUrl);
    }
  }, [status, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const startResendTimer = () => {
    setResendTimer(60);
  };

  // ─── Phone OTP handlers ─────────────────────────────────
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
      setSessionId(data.data?.token || data.sessionId || '');
      setPhoneView('otp');
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
      const res = await signIn('phone', {
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

  // ─── Email auth handlers ────────────────────────────────
  const validateEmailForm = (): boolean => {
    let valid = true;

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!emailPassword) {
      setEmailPasswordError('Password is required');
      valid = false;
    } else if (emailPassword.length < 8) {
      setEmailPasswordError('Password must be at least 8 characters');
      valid = false;
    } else {
      setEmailPasswordError('');
    }

    if (emailMode === 'register') {
      if (!emailFullName.trim()) {
        setEmailFullNameError('Full name is required');
        valid = false;
      } else {
        setEmailFullNameError('');
      }
    }

    return valid;
  };

  const handleEmailSubmit = async () => {
    if (!validateEmailForm()) return;
    setIsSubmittingEmail(true);

    try {
      if (emailMode === 'register') {
        // Register via API first
        const res = await fetch('/api/auth/email-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password: emailPassword,
            fullName: emailFullName.trim(),
            action: 'register',
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || data.error || 'Registration failed');
          setIsSubmittingEmail(false);
          return;
        }

        toast.success('Account created! Signing you in...');

        // Now sign in via NextAuth
        const signInRes = await signIn('email', {
          email: email.trim(),
          password: emailPassword,
          action: 'login',
          redirect: false,
        });

        if (signInRes?.error) {
          toast.error('Account created but sign-in failed. Please try logging in.');
          setEmailMode('login');
          setIsSubmittingEmail(false);
          return;
        }

        toast.success('Welcome to TrustFiti!');
        const callbackUrl = (router.query.callbackUrl as string) || '/';
        router.push(callbackUrl);
      } else {
        // Login directly via NextAuth
        const res = await signIn('email', {
          email: email.trim(),
          password: emailPassword,
          action: 'login',
          redirect: false,
        });

        if (res?.error) {
          toast.error('Invalid email or password');
          setIsSubmittingEmail(false);
          return;
        }

        toast.success('Welcome back!');
        const callbackUrl = (router.query.callbackUrl as string) || '/';
        router.push(callbackUrl);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  // ─── Google OAuth handler ──────────────────────────────
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: (router.query.callbackUrl as string) || '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[var(--accent)]" />
      </div>
    );
  }

  const tabs: { key: AuthTab; label: string; icon: React.ReactNode }[] = [
    { key: 'phone', label: 'Phone', icon: <Phone className="h-4 w-4" /> },
    { key: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { key: 'google', label: 'Google', icon: null },
  ];

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
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent)' }}
              >
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-head)', color: 'var(--text-primary)' }}
              >
                Trust<span style={{ color: 'var(--accent)' }}>Fiti</span>
              </span>
            </div>
            <h1
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-head)', color: 'var(--text-primary)' }}
            >
              Welcome to TrustFiti
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign in to share reviews and join the community
            </p>
          </div>

          {/* Form Card */}
          <div
            className="rounded-[var(--radius-lg)] p-6 sm:p-8 animate-fade-in"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Tabs */}
            <div
              className="flex border-b mb-6"
              style={{ borderColor: 'var(--border)' }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors relative',
                  )}
                  style={{
                    color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.key && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ── Phone Tab ──────────────────────────────── */}
            {activeTab === 'phone' && (
              <div className="animate-fade-in">
                {phoneView === 'phone' ? (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-full"
                        style={{ background: 'var(--teal-50)', color: 'var(--accent)' }}
                      >
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <h2
                          className="text-lg font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Enter your phone number
                        </h2>
                        <p
                          className="text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
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
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-full"
                        style={{ background: 'var(--teal-50)', color: 'var(--accent)' }}
                      >
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <h2
                          className="text-lg font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Enter verification code
                        </h2>
                        <p
                          className="text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
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
                        setPhoneView('phone');
                        setOtpError('');
                      }}
                      className="w-full mt-6"
                    >
                      Change phone number
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ── Email Tab ──────────────────────────────── */}
            {activeTab === 'email' && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full"
                    style={{ background: 'var(--teal-50)', color: 'var(--accent)' }}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h2
                      className="text-lg font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {emailMode === 'login' ? 'Sign in with email' : 'Create your account'}
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {emailMode === 'login'
                        ? 'Enter your credentials to continue'
                        : 'Join TrustFiti to share your reviews'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Full Name (register only) */}
                  {emailMode === 'register' && (
                    <div>
                      <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Full Name
                      </label>
                      <div
                        className={cn(
                          'flex items-center rounded-lg border overflow-hidden transition-colors',
                          'focus-within:ring-2 focus-within:ring-offset-0',
                          emailFullNameError
                            ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-200'
                            : 'focus-within:border-[var(--accent)] focus-within:ring-[var(--accent)]/20',
                        )}
                        style={{ borderColor: emailFullNameError ? undefined : 'var(--border-md)' }}
                      >
                        <span className="pl-3 text-[var(--text-muted)]">
                          <User className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          value={emailFullName}
                          onChange={(e) => {
                            setEmailFullName(e.target.value);
                            setEmailFullNameError('');
                          }}
                          placeholder="John Doe"
                          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none"
                          style={{ color: 'var(--text-primary)' }}
                        />
                      </div>
                      {emailFullNameError && (
                        <p className="mt-1.5 text-sm text-red-600">{emailFullNameError}</p>
                      )}
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Email Address
                    </label>
                    <div
                      className={cn(
                        'flex items-center rounded-lg border overflow-hidden transition-colors',
                        'focus-within:ring-2 focus-within:ring-offset-0',
                        emailError
                          ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-200'
                          : 'focus-within:border-[var(--accent)] focus-within:ring-[var(--accent)]/20',
                      )}
                      style={{ borderColor: emailError ? undefined : 'var(--border-md)' }}
                    >
                      <span className="pl-3 text-[var(--text-muted)]">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError('');
                        }}
                        placeholder="you@example.com"
                        className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none"
                        style={{ color: 'var(--text-primary)' }}
                      />
                    </div>
                    {emailError && (
                      <p className="mt-1.5 text-sm text-red-600">{emailError}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Password
                    </label>
                    <div
                      className={cn(
                        'flex items-center rounded-lg border overflow-hidden transition-colors',
                        'focus-within:ring-2 focus-within:ring-offset-0',
                        emailPasswordError
                          ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-200'
                          : 'focus-within:border-[var(--accent)] focus-within:ring-[var(--accent)]/20',
                      )}
                      style={{ borderColor: emailPasswordError ? undefined : 'var(--border-md)' }}
                    >
                      <span className="pl-3 text-[var(--text-muted)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={emailPassword}
                        onChange={(e) => {
                          setEmailPassword(e.target.value);
                          setEmailPasswordError('');
                        }}
                        placeholder={emailMode === 'register' ? 'Min. 8 characters' : 'Enter your password'}
                        className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none"
                        style={{ color: 'var(--text-primary)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="pr-3 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {emailPasswordError && (
                      <p className="mt-1.5 text-sm text-red-600">{emailPasswordError}</p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleEmailSubmit}
                  loading={isSubmittingEmail}
                  className="w-full mt-6"
                  size="lg"
                >
                  {emailMode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-4 w-4" />
                </Button>

                {/* Toggle mode */}
                <p
                  className="text-sm text-center mt-4"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {emailMode === 'login' ? (
                    <>
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setEmailMode('register')}
                        className="font-medium hover:underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        Create one
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setEmailMode('login')}
                        className="font-medium hover:underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </div>
            )}

            {/* ── Google Tab ─────────────────────────────── */}
            {activeTab === 'google' && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full"
                    style={{ background: 'var(--teal-50)', color: 'var(--accent)' }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2
                      className="text-lg font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Continue with Google
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Use your Google account to sign in quickly
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-all hover:shadow-sm"
                  style={{
                    borderColor: 'var(--border-md)',
                    color: 'var(--text-primary)',
                    background: 'var(--surface)',
                  }}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>

                <p
                  className="text-xs text-center mt-4"
                  style={{ color: 'var(--text-muted)' }}
                >
                  By signing in with Google, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            )}
          </div>

          {/* Trust badge */}
          <div
            className="mt-6 flex items-center justify-center gap-2 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Your data is safe and secure</span>
          </div>
        </div>
      </div>
    </>
  );
}
