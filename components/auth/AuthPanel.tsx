import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import PhoneInput from '@/components/auth/PhoneInput';
import OTPInput from '@/components/auth/OTPInput';
import { Phone, Smartphone, Shield, ArrowLeft, X, Mail, Eye, EyeOff, User } from 'lucide-react';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

type View = 'phone' | 'otp' | 'email';

interface AuthPanelProps {
  onSuccess: (userData: { id: string; fullName: string | null; phone: string }) => void;
  onCancel?: () => void;
  variant?: 'modal' | 'inline';
  title?: string;
  subtitle?: string;
}

export default function AuthPanel({
  onSuccess,
  onCancel,
  variant = 'inline',
  title = 'Verify to publish',
  subtitle = 'Enter your phone number to verify your identity and publish your review',
}: AuthPanelProps) {
  const [view, setView] = useState<View>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpToken, setOtpToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Email state
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailFullName, setEmailFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailPasswordError, setEmailPasswordError] = useState('');
  const [emailFullNameError, setEmailFullNameError] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [emailMode, setEmailMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const startResendTimer = () => setResendTimer(60);

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
      setOtpToken(data.data?.token || '');
      setView('otp');
      startResendTimer();
    } catch (err) {
      setPhoneError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = useCallback(async (code: string) => {
    setOtpError('');
    setIsVerifying(true);
    try {
      // Use verify-otp API directly
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: `+254${phoneNumber.replace(/\s/g, '')}`,
          code,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setOtpError(data.error || 'Invalid OTP code');
        setIsVerifying(false);
        return;
      }

      const data = await res.json();
      const user = data.data?.user;

      // Sign in via NextAuth credentials
      const signInRes = await fetch('/api/auth/[...nextauth]', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: `+254${phoneNumber.replace(/\s/g, '')}`,
          otpCode: code,
          sessionToken: data.data?.token || otpToken,
          callbackUrl: '/reviews/write',
        }),
      });

      if (signInRes.ok) {
        const signInData = await signInRes.json();
        if (signInData.url) {
          window.location.href = signInData.url;
          return;
        }
      }

      // Fallback: trigger NextAuth signIn client-side
      const { signIn: nextAuthSignIn } = await import('next-auth/react');
      const result = await nextAuthSignIn('phone', {
        phoneNumber: `+254${phoneNumber.replace(/\s/g, '')}`,
        otpCode: code,
        sessionToken: data.data?.token || otpToken,
        redirect: false,
      });

      if (result?.error) {
        setOtpError('Verification failed. Please try again.');
        setIsVerifying(false);
        return;
      }

      // Auth successful — call back
      onSuccess({
        id: user?.id || '',
        fullName: user?.fullName || null,
        phone: `+254${phoneNumber.replace(/\s/g, '')}`,
      });
    } catch {
      setOtpError('Verification failed. Please try again.');
      setIsVerifying(false);
    }
  }, [phoneNumber, otpToken, onSuccess]);

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
    } catch {
      // Silently fail — timer already started
    }
  };

  const formatDisplayPhone = () => {
    const digits = phoneNumber.replace(/\s/g, '');
    return `+254 ${digits}`;
  };

  // ─── Google sign in ─────────────────────────────────
  const handleGoogleSignIn = async () => {
    const result = await signIn('google', { redirect: false });
    if (result?.error) {
      toast.error('Google sign-in failed. Please try again.');
    } else if (result?.ok) {
      window.location.reload();
    }
  };

  // ─── Email validation ───────────────────────────────
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

        // Now sign in
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

        onSuccess({
          id: data.data?.user?.id || '',
          fullName: emailFullName.trim(),
          phone: '',
        });
        return;
      }

      // Login
      const result = await signIn('email', {
        email: email.trim(),
        password: emailPassword,
        action: 'login',
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
        setIsSubmittingEmail(false);
        return;
      }

      onSuccess({
        id: '',
        fullName: null,
        phone: '',
      });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  // ─── Shared content ────────────────────────────────
  const authContent = (
    <div>
      {/* Phone OTP section */}
      {view === 'phone' && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent)', opacity: 0.1 }}
            >
              <Phone className="h-4 w-4" style={{ color: 'var(--accent)' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Enter your phone number
            </span>
          </div>
          <PhoneInput
            value={phoneNumber}
            onChange={(v) => { setPhoneNumber(v); setPhoneError(''); }}
            error={phoneError}
            placeholder="712 345 678"
          />
          <Button
            onClick={handleSendOTP}
            loading={isSending}
            className="w-full mt-4"
            size="lg"
          >
            Send Verification Code
          </Button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span
                className="px-3"
                style={{ background: 'var(--teal-50)', color: 'var(--text-muted)' }}
              >
                Or continue with
              </span>
            </div>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:shadow-sm"
            style={{
              borderColor: 'var(--border-md)',
              color: 'var(--text-primary)',
              background: 'var(--surface)',
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Email button */}
          <button
            onClick={() => { setView('email'); setPhoneError(''); }}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors mt-3 hover:shadow-sm"
            style={{
              borderColor: 'var(--border-md)',
              color: 'var(--text-primary)',
              background: 'var(--surface)',
            }}
          >
            <Mail className="h-4 w-4" style={{ color: 'var(--accent)' }} />
            Continue with Email
          </button>
        </div>
      )}

      {/* OTP verification section */}
      {view === 'otp' && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2.5 mb-4">
            <button
              onClick={() => { setView('phone'); setOtpError(''); }}
              className="p-1 rounded-md hover:bg-white/60 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent)', opacity: 0.1 }}
            >
              <Smartphone className="h-4 w-4" style={{ color: 'var(--accent)' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Enter code sent to {formatDisplayPhone()}
            </span>
          </div>
          <OTPInput
            onComplete={handleVerifyOTP}
            onResend={handleResendOTP}
            resendTimer={resendTimer}
            error={otpError}
            disabled={isVerifying}
          />
          {isVerifying && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-[var(--accent)]" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
              Verifying...
            </div>
          )}
        </div>
      )}

      {/* Email auth section */}
      {view === 'email' && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2.5 mb-4">
            <button
              onClick={() => { setView('phone'); setEmailError(''); setEmailPasswordError(''); setEmailFullNameError(''); }}
              className="p-1 rounded-md hover:bg-white/60 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent)', opacity: 0.1 }}
            >
              <Mail className="h-4 w-4" style={{ color: 'var(--accent)' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {emailMode === 'login' ? 'Sign in with email' : 'Create your account'}
            </span>
          </div>

          <div className="space-y-3">
            {/* Full Name (register only) */}
            {emailMode === 'register' && (
              <div>
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
                  <span className="pl-3" style={{ color: 'var(--text-muted)' }}>
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={emailFullName}
                    onChange={(e) => { setEmailFullName(e.target.value); setEmailFullNameError(''); }}
                    placeholder="Full Name"
                    className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
                {emailFullNameError && (
                  <p className="mt-1 text-xs text-red-600">{emailFullNameError}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
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
                <span className="pl-3" style={{ color: 'var(--text-muted)' }}>
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  placeholder="you@example.com"
                  className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              {emailError && (
                <p className="mt-1 text-xs text-red-600">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div>
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
                <span className="pl-3" style={{ color: 'var(--text-muted)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={emailPassword}
                  onChange={(e) => { setEmailPassword(e.target.value); setEmailPasswordError(''); }}
                  placeholder={emailMode === 'register' ? 'Min. 8 characters' : 'Password'}
                  className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-3 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {emailPasswordError && (
                <p className="mt-1 text-xs text-red-600">{emailPasswordError}</p>
              )}
            </div>
          </div>

          <Button
            onClick={handleEmailSubmit}
            loading={isSubmittingEmail}
            className="w-full mt-4"
            size="lg"
          >
            {emailMode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          {/* Toggle mode */}
          <p
            className="text-xs text-center mt-3"
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

      <p className="mt-4 text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
        <Shield className="h-3 w-3" />
        Your information is secure and private
      </p>
    </div>
  );

  // Modal wrapper
  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 animate-scale-in">
          {onCancel && (
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          {authContent}
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div
      className="border rounded-[var(--radius-lg)] p-6 animate-fade-in"
      style={{
        borderColor: 'var(--accent)',
        background: 'var(--teal-50)',
      }}
    >
      <div className="flex items-start gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-white/60 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {authContent}
    </div>
  );
}
