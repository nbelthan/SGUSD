'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { formatUnits } from 'viem';
import { useBalanceOf } from './useBalanceOf';

const ANNUAL_INTEREST_RATE = 500;
const BASIS_POINTS = 10000;
const SECONDS_IN_YEAR = 31536000;
const TICK_INTERVAL_MS = 50;
const DECIMAL_PLACES = 8;

/**
 * Returns a smoothly ticking balance that interpolates between on-chain reads.
 * Uses the same linear interest formula as the Sagecoin contract:
 *   balance grows by (balance × 500 / 10000 / 31536000) per second
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

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Interpolation tick — runs every 50ms
  const tick = useCallback(() => {
    const snapshot = snapshotRef.current;
    if (!snapshot || snapshot.balance === 0) return;

    const elapsedMs = Date.now() - snapshot.timestamp;
    const elapsedSeconds = elapsedMs / 1000;

    // Linear interest: balance * (1 + rate * time / (BASIS_POINTS * SECONDS_IN_YEAR))
    const growthFactor =
      1 +
      (ANNUAL_INTEREST_RATE * elapsedSeconds) /
        (BASIS_POINTS * SECONDS_IN_YEAR);

    const interpolated = snapshot.balance * growthFactor;
    setDisplayBalance(interpolated.toFixed(DECIMAL_PLACES));
  }, []);

  // Start/stop the interpolation interval
  useEffect(() => {
    if (rawBalance === undefined || rawBalance === BigInt(0)) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(tick, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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
