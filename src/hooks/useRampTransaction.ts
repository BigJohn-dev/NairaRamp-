import { useState, useCallback } from 'react';
import { useNairaRamp } from '../NairaRampProvider';
import { initiateSEPFlow, SEPFlowParams, SEPFlowResult } from '../stellar';

export type RampTransactionState =
  | 'idle'
  | 'initiating'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

interface UseRampTransactionResult {
  state: RampTransactionState;
  result: SEPFlowResult | null;
  error: Error | null;
  initiate: (params: Omit<SEPFlowParams, 'apiKey'>) => Promise<SEPFlowResult | null>;
  reset: () => void;
  isActive: boolean;
}

/**
 * Manage the full lifecycle of a deposit or withdrawal transaction.
 * Automatically opens the interactive URL for SEP-24 flows.
 */
export function useRampTransaction(): UseRampTransactionResult {
  const { apiKey } = useNairaRamp();
  const [state, setState] = useState<RampTransactionState>('idle');
  const [result, setResult] = useState<SEPFlowResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const initiate = useCallback(
    async (params: Omit<SEPFlowParams, 'apiKey'>): Promise<SEPFlowResult | null> => {
      setState('initiating');
      setError(null);
      try {
        const flowResult = await initiateSEPFlow({ ...params, apiKey });
        setResult(flowResult);
        setState('pending');
        if (flowResult.interactiveUrl) {
          window.open(flowResult.interactiveUrl, '_blank', 'noopener,noreferrer');
        }
        return flowResult;
      } catch (err) {
        const caught = err instanceof Error ? err : new Error('Transaction initiation failed');
        setError(caught);
        setState('failed');
        return null;
      }
    },
    [apiKey]
  );

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
  }, []);

  const isActive = state === 'initiating' || state === 'pending' || state === 'processing';

  return { state, result, error, initiate, reset, isActive };
}
