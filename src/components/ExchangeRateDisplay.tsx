import React from 'react';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { ngnToUsdc, formatNGN, formatUSDC } from '../stellar-utils';

interface ExchangeRateDisplayProps {
  anchorDomain: string;
  /** NGN amount to show the conversion for */
  amount?: number;
  type?: 'deposit' | 'withdrawal';
  autoRefresh?: boolean;
  /** Refresh interval in ms. Default: 30000 */
  refreshInterval?: number;
  /** Compact single-line display */
  compact?: boolean;
  className?: string;
}

/** Display live exchange rates with optional auto-refresh and conversion preview. */
export const ExchangeRateDisplay: React.FC<ExchangeRateDisplayProps> = ({
  anchorDomain,
  amount,
  type = 'deposit',
  autoRefresh = true,
  refreshInterval = 30_000,
  compact = false,
}) => {
  const { rates, isLoading, error, lastUpdated, refresh } = useExchangeRates(anchorDomain, {
    autoRefresh,
    refreshInterval,
  });

  if (error) return null;

  const rate = rates ? (type === 'deposit' ? rates.buyRate : rates.sellRate) : null;
  const conversion = rate && amount && amount > 0 ? ngnToUsdc(amount, rate) : null;

  if (compact) {
    return (
      <span style={{ fontSize: '12px', color: '#6b7280' }}>
        {isLoading && !rate ? 'Loading rate...' : rate ? `1 USDC = ₦${rate.toLocaleString()}` : null}
      </span>
    );
  }

  return (
    <div
      style={{
        padding: '12px 14px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #bae6fd',
        fontSize: '14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: rate ? '8px' : 0,
        }}
      >
        <span style={{ fontWeight: 600, color: '#0c4a6e', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Live Rate
        </span>
        <button
          onClick={refresh}
          disabled={isLoading}
          style={{
            background: 'none',
            border: 'none',
            cursor: isLoading ? 'default' : 'pointer',
            fontSize: '12px',
            color: '#0284c7',
            padding: '2px 4px',
            opacity: isLoading ? 0.5 : 1,
          }}
          aria-label="Refresh exchange rate"
        >
          {isLoading ? '...' : '↻ Refresh'}
        </button>
      </div>

      {rate && (
        <>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#0369a1' }}>
            1 USDC = ₦{rate.toLocaleString()}
          </div>

          {conversion && (
            <div style={{ marginTop: '6px', color: '#075985', fontSize: '13px' }}>
              {formatNGN(conversion.inputAmount)} ≈{' '}
              <strong>{formatUSDC(conversion.outputAmount)}</strong>
            </div>
          )}

          {lastUpdated && (
            <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
              Updated {lastUpdated.toLocaleTimeString()}
              {autoRefresh && ' · auto-refresh on'}
            </div>
          )}
        </>
      )}
    </div>
  );
};
