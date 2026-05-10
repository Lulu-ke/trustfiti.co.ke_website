import React from 'react';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
}

export default function PhoneInput({
  value,
  onChange,
  error,
  label = 'Phone Number',
  disabled = false,
  placeholder = '712 345 678',
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^\d\s]/g, '');
    const digits = input.replace(/\s/g, '');
    if (digits.length > 9) {
      input = digits.substring(0, 9).replace(/(\d{3})(\d{3})(\d{0,3})/, '$1 $2 $3').trim();
    } else {
      input = input.replace(/(\d{3})(\d{0,3})/, '$1 $2').trim();
    }
    onChange(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && value.endsWith(' ')) {
      e.preventDefault();
      onChange(value.trimEnd());
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center rounded-lg border overflow-hidden transition-colors duration-150',
          'focus-within:ring-2 focus-within:ring-offset-0',
          error
            ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-200'
            : 'border-gray-300 focus-within:border-emerald-500 focus-within:ring-emerald-200',
          disabled && 'bg-gray-50 opacity-60'
        )}
      >
        <span className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-r border-gray-300 text-sm text-gray-700 font-medium select-none">
          <span className="text-base">🇰🇪</span>
          +254
        </span>
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none"
          maxLength={12}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
