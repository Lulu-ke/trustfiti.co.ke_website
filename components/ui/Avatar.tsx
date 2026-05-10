import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
};

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-violet-500',
    'bg-pink-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className,
}: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn(
          'rounded-full object-cover',
          sizeStyles[size],
          className
        )}
      />
    );
  }

  const initials = getInitials(name);
  const bgColor = name ? getColorFromName(name) : 'bg-gray-400';

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white',
        sizeStyles[size],
        bgColor,
        className
      )}
      title={name || undefined}
      role="img"
      aria-label={name || 'User avatar'}
    >
      {initials}
    </div>
  );
}
