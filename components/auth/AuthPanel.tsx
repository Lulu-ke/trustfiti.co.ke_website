import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import PhoneInput from '@/components/auth/PhoneInput';
import OTPInput from '@/components/auth/OTPInput';
import { Phone, Smartphone, Shield, ArrowLeft, X } from 'lucide-react';

type View = 'phone' | 'otp';

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
      const { signIn } = await import('next-auth/react');
      const result = await signIn('credentials', {
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
          <AuthContent
            view={view}
            title={title}
            subtitle={subtitle}
            phoneNumber={phoneNumber}
            phoneError={phoneError}
            otpError={otpError}
            isSending={isSending}
            isVerifying={isVerifying}
            resendTimer={resendTimer}
            formatDisplayPhone={formatDisplayPhone}
            onPhoneChange={(v) => { setPhoneNumber(v); setPhoneError(''); }}
            onSendOTP={handleSendOTP}
            onVerifyOTP={handleVerifyOTP}
            onResendOTP={handleResendOTP}
            onBack={() => { setView('phone'); setOtpError(''); }}
          />
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className="border border-[var(--accent)] bg-[var(--teal-50)] rounded-[var(--radius-lg)] p-6 animate-fade-in">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-white/60 transition-colors text-[var(--text-muted)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AuthContent
        view={view}
        phoneNumber={phoneNumber}
        phoneError={phoneError}
        otpError={otpError}
        isSending={isSending}
        isVerifying={isVerifying}
        resendTimer={resendTimer}
        formatDisplayPhone={formatDisplayPhone}
        onPhoneChange={(v) => { setPhoneNumber(v); setPhoneError(''); }}
        onSendOTP={handleSendOTP}
        onVerifyOTP={handleVerifyOTP}
        onResendOTP={handleResendOTP}
        onBack={() => { setView('phone'); setOtpError(''); }}
      />
    </div>
  );
}

// --- Internal content component ---
interface AuthContentProps {
  view: View;
  title?: string;
  subtitle?: string;
  phoneNumber: string;
  phoneError: string;
  otpError: string;
  isSending: boolean;
  isVerifying: boolean;
  resendTimer: number;
  formatDisplayPhone: () => string;
  onPhoneChange: (v: string) => void;
  onSendOTP: () => void;
  onVerifyOTP: (code: string) => void;
  onResendOTP: () => void;
  onBack: () => void;
}

function AuthContent({
  view,
  title,
  subtitle,
  phoneNumber,
  phoneError,
  otpError,
  isSending,
  isVerifying,
  resendTimer,
  formatDisplayPhone,
  onPhoneChange,
  onSendOTP,
  onVerifyOTP,
  onResendOTP,
  onBack,
}: AuthContentProps) {
  return (
    <div>
      {view === 'phone' ? (
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
              <Phone className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Enter your phone number
            </span>
          </div>
          <PhoneInput
            value={phoneNumber}
            onChange={onPhoneChange}
            error={phoneError}
            placeholder="712 345 678"
          />
          <Button
            onClick={onSendOTP}
            loading={isSending}
            className="w-full mt-4"
            size="lg"
          >
            Send Verification Code
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <button
              onClick={onBack}
              className="p-1 rounded-md hover:bg-white/60 transition-colors text-[var(--text-muted)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
              <Smartphone className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Enter code sent to {formatDisplayPhone()}
            </span>
          </div>
          <OTPInput
            onComplete={onVerifyOTP}
            onResend={onResendOTP}
            resendTimer={resendTimer}
            error={otpError}
            disabled={isVerifying}
          />
          {isVerifying && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--accent)]/30 border-t-[var(--accent)]" />
              Verifying...
            </div>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-[var(--text-muted)] flex items-center gap-1.5">
        <Shield className="h-3 w-3" />
        Your number is only used for verification. We never share it.
      </p>
    </div>
  );
}
