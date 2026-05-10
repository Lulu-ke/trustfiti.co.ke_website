import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

function getStarType(rating: number, index: number): 'full' | 'half' | 'empty' {
  const threshold = index + 1;
  if (rating >= threshold) return 'full';
  if (rating >= threshold - 0.5) return 'half';
  return 'empty';
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number>(0);

  const displayValue = hoverValue || value;

  const handleClick = (index: number) => {
    if (readonly || !onChange) return;
    onChange(index + 1);
  };

  const handleMouseEnter = (index: number) => {
    if (readonly) return;
    setHoverValue(index + 1);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverValue(0);
  };

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={`Rating: ${value} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const starType = getStarType(displayValue, index);
        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            className={cn(
              'relative p-0 transition-transform',
              !readonly && 'cursor-pointer hover:scale-110',
              readonly && 'cursor-default'
            )}
            aria-label={`${index + 1} star${index + 1 > 1 ? 's' : ''}`}
            tabIndex={readonly ? -1 : 0}
          >
            {/* Empty star (background) */}
            <Star
              className={cn(
                sizeMap[size],
                'text-gray-300'
              )}
              fill="currentColor"
            />
            {/* Full or half star overlay */}
            {(starType === 'full' || starType === 'half') && (
              <Star
                className={cn(
                  sizeMap[size],
                  'text-amber-400 absolute top-0 left-0',
                  starType === 'half' && 'clip-path-inset-[0_50%_0_0]'
                )}
                fill="currentColor"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
