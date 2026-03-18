'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { formatUnits } from 'viem';
import { useBalanceOf } from './useBalanceOf';

const ANNUAL_INTEREST_RATE = 320; // 3.20% APY = US Treasury (4.20%) minus 100bp spread
const BASIS_POINTS = 10000;
const SECONDS_IN_YEAR = 31536000;
const DECIMAL_PLACES = 8;
const THROTTLE_MS = 200; // ~5fps — slow enough for each digit change to be readable

/**
 * Returns a smoothly ticking balance that interpolates between on-chain reads.
 * Uses requestAnimationFrame for smooth rendering, throttled to ~12fps
 * to avoid excessive React re-renders while keeping the tick visually fluid.
 */
export function useTickingBalance(address: `0x${string}` | undefined) {
  const { rawBalance, formattedBalance, isLoading, isError, error, refetch } =
    useBalanceOf(address);

  const [displayBalance, setDisplayBalance] = useState<string | undefined>(
    undefined
  );

  // Track the last on-chain snapshot
  const snapshotRef = useRef<{
    balance: number;
    timestamp: number;
  } | null>(null);

  const rafRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // When on-chain balance updates, capture a new snapshot
  useEffect(() => {
    if (rawBalance === undefined) {
      snapshotRef.current = null;
      setDisplayBalance(undefined);
      return;
    }

    const balanceNum = parseFloat(formatUnits(rawBalance, 18));
    snapshotRef.current = {
      balance: balanceNum,
      timestamp: Date.now(),
    };
    setDisplayBalance(balanceNum.toFixed(DECIMAL_PLACES));
  }, [rawBalance]);

  // Interpolation loop using requestAnimationFrame
  const tick = useCallback((now: number) => {
    const snapshot = snapshotRef.current;
    if (!snapshot || snapshot.balance === 0) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // Throttle state updates to avoid excessive renders
    if (now - lastUpdateRef.current >= THROTTLE_MS) {
      lastUpdateRef.current = now;

      const elapsedMs = Date.now() - snapshot.timestamp;
      const elapsedSeconds = elapsedMs / 1000;

      const growthFactor =
        1 +
        (ANNUAL_INTEREST_RATE * elapsedSeconds) /
          (BASIS_POINTS * SECONDS_IN_YEAR);

      const interpolated = snapshot.balance * growthFactor;
      setDisplayBalance(interpolated.toFixed(DECIMAL_PLACES));
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Start/stop the animation loop
  useEffect(() => {
    if (rawBalance === undefined || rawBalance === BigInt(0)) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [rawBalance, tick]);

  return {
    /** Formatted ticking balance string (8 decimal places) */
    displayBalance,
    /** Raw on-chain balance (bigint, updates every 10s) */
    rawBalance,
    /** Formatted on-chain balance (no interpolation) */
    formattedBalance,
    /** Numeric ticking balance for calculations */
    numericBalance: displayBalance ? parseFloat(displayBalance) : undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}
