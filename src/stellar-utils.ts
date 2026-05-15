import { Keypair, StrKey } from 'stellar-sdk';
import { ValidationError } from './errors';

export interface StellarKeypair {
  publicKey: string;
  secretKey: string;
}

export interface StellarTOMLData {
  NETWORK_PASSPHRASE?: string;
  TRANSFER_SERVER?: string;
  TRANSFER_SERVER_SEP0024?: string;
  WEB_AUTH_ENDPOINT?: string;
  SIGNING_KEY?: string;
  CURRENCIES?: Array<{
    code: string;
    issuer?: string;
    anchor_asset_type?: string;
    anchor_asset?: string;
  }>;
}

export interface ConversionResult {
  inputAmount: number;
  inputCurrency: string;
  outputAmount: number;
  outputCurrency: string;
  rate: number;
  inverseRate: number;
}

/** Validate a Stellar public key (G-address) */
export function isValidStellarAddress(address: string): boolean {
  if (!address) return false;
  try {
    return StrKey.isValidEd25519PublicKey(address);
  } catch {
    return false;
  }
}

/** Generate a new random Stellar keypair */
export function generateStellarKeypair(): StellarKeypair {
  const keypair = Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
}

/** Validate Stellar secret key (S-address) */
export function isValidStellarSecretKey(secretKey: string): boolean {
  if (!secretKey) return false;
  try {
    return StrKey.isValidEd25519SecretSeed(secretKey);
  } catch {
    return false;
  }
}

/** Get public key from a secret key */
export function publicKeyFromSecret(secretKey: string): string {
  if (!isValidStellarSecretKey(secretKey)) {
    throw new ValidationError('Invalid Stellar secret key', 'secretKey');
  }
  return Keypair.fromSecret(secretKey).publicKey();
}

/** Format an amount as Nigerian Naira */
export function formatNGN(amount: number, compact = false): string {
  if (compact && amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format an amount as USDC */
export function formatUSDC(amount: number): string {
  return `$${amount.toFixed(2)} USDC`;
}

/** Convert NGN to USDC given an exchange rate */
export function ngnToUsdc(ngnAmount: number, rate: number): ConversionResult {
  if (rate <= 0) throw new ValidationError('Rate must be greater than 0', 'rate');
  const outputAmount = ngnAmount / rate;
  return {
    inputAmount: ngnAmount,
    inputCurrency: 'NGN',
    outputAmount: parseFloat(outputAmount.toFixed(6)),
    outputCurrency: 'USDC',
    rate,
    inverseRate: parseFloat((1 / rate).toFixed(10)),
  };
}

/** Convert USDC to NGN given an exchange rate */
export function usdcToNgn(usdcAmount: number, rate: number): ConversionResult {
  if (rate <= 0) throw new ValidationError('Rate must be greater than 0', 'rate');
  const outputAmount = usdcAmount * rate;
  return {
    inputAmount: usdcAmount,
    inputCurrency: 'USDC',
    outputAmount: parseFloat(outputAmount.toFixed(2)),
    outputCurrency: 'NGN',
    rate,
    inverseRate: parseFloat((1 / rate).toFixed(10)),
  };
}

/** Validate a Nigerian amount (must be a positive number, at least ₦1) */
export function isValidAmount(amount: number, min = 1, max?: number): boolean {
  if (!Number.isFinite(amount) || amount < min) return false;
  if (max !== undefined && amount > max) return false;
  return true;
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Shorten a Stellar address for display */
export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** Calculate the fee for a transaction based on amount and percentage */
export function calculateFee(amount: number, feePercentage: number): number {
  return parseFloat((amount * (feePercentage / 100)).toFixed(2));
}

/** Sleep for a given number of milliseconds (useful for polling) */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
