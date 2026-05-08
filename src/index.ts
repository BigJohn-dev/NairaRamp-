// React Components
export { NairaRampProvider, useNairaRamp } from './NairaRampProvider';
export type { ReactNode } from 'react';
export { RampWidget } from './RampWidget';

// Stellar Integration - Functions
export {
  initiateSEPFlow,
  initiateSEP24Flow,
  initiateSEP6Flow,
  getTransactionStatus,
  checkKYCStatus,
  getExchangeRates,
  discoverAnchors,
} from './stellar';

// Stellar Integration - Types
export type {
  Anchor,
  SEPFlowParams,
  SEPFlowResult,
  Transaction,
} from './stellar';
