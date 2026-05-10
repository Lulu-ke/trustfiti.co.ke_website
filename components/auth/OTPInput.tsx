import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  onComplete: (code: string) => void;
  onResend?: () => void;
  resendTimer?: number;
  error?: string;
  disabled?: boolean;
}

export default function OTPInput({
  onComplete,
  onResend,
  resendTimer = 0,
  error,
  disabled = false,
}: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInput = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const digit = e.target.value.replace(/\D/g, '');
      if (digit.length > 1) {
        const digits = digit.split('').slice(0, 6);
        const newValues = [...Array(6).fill('')];
        digits.forEach((d, i) => {
          if (index + i < 6) newValues[index + i] = d;
        });
        setValues(newValues);
        const nextEmpty = index + digits.length;
        if (nextEmpty < 6) {
          inputRefs.current[nextEmpty]?.focus();
        }
        if (newValues.every((v) => v !== '')) {
          onComplete(newValues.join(''));
        }
        return;
      }

      const newValues = [...values];
      newValues[index] = digit;
      setValues(newValues);

      if (digit && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      if (newValues.every((v) => v !== '')) {
        onComplete(newValues.join(''));
      }
    },
    [values, onComplete]
  );

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        const newValues = [...values];
        newValues[index - 1] = '';
        setValues(newValues);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newValues = [...values];
        newValues[index] = '';
        setValues(newValues);
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newValues = [...Array(6).fill('')];
      pasted.split('').forEach((d, i) => {
        newValues[i] = d;
      });
      setValues(newValues);
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
      if (newValues.every((v) => v !== '')) {
        onComplete(newValues.join(''));
      }
    }
  };

  const canResend = resendTimer <= 0 && !!onResend;

  return (
    <div className="w-full">
      <div className="flex justify-center gap-2 sm:gap-3">
        {values.map((value, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={value}
            onChange={(e) => handleInput(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              'w-11 h-14 text-center text-xl font-semibold rounded-lg border transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:bg-gray-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
            )}
          />
        ))}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}

      {onResend && (
        <div className="mt-4 text-center text-sm text-gray-500">
          {resendTimer > 0 ? (
            <span>
              Resend code in{' '}
              <span className="font-medium text-gray-700">{resendTimer}s</span>
            </span>
          ) : (
            <button
              onClick={onResend}
              disabled={!canResend}
              className={cn(
                'font-medium transition-colors',
                canResend
                  ? 'text-emerald-600 hover:text-emerald-700'
                  : 'text-gray-400 cursor-not-allowed'
              )}
            >
              Resend OTP
            </button>
          )}
        </div>
      )}
    </div>
  );
}
