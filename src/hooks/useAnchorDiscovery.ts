import { useState, useEffect, useCallback } from 'react';
import { discoverAnchors, getExchangeRates, Anchor } from '../stellar';

interface AnchorWithRates extends Anchor {
  buyRate: number | null;
  sellRate: number | null;
}

interface UseAnchorDiscoveryResult {
  anchors: Anchor[];
  anchorsWithRates: AnchorWithRates[];
  bestDepositAnchor: Anchor | null;
  bestWithdrawalAnchor: Anchor | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

/** Discover available anchors and find the best rates for deposits and withdrawals. */
export function useAnchorDiscovery(): UseAnchorDiscoveryResult {
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [anchorsWithRates, setAnchorsWithRates] = useState<AnchorWithRates[]>([]);
  const [bestDepositAnchor, setBestDepositAnchor] = useState<Anchor | null>(null);
  const [bestWithdrawalAnchor, setBestWithdrawalAnchor] = useState<Anchor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const discovered = await discoverAnchors();
      setAnchors(discovered);
      setError(null);

      if (discovered.length === 0) return;

      // Fetch rates for all anchors in parallel (best-effort)
      const rateResults = await Promise.allSettled(
        discovered.map(async (anchor) => {
          const rates = await getExchangeRates(anchor.domain);
          return { anchor, ...rates };
        })
      );

      const withRates: AnchorWithRates[] = discovered.map((anchor) => {
        const result = rateResults.find(
          (r) => r.status === 'fulfilled' && r.value.anchor.domain === anchor.domain
        );
        if (result && result.status === 'fulfilled') {
          return {
            ...anchor,
            buyRate: result.value.buyRate,
            sellRate: result.value.sellRate,
          };
        }
        return { ...anchor, buyRate: null, sellRate: null };
      });

      setAnchorsWithRates(withRates);

      // Best deposit anchor = lowest buyRate (cheapest NGN per USDC)
      const withBuyRate = withRates.filter((a) => a.buyRate !== null);
      if (withBuyRate.length > 0) {
        const best = withBuyRate.reduce((a, b) =>
          (a.buyRate as number) < (b.buyRate as number) ? a : b
        );
        setBestDepositAnchor(best);
      } else {
        setBestDepositAnchor(discovered[0]);
      }

      // Best withdrawal anchor = highest sellRate (most NGN per USDC)
      const withSellRate = withRates.filter((a) => a.sellRate !== null);
      if (withSellRate.length > 0) {
        const best = withSellRate.reduce((a, b) =>
          (a.sellRate as number) > (b.sellRate as number) ? a : b
        );
        setBestWithdrawalAnchor(best);
      } else {
        setBestWithdrawalAnchor(discovered[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to discover anchors'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    anchors,
    anchorsWithRates,
    bestDepositAnchor,
    bestWithdrawalAnchor,
    isLoading,
    error,
    refresh: fetch,
  };
}
