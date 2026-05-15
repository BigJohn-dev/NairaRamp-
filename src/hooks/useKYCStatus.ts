import { useState, useEffect, useCallback } from 'react';
import { useNairaRamp } from '../NairaRampProvider';
import { checkKYCStatus } from '../stellar';

export type KYCStatus = 'approved' | 'pending' | 'rejected' | 'none';

export interface KYCStatusResult {
  status: KYCStatus;
  message?: string;
}

interface UseKYCStatusResult {
  kycStatus: KYCStatusResult | null;
  isApproved: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

/** Check KYC approval status for a user with a specific anchor. */
export function useKYCStatus(
  anchorDomain: string,
  email: string
): UseKYCStatusResult {
  const { apiKey } = useNairaRamp();
  const [kycStatus, setKycStatus] = useState<KYCStatusResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!anchorDomain || !email) return;
    setIsLoading(true);
    try {
      const result = await checkKYCStatus(apiKey, anchorDomain, email);
      setKycStatus(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check KYC status'));
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, anchorDomain, email]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    kycStatus,
    isApproved: kycStatus?.status === 'approved',
    isLoading,
    error,
    refresh: fetch,
  };
}
