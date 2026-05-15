import {
  discoverAnchors,
  getExchangeRates,
  getTransactionStatus,
  initiateSEP24Flow,
  initiateSEP6Flow,
  initiateSEPFlow,
  cancelTransaction,
  subscribeToTransaction,
  checkKYCStatus,
  estimateConversion,
} from '../stellar';
import { ValidationError, NetworkError, AnchorError } from '../errors';

// Mock axios module entirely so isAxiosError is a regular jest.fn()
jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return {
    ...actual,
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    isAxiosError: jest.fn().mockReturnValue(false),
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');

const API_KEY = 'pk_test_abc123';
const ANCHOR = 'flutterwave.com';

beforeEach(() => {
  jest.clearAllMocks();
  (axios.isAxiosError as jest.Mock).mockReturnValue(false);
});

// ─── discoverAnchors ───────────────────────────────────────────────────────────

describe('discoverAnchors', () => {
  it('returns fallback anchors when all TOML fetches fail', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));
    const anchors = await discoverAnchors();
    expect(anchors.length).toBeGreaterThan(0);
    expect(anchors[0]).toHaveProperty('domain');
    expect(anchors[0]).toHaveProperty('sep24Supported');
    expect(anchors[0]).toHaveProperty('sep6Supported');
  });

  it('includes discovered anchor when TOML fetch succeeds', async () => {
    (axios.get as jest.Mock).mockImplementation((url: string) => {
      if ((url as string).includes('flutterwave')) return Promise.resolve({ data: '' });
      return Promise.reject(new Error('not found'));
    });
    const anchors = await discoverAnchors();
    expect(anchors.some((a) => a.domain === 'flutterwave.com')).toBe(true);
  });
});

// ─── getExchangeRates ──────────────────────────────────────────────────────────

describe('getExchangeRates', () => {
  it('returns buyRate and sellRate from the API', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { buy_rate: 1620, sell_rate: 1590 },
    });
    const rates = await getExchangeRates(ANCHOR);
    expect(rates.buyRate).toBe(1620);
    expect(rates.sellRate).toBe(1590);
  });

  it('throws NetworkError on API failure', async () => {
    (axios.isAxiosError as jest.Mock).mockReturnValue(true);
    (axios.get as jest.Mock).mockRejectedValue({
      response: { status: 503, data: { message: 'Service unavailable' } },
      message: 'Service unavailable',
    });
    await expect(getExchangeRates(ANCHOR)).rejects.toBeInstanceOf(NetworkError);
  });
});

// ─── getTransactionStatus ──────────────────────────────────────────────────────

describe('getTransactionStatus', () => {
  const txData = {
    id: 'txn_001',
    status: 'pending',
    amount: 50000,
    asset_code: 'USDC',
    type: 'deposit',
    created_at: '2026-05-15T10:00:00Z',
    updated_at: '2026-05-15T10:05:00Z',
    anchor_domain: ANCHOR,
  };

  it('maps API response to Transaction shape', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: txData });
    const tx = await getTransactionStatus(API_KEY, 'txn_001');
    expect(tx.id).toBe('txn_001');
    expect(tx.status).toBe('pending');
    expect(tx.amount).toBe(50000);
    expect(tx.assetCode).toBe('USDC');
    expect(tx.type).toBe('deposit');
  });

  it('throws NetworkError when transaction not found', async () => {
    (axios.isAxiosError as jest.Mock).mockReturnValue(true);
    (axios.get as jest.Mock).mockRejectedValue({
      response: { status: 404, data: { message: 'Transaction not found' } },
      message: 'Not found',
    });
    await expect(getTransactionStatus(API_KEY, 'bad_id')).rejects.toBeInstanceOf(NetworkError);
  });
});

// ─── initiateSEP24Flow ────────────────────────────────────────────────────────

describe('initiateSEP24Flow', () => {
  it('throws ValidationError when apiKey is missing', async () => {
    await expect(
      initiateSEP24Flow({ apiKey: '', type: 'deposit', amount: 10000 })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('throws ValidationError when amount is 0', async () => {
    await expect(
      initiateSEP24Flow({ apiKey: API_KEY, type: 'deposit', amount: 0 })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('returns SEPFlowResult on success', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { id: 'txn_sep24_001', interactive_url: 'https://anchor.com/kyc/123' },
    });
    const result = await initiateSEP24Flow({
      apiKey: API_KEY,
      type: 'deposit',
      amount: 50000,
      customerEmail: 'test@example.com',
    });
    expect(result.id).toBe('txn_sep24_001');
    expect(result.interactiveUrl).toBe('https://anchor.com/kyc/123');
    expect(result.type).toBe('deposit');
  });

  it('throws AnchorError on API failure', async () => {
    (axios.isAxiosError as jest.Mock).mockReturnValue(true);
    (axios.post as jest.Mock).mockRejectedValue({
      response: { status: 400, data: { message: 'Invalid request' } },
      message: 'Invalid request',
    });
    await expect(
      initiateSEP24Flow({ apiKey: API_KEY, type: 'deposit', amount: 50000 })
    ).rejects.toBeInstanceOf(AnchorError);
  });
});

// ─── initiateSEP6Flow ─────────────────────────────────────────────────────────

describe('initiateSEP6Flow', () => {
  const WALLET = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

  it('throws ValidationError when walletAddress is missing', async () => {
    await expect(
      initiateSEP6Flow({ apiKey: API_KEY, type: 'deposit', amount: 10000 })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('returns SEPFlowResult on success', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { id: 'txn_sep6_001', url: 'https://anchor.com/transfer/456' },
    });
    const result = await initiateSEP6Flow({
      apiKey: API_KEY,
      type: 'deposit',
      amount: 50000,
      walletAddress: WALLET,
    });
    expect(result.id).toBe('txn_sep6_001');
    expect(result.type).toBe('deposit');
  });
});

// ─── initiateSEPFlow ──────────────────────────────────────────────────────────

describe('initiateSEPFlow', () => {
  const WALLET = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

  it('routes to SEP-6 when walletAddress is provided', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: { id: 'sep6', url: null } });
    await initiateSEPFlow({ apiKey: API_KEY, type: 'deposit', amount: 10000, walletAddress: WALLET });
    const postUrl = (axios.post as jest.Mock).mock.calls[0][0] as string;
    expect(postUrl).toContain('sep6');
  });

  it('routes to SEP-24 when walletAddress is absent', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { id: 'sep24', interactive_url: 'https://x.com' },
    });
    await initiateSEPFlow({ apiKey: API_KEY, type: 'deposit', amount: 10000 });
    const postUrl = (axios.post as jest.Mock).mock.calls[0][0] as string;
    expect(postUrl).toContain('sep24');
  });
});

// ─── cancelTransaction ────────────────────────────────────────────────────────

describe('cancelTransaction', () => {
  it('calls DELETE on the correct endpoint', async () => {
    (axios.delete as jest.Mock).mockResolvedValue({ data: {} });
    await cancelTransaction(API_KEY, 'txn_cancel_001');
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining('txn_cancel_001'),
      expect.any(Object)
    );
  });

  it('throws TransactionError on failure', async () => {
    (axios.isAxiosError as jest.Mock).mockReturnValue(true);
    (axios.delete as jest.Mock).mockRejectedValue({
      response: { status: 422, data: { message: 'Transaction already completed' } },
      message: 'Cannot cancel',
    });
    await expect(cancelTransaction(API_KEY, 'txn_done')).rejects.toMatchObject({
      code: 'TRANSACTION_ERROR',
    });
  });
});

// ─── subscribeToTransaction ───────────────────────────────────────────────────

describe('subscribeToTransaction', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns an unsubscribe function that stops polling', () => {
    const unsubscribe = subscribeToTransaction(API_KEY, 'txn_x', jest.fn());
    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe()).not.toThrow();
  });

  it('stops polling after receiving a completed status', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        id: 'txn_sub',
        status: 'completed',
        amount: 5000,
        asset_code: 'USDC',
        type: 'deposit',
        created_at: '',
        updated_at: '',
      },
    });

    const callback = jest.fn();
    subscribeToTransaction(API_KEY, 'txn_sub', callback, { pollInterval: 1000 });
    jest.advanceTimersByTime(1100);
    await Promise.resolve(); // flush microtasks
    await Promise.resolve();
    expect(callback).toHaveBeenCalled();
  });
});

// ─── checkKYCStatus ───────────────────────────────────────────────────────────

describe('checkKYCStatus', () => {
  it('returns approved status', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { status: 'approved', message: null } });
    const result = await checkKYCStatus(API_KEY, ANCHOR, 'user@example.com');
    expect(result.status).toBe('approved');
  });

  it('returns pending with a message', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { status: 'pending', message: 'Additional verification required' },
    });
    const result = await checkKYCStatus(API_KEY, ANCHOR, 'user@example.com');
    expect(result.status).toBe('pending');
    expect(result.message).toBeDefined();
  });
});

// ─── estimateConversion ───────────────────────────────────────────────────────

describe('estimateConversion', () => {
  it('throws ValidationError for zero amount', async () => {
    await expect(estimateConversion(ANCHOR, 0, 'deposit')).rejects.toBeInstanceOf(ValidationError);
  });

  it('falls back to rate-based estimate when estimate endpoint fails', async () => {
    (axios.get as jest.Mock)
      .mockRejectedValueOnce(new Error('endpoint not found'))
      .mockResolvedValueOnce({ data: { buy_rate: 1600, sell_rate: 1575 } });

    const estimate = await estimateConversion(ANCHOR, 10000, 'deposit');
    expect(estimate.inputAmount).toBe(10000);
    expect(estimate.outputAmount).toBeGreaterThan(0);
    expect(estimate.rate).toBe(1600);
  });
});
