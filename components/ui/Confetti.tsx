'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';

/**
 * Hook that returns a fireConfetti function for celebration moments.
 * Uses canvas-confetti for a burst of color on transfer completion.
 */
export function useConfetti() {
  const fireConfetti = useCallback(() => {
    // First burst — center
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#818cf8', '#34d399', '#ffffff'],
      zIndex: 9999,
    });

    // Second burst — left side, slight delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ['#6366f1', '#10b981', '#818cf8', '#34d399'],
        zIndex: 9999,
      });
    }, 150);

    // Third burst — right side
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ['#6366f1', '#10b981', '#818cf8', '#34d399'],
        zIndex: 9999,
      });
    }, 300);
  }, []);

  return { fireConfetti };
}
