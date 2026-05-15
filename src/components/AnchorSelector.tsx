import React from 'react';
import { useAnchorDiscovery } from '../hooks/useAnchorDiscovery';

interface AnchorSelectorProps {
  value: string;
  onChange: (domain: string) => void;
  type?: 'deposit' | 'withdrawal';
  disabled?: boolean;
}

/** Card-based anchor selector that highlights the best-rate provider. */
export const AnchorSelector: React.FC<AnchorSelectorProps> = ({
  value,
  onChange,
  type = 'deposit',
  disabled = false,
}) => {
  const { anchorsWithRates, bestDepositAnchor, bestWithdrawalAnchor, isLoading } =
    useAnchorDiscovery();

  const bestAnchor = type === 'deposit' ? bestDepositAnchor : bestWithdrawalAnchor;

  if (isLoading && anchorsWithRates.length === 0) {
    return (
      <div style={{ fontSize: '14px', color: '#6b7280', padding: '8px 0' }}>
        Discovering providers...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {anchorsWithRates.map((anchor) => {
        const isSelected = value === anchor.domain;
        const isBest = bestAnchor?.domain === anchor.domain;
        const displayRate = type === 'deposit' ? anchor.buyRate : anchor.sellRate;

        return (
          <div
            key={anchor.domain}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onClick={() => !disabled && onChange(anchor.domain)}
            onKeyDown={(e) => e.key === 'Enter' && !disabled && onChange(anchor.domain)}
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
              opacity: disabled ? 0.7 : 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              outline: 'none',
              transition: 'border-color 0.15s, background-color 0.15s',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#1f2937' }}>
                {anchor.displayName}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                {[anchor.sep24Supported && 'SEP-24', anchor.sep6Supported && 'SEP-6']
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              {displayRate !== null && (
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  ₦{displayRate.toLocaleString()}
                </div>
              )}
              {isBest && (
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '4px',
                    fontSize: '10px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}
                >
                  Best Rate
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
