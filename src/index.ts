// ─── React Components ─────────────────────────────────────────────────────────
export { NairaRampProvider, useNairaRamp } from './NairaRampProvider';
export type { SupportedNetwork, SupportedCurrency } from './NairaRampProvider';
export type { ReactNode } from 'react';

export { RampWidget } from './RampWidget';

// ─── UI Components ────────────────────────────────────────────────────────────
export { TransactionStatusBadge } from './components/TransactionStatusBadge';
export { ExchangeRateDisplay } from './components/ExchangeRateDisplay';
export { AnchorSelector } from './components/AnchorSelector';
export { KYCStatusBadge } from './components/KYCStatusBadge';
export { ConversionCalculator } from './components/ConversionCalculator';

// ─── React Hooks ──────────────────────────────────────────────────────────────
export { useTransactionStatus } from './hooks/useTransactionStatus';
export { useExchangeRates } from './hooks/useExchangeRates';
export { useAnchorDiscovery } from './hooks/useAnchorDiscovery';
export { useKYCStatus } from './hooks/useKYCStatus';
export type { KYCStatus, KYCStatusResult } from './hooks/useKYCStatus';
export { useRampTransaction } from './hooks/useRampTransaction';
export type { RampTransactionState } from './hooks/useRampTransaction';

// ─── Stellar Core Functions ───────────────────────────────────────────────────
export {
  initiateSEPFlow,
  initiateSEP24Flow,
  initiateSEP6Flow,
  discoverAnchors,
  compareAnchorRates,
  getExchangeRates,
  estimateConversion,
  getTransactionStatus,
  getTransactionHistory,
  cancelTransaction,
  subscribeToTransaction,
  checkKYCStatus,
  initiateKYC,
} from './stellar';

export type {
  Anchor,
  AnchorWithRates,
  SEPFlowParams,
  SEPFlowResult,
  Transaction,
  TransactionListOptions,
  TransactionList,
  ConversionEstimate,
} from './stellar';

// ─── Stellar Utilities ────────────────────────────────────────────────────────
export {
  isValidStellarAddress,
  isValidStellarSecretKey,
  generateStellarKeypair,
  publicKeyFromSecret,
  formatNGN,
  formatUSDC,
  ngnToUsdc,
  usdcToNgn,
  isValidAmount,
  isValidEmail,
  shortenAddress,
  calculateFee,
} from './stellar-utils';

export type { StellarKeypair, ConversionResult } from './stellar-utils';

// ─── Error Types ──────────────────────────────────────────────────────────────
export {
  NairaRampError,
  ValidationError,
  AnchorError,
  TransactionError,
  KYCError,
  NetworkError,
  AuthError,
} from './errors';
