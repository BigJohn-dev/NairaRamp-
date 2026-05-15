import axios from 'axios';
import { NetworkError, TransactionError, AnchorError, ValidationError } from './errors';

const BASE_URL = 'https://api.nairaramp.com/v1';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Anchor {
  name: string;
  domain: string;
  displayName: string;
  supportedAssets: Array<{
    code: string;
    issuer: string;
  }>;
  sep24Supported: boolean;
  sep6Supported: boolean;
  /** Approximate fee percentage (if available from TOML) */
  feePercentage?: number;
}

export interface SEPFlowParams {
  apiKey: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  walletAddress?: string;
  customerEmail?: string;
  anchorDomain?: string;
  memo?: string;
}

export interface SEPFlowResult {
  id: string;
  url?: string;
  interactiveUrl?: string;
  anchorDomain?: string;
  type: 'deposit' | 'withdrawal';
}

export interface Transaction {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  amount: number;
  assetCode: string;
  type: 'deposit' | 'withdrawal';
  createdAt: string;
  updatedAt: string;
  anchorDomain?: string;
  memo?: string;
  externalTransactionId?: string;
  message?: string;
}

export interface TransactionListOptions {
  limit?: number;
  page?: number;
  type?: 'deposit' | 'withdrawal';
  status?: Transaction['status'];
}

export interface TransactionList {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface AnchorWithRates extends Anchor {
  buyRate: number | null;
  sellRate: number | null;
}

export interface ConversionEstimate {
  inputAmount: number;
  outputAmount: number;
  fee: number;
  feePercentage: number;
  rate: number;
  anchorDomain: string;
  type: 'deposit' | 'withdrawal';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeaders(apiKey: string) {
  return { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
}

function mapTransaction(data: Record<string, unknown>): Transaction {
  return {
    id: data.id as string,
    status: data.status as Transaction['status'],
    amount: data.amount as number,
    assetCode: (data.asset_code as string) || 'USDC',
    type: data.type === 'deposit' ? 'deposit' : 'withdrawal',
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    anchorDomain: data.anchor_domain as string | undefined,
    memo: data.memo as string | undefined,
    externalTransactionId: data.external_transaction_id as string | undefined,
    message: data.message as string | undefined,
  };
}

function handleAxiosError(error: unknown, fallback: string): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const msg = (error.response?.data as { message?: string })?.message || error.message;
    throw new NetworkError(`${fallback}: ${msg}`, status);
  }
  throw error;
}

// ─── Anchor Discovery ─────────────────────────────────────────────────────────

const KNOWN_NGN_ANCHORS = [
  'flutterwave.com',
  'yellowcard.io',
  'bitnob.com',
  'busha.co',
];

/** Discover available Stellar anchors that support NGN/USDC. */
export async function discoverAnchors(): Promise<Anchor[]> {
  const anchors: Anchor[] = [];

  const results = await Promise.allSettled(
    KNOWN_NGN_ANCHORS.map(async (domain) => {
      await axios.get(`https://${domain}/.well-known/stellar.toml`, { timeout: 5000 });
      return domain;
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const domain = result.value;
      const name = domain.split('.')[0];
      anchors.push({
        name,
        domain,
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        supportedAssets: [
          { code: 'NGN', issuer: '' },
          { code: 'USDC', issuer: 'GBBD47AB6P5X574CM6I63QS5BVYSDJD3G7WKBPXQKCDRNL4D5XWDRBE' },
        ],
        sep24Supported: true,
        sep6Supported: true,
      });
    }
  }

  if (anchors.length === 0) {
    return [
      {
        name: 'flutterwave',
        domain: 'flutterwave.com',
        displayName: 'Flutterwave',
        supportedAssets: [
          { code: 'NGN', issuer: '' },
          { code: 'USDC', issuer: 'GBBD47AB6P5X574CM6I63QS5BVYSDJD3G7WKBPXQKCDRNL4D5XWDRBE' },
        ],
        sep24Supported: true,
        sep6Supported: true,
      },
      {
        name: 'yellowcard',
        domain: 'yellowcard.io',
        displayName: 'Yellow Card',
        supportedAssets: [
          { code: 'NGN', issuer: '' },
          { code: 'USDC', issuer: 'GBBD47AB6P5X574CM6I63QS5BVYSDJD3G7WKBPXQKCDRNL4D5XWDRBE' },
        ],
        sep24Supported: true,
        sep6Supported: false,
      },
    ];
  }

  return anchors;
}

// ─── Exchange Rates ───────────────────────────────────────────────────────────

/** Get live NGN/USDC buy and sell rates for a specific anchor. */
export async function getExchangeRates(
  anchorDomain: string
): Promise<{ buyRate: number; sellRate: number }> {
  try {
    const response = await axios.get(`${BASE_URL}/rates/${anchorDomain}?pair=NGN-USDC`);
    return {
      buyRate: response.data.buy_rate,
      sellRate: response.data.sell_rate,
    };
  } catch (error) {
    handleAxiosError(error, 'Failed to fetch exchange rates');
  }
}

/** Fetch rates for all known anchors and sort by best rate for the given type. */
export async function compareAnchorRates(
  type: 'deposit' | 'withdrawal' = 'deposit'
): Promise<AnchorWithRates[]> {
  const anchors = await discoverAnchors();

  const results = await Promise.allSettled(
    anchors.map(async (anchor) => {
      const rates = await getExchangeRates(anchor.domain);
      return { ...anchor, ...rates };
    })
  );

  const withRates: AnchorWithRates[] = anchors.map((anchor) => {
    const match = results.find(
      (r) => r.status === 'fulfilled' && r.value.domain === anchor.domain
    );
    if (match && match.status === 'fulfilled') {
      return { ...anchor, buyRate: match.value.buyRate, sellRate: match.value.sellRate };
    }
    return { ...anchor, buyRate: null, sellRate: null };
  });

  return withRates.sort((a, b) => {
    if (type === 'deposit') {
      const rateA = a.buyRate ?? Infinity;
      const rateB = b.buyRate ?? Infinity;
      return rateA - rateB;
    }
    const rateA = a.sellRate ?? 0;
    const rateB = b.sellRate ?? 0;
    return rateB - rateA;
  });
}

/** Estimate the amount received and fee for a transaction before initiating. */
export async function estimateConversion(
  anchorDomain: string,
  amount: number,
  type: 'deposit' | 'withdrawal'
): Promise<ConversionEstimate> {
  if (amount <= 0) throw new ValidationError('Amount must be greater than 0', 'amount');

  try {
    const response = await axios.get(
      `${BASE_URL}/rates/${anchorDomain}/estimate?amount=${amount}&type=${type}`
    );
    return {
      inputAmount: amount,
      outputAmount: response.data.output_amount,
      fee: response.data.fee,
      feePercentage: response.data.fee_percentage,
      rate: response.data.rate,
      anchorDomain,
      type,
    };
  } catch {
    // Fallback: estimate using basic rates with ~1% fee assumption
    const rates = await getExchangeRates(anchorDomain);
    const rate = type === 'deposit' ? rates.buyRate : rates.sellRate;
    const feePercentage = 1.0;
    const fee = parseFloat((amount * (feePercentage / 100)).toFixed(2));
    const netAmount = amount - fee;
    const outputAmount = type === 'deposit'
      ? parseFloat((netAmount / rate).toFixed(6))
      : parseFloat((netAmount * rate).toFixed(2));

    return { inputAmount: amount, outputAmount, fee, feePercentage, rate, anchorDomain, type };
  }
}

// ─── SEP-24 Interactive Flow ──────────────────────────────────────────────────

/** Initiate an interactive SEP-24 flow (opens a KYC/transfer window). */
export async function initiateSEP24Flow(params: SEPFlowParams): Promise<SEPFlowResult> {
  const { apiKey, type, amount, walletAddress, customerEmail, anchorDomain, memo } = params;

  if (!apiKey) throw new ValidationError('API key is required', 'apiKey');
  if (amount <= 0) throw new ValidationError('Amount must be greater than 0', 'amount');

  const selectedAnchor = anchorDomain || 'flutterwave.com';

  try {
    const response = await axios.post(
      `${BASE_URL}/sep24/transactions`,
      {
        type: type === 'deposit' ? 'deposit-interactive' : 'withdrawal-interactive',
        amount,
        asset_code: 'USDC',
        anchor_domain: selectedAnchor,
        wallet_address: walletAddress,
        customer_email: customerEmail,
        memo,
      },
      { headers: authHeaders(apiKey) }
    );

    return {
      id: response.data.id,
      url: response.data.url,
      interactiveUrl: response.data.interactive_url,
      anchorDomain: selectedAnchor,
      type,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg = (error.response?.data as { message?: string })?.message || error.message;
      throw new AnchorError(`SEP-24 flow initiation failed: ${msg}`, selectedAnchor);
    }
    throw error;
  }
}

// ─── SEP-6 Direct Flow ────────────────────────────────────────────────────────

/** Initiate a direct SEP-6 transfer (non-interactive, requires wallet address). */
export async function initiateSEP6Flow(params: SEPFlowParams): Promise<SEPFlowResult> {
  const { apiKey, type, amount, walletAddress, customerEmail, anchorDomain, memo } = params;

  if (!apiKey) throw new ValidationError('API key is required', 'apiKey');
  if (!walletAddress) throw new ValidationError('Wallet address is required for SEP-6', 'walletAddress');

  const selectedAnchor = anchorDomain || 'flutterwave.com';

  try {
    const response = await axios.post(
      `${BASE_URL}/sep6/transactions`,
      {
        type: type === 'deposit' ? 'deposit' : 'withdrawal',
        amount,
        asset_code: 'USDC',
        anchor_domain: selectedAnchor,
        account: walletAddress,
        customer_email: customerEmail,
        memo,
      },
      { headers: authHeaders(apiKey) }
    );

    return {
      id: response.data.id,
      url: response.data.url,
      interactiveUrl: response.data.interactive_url,
      anchorDomain: selectedAnchor,
      type,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg = (error.response?.data as { message?: string })?.message || error.message;
      throw new AnchorError(`SEP-6 flow initiation failed: ${msg}`, selectedAnchor);
    }
    throw error;
  }
}

/** Auto-selects SEP-6 when a walletAddress is supplied, otherwise SEP-24. */
export async function initiateSEPFlow(params: SEPFlowParams): Promise<SEPFlowResult> {
  return params.walletAddress ? initiateSEP6Flow(params) : initiateSEP24Flow(params);
}

// ─── Transaction Management ───────────────────────────────────────────────────

/** Get the current status of a transaction. */
export async function getTransactionStatus(
  apiKey: string,
  transactionId: string
): Promise<Transaction> {
  try {
    const response = await axios.get(`${BASE_URL}/transactions/${transactionId}`, {
      headers: authHeaders(apiKey),
    });
    return mapTransaction(response.data as Record<string, unknown>);
  } catch (error) {
    handleAxiosError(error, 'Failed to fetch transaction status');
  }
}

/** List transactions with optional filtering and pagination. */
export async function getTransactionHistory(
  apiKey: string,
  options: TransactionListOptions = {}
): Promise<TransactionList> {
  const { limit = 20, page = 1, type, status } = options;
  try {
    const response = await axios.get(`${BASE_URL}/transactions`, {
      headers: authHeaders(apiKey),
      params: { limit, page, type, status },
    });
    return {
      transactions: (response.data.data as Record<string, unknown>[]).map(mapTransaction),
      total: response.data.total as number,
      page: response.data.page as number,
      limit: response.data.limit as number,
    };
  } catch (error) {
    handleAxiosError(error, 'Failed to fetch transaction history');
  }
}

/** Cancel a pending transaction. Only works on transactions in 'pending' state. */
export async function cancelTransaction(apiKey: string, transactionId: string): Promise<void> {
  try {
    await axios.delete(`${BASE_URL}/transactions/${transactionId}`, {
      headers: authHeaders(apiKey),
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg = (error.response?.data as { message?: string })?.message || error.message;
      throw new TransactionError(`Failed to cancel transaction: ${msg}`, transactionId);
    }
    throw error;
  }
}

/**
 * Subscribe to real-time transaction status updates via polling.
 * Returns an unsubscribe function — call it to stop polling.
 */
export function subscribeToTransaction(
  apiKey: string,
  transactionId: string,
  callback: (transaction: Transaction) => void,
  options: { pollInterval?: number } = {}
): () => void {
  const { pollInterval = 5000 } = options;

  const interval = setInterval(async () => {
    try {
      const tx = await getTransactionStatus(apiKey, transactionId);
      callback(tx);
      if (tx.status === 'completed' || tx.status === 'failed') {
        clearInterval(interval);
      }
    } catch {
      // Silently continue polling on transient errors
    }
  }, pollInterval);

  return () => clearInterval(interval);
}

// ─── KYC ──────────────────────────────────────────────────────────────────────

/** Check KYC approval status for a customer with a specific anchor. */
export async function checkKYCStatus(
  apiKey: string,
  anchorDomain: string,
  customerEmail: string
): Promise<{
  status: 'approved' | 'pending' | 'rejected' | 'none';
  message?: string;
}> {
  try {
    const response = await axios.get(`${BASE_URL}/kyc/status`, {
      params: { anchor_domain: anchorDomain, customer_email: customerEmail },
      headers: authHeaders(apiKey),
    });
    return {
      status: response.data.status,
      message: response.data.message,
    };
  } catch (error) {
    handleAxiosError(error, 'Failed to check KYC status');
  }
}

/**
 * Initiate a KYC verification flow for a customer.
 * Returns a URL to redirect the user to for document verification.
 */
export async function initiateKYC(
  apiKey: string,
  anchorDomain: string,
  customerEmail: string,
  customerName?: string
): Promise<{ kycUrl: string; sessionId: string }> {
  try {
    const response = await axios.post(
      `${BASE_URL}/kyc/initiate`,
      {
        anchor_domain: anchorDomain,
        customer_email: customerEmail,
        customer_name: customerName,
      },
      { headers: authHeaders(apiKey) }
    );
    return {
      kycUrl: response.data.kyc_url,
      sessionId: response.data.session_id,
    };
  } catch (error) {
    handleAxiosError(error, 'Failed to initiate KYC');
  }
}
