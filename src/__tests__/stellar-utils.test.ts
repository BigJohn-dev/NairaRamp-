import {
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
} from '../stellar-utils';
import { ValidationError } from '../errors';

// Generate a known-good keypair once for use across all address tests
const testKeypair = generateStellarKeypair();

// ─── Stellar Address Validation ───────────────────────────────────────────────

describe('isValidStellarAddress', () => {
  it('returns true for a freshly generated public key', () => {
    expect(isValidStellarAddress(testKeypair.publicKey)).toBe(true);
  });

  it('returns false for a secret key passed as a public key', () => {
    expect(isValidStellarAddress(testKeypair.secretKey)).toBe(false);
  });

  it('returns false for arbitrary strings', () => {
    expect(isValidStellarAddress('not-a-stellar-address')).toBe(false);
    expect(isValidStellarAddress('')).toBe(false);
    expect(isValidStellarAddress('GSHORT')).toBe(false);
  });
});

describe('isValidStellarSecretKey', () => {
  it('returns true for a freshly generated secret key', () => {
    expect(isValidStellarSecretKey(testKeypair.secretKey)).toBe(true);
  });

  it('returns false for a public key passed as a secret key', () => {
    expect(isValidStellarSecretKey(testKeypair.publicKey)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidStellarSecretKey('')).toBe(false);
  });
});

describe('generateStellarKeypair', () => {
  it('produces a valid public key starting with G', () => {
    const kp = generateStellarKeypair();
    expect(kp.publicKey.startsWith('G')).toBe(true);
    expect(isValidStellarAddress(kp.publicKey)).toBe(true);
  });

  it('produces a valid secret key starting with S', () => {
    const kp = generateStellarKeypair();
    expect(kp.secretKey.startsWith('S')).toBe(true);
    expect(isValidStellarSecretKey(kp.secretKey)).toBe(true);
  });

  it('generates unique keypairs on each call', () => {
    const kp1 = generateStellarKeypair();
    const kp2 = generateStellarKeypair();
    expect(kp1.publicKey).not.toBe(kp2.publicKey);
    expect(kp1.secretKey).not.toBe(kp2.secretKey);
  });
});

describe('publicKeyFromSecret', () => {
  it('derives the correct public key from a valid secret', () => {
    expect(publicKeyFromSecret(testKeypair.secretKey)).toBe(testKeypair.publicKey);
  });

  it('throws ValidationError for an invalid secret key', () => {
    expect(() => publicKeyFromSecret('not-a-secret')).toThrow(ValidationError);
  });
});

// ─── Formatting ───────────────────────────────────────────────────────────────

describe('formatNGN', () => {
  it('includes NGN/₦ marker and amount digits', () => {
    const formatted = formatNGN(50000);
    expect(formatted).toMatch(/50[,.]?000/);
  });

  it('compact: formats millions as M', () => {
    expect(formatNGN(1_500_000, true)).toBe('₦1.5M');
  });

  it('compact: formats thousands as K', () => {
    expect(formatNGN(2_500, true)).toBe('₦2.5K');
  });

  it('compact: leaves small amounts as-is', () => {
    const small = formatNGN(500, true);
    expect(small).not.toContain('K');
    expect(small).not.toContain('M');
  });
});

describe('formatUSDC', () => {
  it('formats with 2 decimal places and USDC suffix', () => {
    expect(formatUSDC(31.25)).toBe('$31.25 USDC');
  });

  it('pads to 2 decimal places', () => {
    expect(formatUSDC(0.5)).toBe('$0.50 USDC');
  });

  it('handles whole numbers', () => {
    expect(formatUSDC(100)).toBe('$100.00 USDC');
  });
});

// ─── Conversion Math ──────────────────────────────────────────────────────────

describe('ngnToUsdc', () => {
  it('converts NGN to USDC correctly', () => {
    const result = ngnToUsdc(80000, 1600);
    expect(result.outputAmount).toBe(50);
    expect(result.inputCurrency).toBe('NGN');
    expect(result.outputCurrency).toBe('USDC');
    expect(result.rate).toBe(1600);
  });

  it('handles fractional USDC output', () => {
    const result = ngnToUsdc(1000, 1600);
    expect(result.outputAmount).toBeCloseTo(0.625);
  });

  it('provides the inverse rate', () => {
    const result = ngnToUsdc(50000, 1600);
    expect(result.inverseRate).toBeCloseTo(1 / 1600);
  });

  it('throws ValidationError for zero rate', () => {
    expect(() => ngnToUsdc(50000, 0)).toThrow(ValidationError);
  });

  it('throws ValidationError for negative rate', () => {
    expect(() => ngnToUsdc(50000, -100)).toThrow(ValidationError);
  });
});

describe('usdcToNgn', () => {
  it('converts USDC to NGN correctly', () => {
    const result = usdcToNgn(50, 1600);
    expect(result.outputAmount).toBe(80000);
    expect(result.inputCurrency).toBe('USDC');
    expect(result.outputCurrency).toBe('NGN');
  });

  it('is the inverse of ngnToUsdc', () => {
    const rate = 1620;
    const ngn = 50000;
    const usdc = ngnToUsdc(ngn, rate).outputAmount;
    const backToNgn = usdcToNgn(usdc, rate).outputAmount;
    expect(backToNgn).toBeCloseTo(ngn, 0);
  });

  it('throws ValidationError for negative rate', () => {
    expect(() => usdcToNgn(50, -100)).toThrow(ValidationError);
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe('isValidAmount', () => {
  it('accepts positive amounts above default minimum', () => {
    expect(isValidAmount(1)).toBe(true);
    expect(isValidAmount(50000)).toBe(true);
  });

  it('rejects zero and negative amounts', () => {
    expect(isValidAmount(0)).toBe(false);
    expect(isValidAmount(-1)).toBe(false);
  });

  it('rejects amounts below custom minimum', () => {
    expect(isValidAmount(500, 1000)).toBe(false);
  });

  it('accepts amounts within min/max range', () => {
    expect(isValidAmount(1500, 1000, 2000)).toBe(true);
  });

  it('rejects amounts above maximum', () => {
    expect(isValidAmount(2500, 1000, 2000)).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts standard email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('dev+test@nairaramp.io')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('missing-at-sign')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

// ─── Utilities ────────────────────────────────────────────────────────────────

describe('shortenAddress', () => {
  it('shortens long addresses with ellipsis', () => {
    const addr = testKeypair.publicKey;
    const short = shortenAddress(addr, 4);
    expect(short).toContain('...');
    expect(short.length).toBeLessThan(addr.length);
    expect(short.startsWith(addr.slice(0, 4))).toBe(true);
    expect(short.endsWith(addr.slice(-4))).toBe(true);
  });

  it('returns short addresses unchanged', () => {
    expect(shortenAddress('GABC', 4)).toBe('GABC');
  });
});

describe('calculateFee', () => {
  it('calculates 1% fee', () => {
    expect(calculateFee(10000, 1)).toBe(100);
  });

  it('calculates fractional percentage fee', () => {
    expect(calculateFee(10000, 0.5)).toBe(50);
  });

  it('returns 0 for 0% fee', () => {
    expect(calculateFee(10000, 0)).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateFee(1000, 1.5)).toBe(15);
  });
});
