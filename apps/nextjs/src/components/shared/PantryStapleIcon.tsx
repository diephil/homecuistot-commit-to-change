/**
 * Component: Pantry Staple Icon
 * Feature: 021-unrecognized-items-display
 * FR-011: Display infinity symbol for pantry staples (replaces star icon)
 *
 * Reusable wrapper component per user instruction (components/shared/)
 * Vibrant neobrutalism styling per Constitution Principle VII
 */

import { Infinity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PantryStapleIconProps {
  className?: string;
}

/**
 * Infinity icon wrapper for pantry staple items
 * Symbolizes "always available" food items
 *
 * Design system:
 * - Yellow background (brand color for pantry staples)
 * - Thick borders: 3px mobile, 4px desktop
 * - Box shadow with no blur
 * - Playful rotation on desktop only (mobile-first responsive)
 * - Thick stroke for icon visibility
 */
export function PantryStapleIcon({ className }: PantryStapleIconProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        'bg-yellow-400 border-3 md:border-4 border-black',
        'w-8 h-8 md:w-10 md:h-10',
        'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
        'md:transform md:-rotate-6', // Rotation only on desktop
        className
      )}
      aria-label="Pantry staple"
    >
      <Infinity className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
    </div>
  );
}
