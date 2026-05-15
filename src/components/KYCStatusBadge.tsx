import React from 'react';
import type { KYCStatus } from '../hooks/useKYCStatus';

interface KYCStatusBadgeProps {
  status: KYCStatus;
  message?: string;
  compact?: boolean;
}

const KYC_CONFIG: Record<
  KYCStatus,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  approved: {
    label: 'KYC Approved',
    icon: '✓',
    color: '#065f46',
    bg: '#d1fae5',
    border: '#a7f3d0',
  },
  pending: {
    label: 'KYC Pending',
    icon: '⏳',
    color: '#92400e',
    bg: '#fef3c7',
    border: '#fde68a',
  },
  rejected: {
    label: 'KYC Rejected',
    icon: '✗',
    color: '#991b1b',
    bg: '#fee2e2',
    border: '#fecaca',
  },
  none: {
    label: 'Verification Required',
    icon: '!',
    color: '#1e3a8a',
    bg: '#dbeafe',
    border: '#bfdbfe',
  },
};

/** Displays KYC verification status with optional detail message. */
export const KYCStatusBadge: React.FC<KYCStatusBadgeProps> = ({
  status,
  message,
  compact = false,
}) => {
  const cfg = KYC_CONFIG[status];

  if (compact) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          backgroundColor: cfg.bg,
          color: cfg.color,
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 600,
          border: `1px solid ${cfg.border}`,
        }}
      >
        {cfg.icon} {cfg.label}
      </span>
    );
  }

  return (
    <div
      role="status"
      style={{
        padding: '12px 14px',
        backgroundColor: cfg.bg,
        borderRadius: '8px',
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
        <span style={{ fontSize: '16px' }}>{cfg.icon}</span>
        <span>{cfg.label}</span>
      </div>
      {message && (
        <p style={{ margin: '6px 0 0 0', fontSize: '13px', opacity: 0.85 }}>{message}</p>
      )}
    </div>
  );
};
