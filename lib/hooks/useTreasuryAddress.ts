'use client';

import { useState, useEffect } from 'react';

/**
 * Fetches the treasury (deployer) address from the server.
 * The treasury is "Acme Inc." in the demo — all mints and transfers
 * go through this address.
 */
export function useTreasuryAddress() {
  const [address, setAddress] = useState<`0x${string}` | undefined>();

  useEffect(() => {
    fetch('/api/treasury')
      .then((res) => res.json())
      .then((data) => {
        if (data.address) {
          setAddress(data.address as `0x${string}`);
        }
      })
      .catch(() => {});
  }, []);

  return address;
}
