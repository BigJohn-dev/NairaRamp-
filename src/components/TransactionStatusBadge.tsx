import React from 'react';

type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; color: string; bg: string; dotColor: string; pulse: boolean }
> = {
  pending: {
    label: 'Pending',
    color: '#92400e',
    bg: '#fef3c7',
    dotColor: '#f59e0b',
    pulse: true,
  },
  processing: {
    label: 'Processing',
    color: '#1e40af',
    bg: '#dbeafe',
    dotColor: '#3b82f6',
    pulse: true,
  },
  completed: {
    label: 'Completed',
    color: '#065f46',
    bg: '#d1fae5',
    dotColor: '#10b981',
    pulse: false,
  },
  failed: {
    label: 'Failed',
    color: '#991b1b',
    bg: '#fee2e2',
    dotColor: '#ef4444',
    pulse: false,
  },
};

const SIZE_MAP = {
  sm: { fontSize: '11px', padding: '2px 8px', dotSize: '5px' },
  md: { fontSize: '13px', padding: '4px 10px', dotSize: '6px' },
  lg: { fontSize: '15px', padding: '6px 14px', dotSize: '8px' },
};

/** Visual badge indicating a transaction's current status. */
export const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const cfg = STATUS_CONFIG[status];
  const sz = SIZE_MAP[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: sz.padding,
        backgroundColor: cfg.bg,
        color: cfg.color,
        borderRadius: '9999px',
        fontSize: sz.fontSize,
        fontWeight: 600,
        letterSpacing: '0.02em',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          width: sz.dotSize,
          height: sz.dotSize,
          borderRadius: '50%',
          backgroundColor: cfg.dotColor,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
};
