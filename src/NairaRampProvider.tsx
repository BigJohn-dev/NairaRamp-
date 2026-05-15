import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import type { Transaction } from './stellar';

export type SupportedNetwork = 'mainnet' | 'testnet';
export type SupportedCurrency = 'NGN' | 'GHS' | 'KES' | 'ZAR';

interface NairaRampContextType {
  apiKey: string;
  baseUrl: string;
  network: SupportedNetwork;
  locale: string;
  currency: SupportedCurrency;
  onTransaction?: (
    transaction: Transaction,
    event: 'initiated' | 'completed' | 'failed'
  ) => void;
}

const NairaRampContext = createContext<NairaRampContextType | undefined>(undefined);

interface NairaRampProviderProps {
  children: ReactNode;
  apiKey: string;
  /** Override the API base URL. Useful for self-hosted deployments. */
  baseUrl?: string;
  /** Stellar network to use. Default: 'mainnet' */
  network?: SupportedNetwork;
  /** Locale for number/date formatting. Default: 'en-NG' */
  locale?: string;
  /** Fiat currency to transact in. Default: 'NGN' */
  currency?: SupportedCurrency;
  /**
   * Global transaction lifecycle callback.
   * Fires on 'initiated', 'completed', and 'failed' events.
   */
  onTransaction?: (
    transaction: Transaction,
    event: 'initiated' | 'completed' | 'failed'
  ) => void;
}

export const NairaRampProvider: React.FC<NairaRampProviderProps> = ({
  children,
  apiKey,
  baseUrl = 'https://api.nairaramp.com',
  network = 'mainnet',
  locale = 'en-NG',
  currency = 'NGN',
  onTransaction,
}) => {
  if (!apiKey) {
    throw new Error('NairaRampProvider requires a valid apiKey prop');
  }

  const value = useMemo<NairaRampContextType>(
    () => ({ apiKey, baseUrl, network, locale, currency, onTransaction }),
    [apiKey, baseUrl, network, locale, currency, onTransaction]
  );

  return (
    <NairaRampContext.Provider value={value}>
      {children}
    </NairaRampContext.Provider>
  );
};

export const useNairaRamp = (): NairaRampContextType => {
  const context = useContext(NairaRampContext);
  if (!context) {
    throw new Error('useNairaRamp must be used within a NairaRampProvider');
  }
  return context;
};
