import { useState, useEffect, useCallback, useRef } from 'react';
import { useNairaRamp } from '../NairaRampProvider';
import { getTransactionStatus, Transaction } from '../stellar';

interface UseTransactionStatusOptions {
  /** Polling interval in ms. Default: 5000 */
  pollInterval?: number;
  /** If false, no polling starts. Default: true */
  enabled?: boolean;
}

interface UseTransactionStatusResult {
  transaction: Transaction | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

/** Poll a transaction's status and stop automatically on terminal states. */
export function useTransactionStatus(
  transactionId: string | null,
  options: UseTransactionStatusOptions = {}
): UseTransactionStatusResult {
  const { apiKey } = useNairaRamp();
  const { pollInterval = 5000, enabled = true } = options;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    if (!transactionId) return;
    setIsLoading(true);
    try {
      const tx = await getTransactionStatus(apiKey, transactionId);
      setTransaction(tx);
      setError(null);
      if (tx.status === 'completed' || tx.status === 'failed') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transaction status'));
    } finally {
      setIsLoading(false);
    }
  }, [transactionId, apiKey]);

  useEffect(() => {
    if (!enabled || !transactionId) return;

    fetch();
    intervalRef.current = setInterval(fetch, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [transactionId, enabled, pollInterval, fetch]);

  return { transaction, isLoading, error, refresh: fetch };
}
