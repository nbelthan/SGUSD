'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { memo } from 'react';

interface TickingDigitProps {
  digit: string;
  className?: string;
}

/**
 * Animates a single character with a smooth vertical slide when it changes.
 * Uses lightweight tween (no spring physics or blur) for 60fps performance.
 */
const TickingDigit = memo(function TickingDigit({ digit, className = '' }: TickingDigitProps) {
  return (
    <span
      className={`relative inline-block overflow-hidden ${className}`}
      style={{ width: digit === ',' ? '0.35em' : '0.6em' }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: '50%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-50%', opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="inline-block"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
});

export default TickingDigit;
