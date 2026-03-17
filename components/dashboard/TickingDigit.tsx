'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface TickingDigitProps {
  digit: string;
  className?: string;
}

/**
 * Animates a single character with a vertical slide transition when it changes.
 * Each digit independently slides upward (old exits up, new enters from below).
 */
export default function TickingDigit({ digit, className = '' }: TickingDigitProps) {
  return (
    <span className={`relative inline-block overflow-hidden ${className}`} style={{ width: digit === ',' ? '0.35em' : '0.65em' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          }}
          className="inline-block"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
