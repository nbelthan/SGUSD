'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';

/**
 * Hook that returns a fireConfetti function for celebration moments.
 * Uses canvas-confetti for a single burst on demo completion.
 */
export function useConfetti() {
  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#818cf8', '#34d399', '#ffffff'],
      zIndex: 9999,
    });
  }, []);

  return { fireConfetti };
}
