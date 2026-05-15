import { useState, useEffect, useCallback, useRef } from 'react';
import { getExchangeRates } from '../stellar';

interface ExchangeRates {
  buyRate: number;
  sellRate: number;
}

interface UseExchangeRatesOptions {
  /** Auto-refresh rates on an interval. Default: false */
  autoRefresh?: boolean;
  /** Refresh interval in ms. Default: 30000 (30s) */
  refreshInterval?: number;
}

interface UseExchangeRatesResult {
  rates: ExchangeRates | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

/** Fetch and optionally auto-refresh exchange rates for a given anchor. */
export function useExchangeRates(
  anchorDomain: string,
  options: UseExchangeRatesOptions = {}
): UseExchangeRatesResult {
  const { autoRefresh = false, refreshInterval = 30_000 } = options;

  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    if (!anchorDomain) return;
    setIsLoading(true);
    try {
      const fetched = await getExchangeRates(anchorDomain);
      setRates(fetched);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exchange rates'));
    } finally {
      setIsLoading(false);
    }
  }, [anchorDomain]);

  useEffect(() => {
    fetch();

    if (autoRefresh) {
      intervalRef.current = setInterval(fetch, refreshInterval);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [anchorDomain, autoRefresh, refreshInterval, fetch]);

  return { rates, isLoading, error, lastUpdated, refresh: fetch };
}
