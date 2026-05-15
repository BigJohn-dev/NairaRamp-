import React, { useState, useCallback } from 'react';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { ngnToUsdc, usdcToNgn, formatNGN, formatUSDC, isValidAmount } from '../stellar-utils';

interface ConversionCalculatorProps {
  anchorDomain: string;
  defaultAmount?: number;
  defaultDirection?: 'ngn-to-usdc' | 'usdc-to-ngn';
  onAmountChange?: (ngnAmount: number, usdcAmount: number, rate: number) => void;
  theme?: 'light' | 'dark';
}

/** Standalone bi-directional NGN ↔ USDC calculator with live rates. */
export const ConversionCalculator: React.FC<ConversionCalculatorProps> = ({
  anchorDomain,
  defaultAmount = 0,
  defaultDirection = 'ngn-to-usdc',
  onAmountChange,
  theme = 'light',
}) => {
  const { rates, isLoading, refresh } = useExchangeRates(anchorDomain, {
    autoRefresh: true,
    refreshInterval: 30_000,
  });

  const [direction, setDirection] = useState<'ngn-to-usdc' | 'usdc-to-ngn'>(defaultDirection);
  const [inputValue, setInputValue] = useState<string>(defaultAmount > 0 ? String(defaultAmount) : '');

  const isDark = theme === 'dark';
  const bg = isDark ? '#1a1a1a' : '#ffffff';
  const cardBg = isDark ? '#2a2a2a' : '#f9fafb';
  const border = isDark ? '#404040' : '#e5e7eb';
  const text = isDark ? '#f9fafb' : '#1f2937';
  const subtle = isDark ? '#9ca3af' : '#6b7280';
  const inputBg = isDark ? '#333' : '#fff';

  const rate = rates ? (direction === 'ngn-to-usdc' ? rates.buyRate : rates.sellRate) : null;
  const amount = parseFloat(inputValue) || 0;

  const result = rate && isValidAmount(amount)
    ? direction === 'ngn-to-usdc'
      ? ngnToUsdc(amount, rate)
      : usdcToNgn(amount, rate)
    : null;

  const handleInput = useCallback(
    (val: string) => {
      setInputValue(val);
      const n = parseFloat(val) || 0;
      if (rate && isValidAmount(n) && onAmountChange) {
        const conv = direction === 'ngn-to-usdc' ? ngnToUsdc(n, rate) : usdcToNgn(n, rate);
        const ngnAmt = direction === 'ngn-to-usdc' ? n : conv.outputAmount;
        const usdcAmt = direction === 'ngn-to-usdc' ? conv.outputAmount : n;
        onAmountChange(ngnAmt, usdcAmt, rate);
      }
    },
    [rate, direction, onAmountChange]
  );

  const toggleDirection = () => {
    setDirection((d) => (d === 'ngn-to-usdc' ? 'usdc-to-ngn' : 'ngn-to-usdc'));
    setInputValue('');
  };

  const fromLabel = direction === 'ngn-to-usdc' ? 'NGN (Nigerian Naira)' : 'USDC';
  const toLabel = direction === 'ngn-to-usdc' ? 'USDC' : 'NGN (Nigerian Naira)';
  const fromPrefix = direction === 'ngn-to-usdc' ? '₦' : '$';
  const toPrefix = direction === 'ngn-to-usdc' ? '$' : '₦';

  return (
    <div
      style={{
        backgroundColor: bg,
        borderRadius: '12px',
        border: `1px solid ${border}`,
        padding: '20px',
        color: text,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontWeight: 700, fontSize: '15px' }}>Convert</span>
        <button
          onClick={refresh}
          disabled={isLoading}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#3b82f6',
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          {isLoading ? 'Updating...' : '↻ Refresh rate'}
        </button>
      </div>

      {/* From field */}
      <div style={{ marginBottom: '8px' }}>
        <label style={{ fontSize: '12px', color: subtle, marginBottom: '4px', display: 'block' }}>
          {fromLabel}
        </label>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: inputBg,
            border: `1px solid ${border}`,
            borderRadius: '8px',
            padding: '10px 12px',
            gap: '8px',
          }}
        >
          <span style={{ color: subtle, fontWeight: 600 }}>{fromPrefix}</span>
          <input
            type="number"
            min="0"
            step="any"
            value={inputValue}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="0.00"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '18px',
              fontWeight: 600,
              background: 'transparent',
              color: text,
            }}
          />
        </div>
      </div>

      {/* Swap button */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
        <button
          onClick={toggleDirection}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: `1px solid ${border}`,
            backgroundColor: cardBg,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: text,
          }}
          title="Swap direction"
          aria-label="Swap conversion direction"
        >
          ⇅
        </button>
      </div>

      {/* To field (read-only) */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', color: subtle, marginBottom: '4px', display: 'block' }}>
          {toLabel}
        </label>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: cardBg,
            border: `1px solid ${border}`,
            borderRadius: '8px',
            padding: '10px 12px',
            gap: '8px',
          }}
        >
          <span style={{ color: subtle, fontWeight: 600 }}>{toPrefix}</span>
          <span style={{ flex: 1, fontSize: '18px', fontWeight: 600, color: result ? '#10b981' : subtle }}>
            {result
              ? result.outputAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })
              : '0.00'}
          </span>
        </div>
      </div>

      {/* Rate info */}
      {rate && (
        <div
          style={{
            backgroundColor: cardBg,
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '13px',
            color: subtle,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Rate</span>
          <span style={{ fontWeight: 600, color: text }}>1 USDC = ₦{rate.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};
