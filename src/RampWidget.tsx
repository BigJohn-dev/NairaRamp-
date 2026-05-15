import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNairaRamp } from './NairaRampProvider';
import { initiateSEPFlow, getTransactionStatus, Transaction } from './stellar';
import { useExchangeRates } from './hooks/useExchangeRates';
import { useAnchorDiscovery } from './hooks/useAnchorDiscovery';
import { isValidEmail, isValidStellarAddress, ngnToUsdc, formatNGN, formatUSDC } from './stellar-utils';
import { TransactionStatusBadge } from './components/TransactionStatusBadge';
import styles from './RampWidget.module.css';

type RampType = 'deposit' | 'withdrawal';
type WidgetStep = 'form' | 'processing' | 'success' | 'error';

interface RampWidgetProps {
  type: RampType;
  onSuccess?: (transaction: Transaction) => void;
  onError?: (error: Error) => void;
  /** Pre-fill the NGN amount */
  amount?: number;
  theme?: 'light' | 'dark';
  showAnchorSelection?: boolean;
  requireWalletAddress?: boolean;
  /** Minimum allowed amount in NGN. Default: 100 */
  minAmount?: number;
  /** Maximum allowed amount in NGN */
  maxAmount?: number;
}

export const RampWidget: React.FC<RampWidgetProps> = ({
  type,
  onSuccess,
  onError,
  amount: defaultAmount,
  theme = 'light',
  showAnchorSelection = true,
  requireWalletAddress = false,
  minAmount = 100,
  maxAmount,
}) => {
  const { apiKey, onTransaction } = useNairaRamp();

  const [step, setStep] = useState<WidgetStep>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [inputAmount, setInputAmount] = useState<number | undefined>(defaultAmount);
  const [walletAddress, setWalletAddress] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAnchor, setSelectedAnchor] = useState('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Anchor discovery
  const { anchors, bestDepositAnchor, isLoading: anchorsLoading } = useAnchorDiscovery();

  // Auto-select best anchor when anchors load
  useEffect(() => {
    if (!selectedAnchor && anchors.length > 0) {
      const best = type === 'deposit' ? bestDepositAnchor : anchors[0];
      setSelectedAnchor(best?.domain || anchors[0].domain);
    }
  }, [anchors, bestDepositAnchor, selectedAnchor, type]);

  // Live exchange rate for selected anchor
  const { rates } = useExchangeRates(selectedAnchor, { autoRefresh: true, refreshInterval: 30_000 });
  const rate = rates ? (type === 'deposit' ? rates.buyRate : rates.sellRate) : null;
  const conversion = rate && inputAmount && inputAmount > 0 ? ngnToUsdc(inputAmount, rate) : null;

  // Poll transaction status
  useEffect(() => {
    if (!transaction || (transaction.status !== 'pending' && transaction.status !== 'processing')) {
      return;
    }

    intervalRef.current = setInterval(async () => {
      try {
        const updated = await getTransactionStatus(apiKey, transaction.id);
        setTransaction(updated);

        if (updated.status === 'completed') {
          clearInterval(intervalRef.current!);
          setStep('success');
          onTransaction?.(updated, 'completed');
          onSuccess?.(updated);
        } else if (updated.status === 'failed') {
          clearInterval(intervalRef.current!);
          setError(updated.message || 'Transaction failed. Please try again.');
          setStep('error');
          onTransaction?.(updated, 'failed');
          onError?.(new Error(updated.message || 'Transaction failed'));
        }
      } catch {
        // Continue polling on transient errors
      }
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [transaction, apiKey, onSuccess, onError, onTransaction]);

  const validate = (): string | null => {
    if (!inputAmount || inputAmount < minAmount) {
      return `Minimum amount is ${formatNGN(minAmount)}`;
    }
    if (maxAmount && inputAmount > maxAmount) {
      return `Maximum amount is ${formatNGN(maxAmount)}`;
    }
    if (!email || !isValidEmail(email)) {
      return 'Please enter a valid email address';
    }
    if (requireWalletAddress && !walletAddress) {
      return 'A Stellar wallet address is required';
    }
    if (requireWalletAddress && walletAddress && !isValidStellarAddress(walletAddress)) {
      return 'Please enter a valid Stellar wallet address (starts with G)';
    }
    return null;
  };

  const handleSubmit = useCallback(async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await initiateSEPFlow({
        apiKey,
        type,
        amount: inputAmount!,
        walletAddress: requireWalletAddress ? walletAddress : undefined,
        customerEmail: email,
        anchorDomain: selectedAnchor,
      });

      const tx: Transaction = {
        id: result.id,
        amount: inputAmount!,
        assetCode: 'USDC',
        status: 'pending',
        type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        anchorDomain: result.anchorDomain,
      };

      setTransaction(tx);
      setStep('processing');
      onTransaction?.(tx, 'initiated');

      if (result.interactiveUrl) {
        window.open(result.interactiveUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      const caught = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(caught.message);
      setStep('error');
      onError?.(caught);
    } finally {
      setIsLoading(false);
    }
  }, [
    inputAmount, email, walletAddress, type, apiKey, selectedAnchor,
    requireWalletAddress, minAmount, maxAmount, onError, onTransaction,
  ]);

  const handleReset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStep('form');
    setInputAmount(defaultAmount);
    setEmail('');
    setWalletAddress('');
    setTransaction(null);
    setError(null);
    setIsLoading(false);
  }, [defaultAmount]);

  // ── Render ──────────────────────────────────────────────────────────────────

  const widgetClass = [styles.widget, styles[theme]].join(' ');

  return (
    <div className={widgetClass}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          {type === 'deposit' ? 'Deposit NGN' : 'Withdraw NGN'}
        </h2>

        {/* ── Success ── */}
        {step === 'success' && transaction && (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <p className={styles.successMessage}>Transaction Initiated</p>
            <div className={styles.txDetails}>
              <div className={styles.txRow}>
                <span className={styles.txLabel}>Amount</span>
                <span className={styles.txValue}>{formatNGN(transaction.amount)}</span>
              </div>
              {conversion && (
                <div className={styles.txRow}>
                  <span className={styles.txLabel}>Equivalent</span>
                  <span className={styles.txValue}>{formatUSDC(conversion.outputAmount)}</span>
                </div>
              )}
              <div className={styles.txRow}>
                <span className={styles.txLabel}>Status</span>
                <TransactionStatusBadge status={transaction.status} size="sm" />
              </div>
              <div className={styles.txRow}>
                <span className={styles.txLabel}>ID</span>
                <code className={styles.txId}>{transaction.id}</code>
              </div>
            </div>
            <button className={styles.resetButton} onClick={handleReset}>
              New Transaction
            </button>
          </div>
        )}

        {/* ── Error ── */}
        {step === 'error' && (
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>✕</div>
            <p className={styles.errorMessage}>{error}</p>
            <button className={styles.retryButton} onClick={handleReset}>
              Try Again
            </button>
          </div>
        )}

        {/* ── Processing ── */}
        {step === 'processing' && (
          <div className={styles.processing}>
            <div className={styles.spinner} />
            <p className={styles.processingText}>Processing your transaction...</p>
            {transaction && (
              <>
                <TransactionStatusBadge status={transaction.status} />
                <p className={styles.processingHint}>
                  Keep this window open. Status updates automatically.
                </p>
                <code className={styles.txId}>{transaction.id}</code>
              </>
            )}
          </div>
        )}

        {/* ── Form ── */}
        {step === 'form' && (
          <form
            className={styles.form}
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            noValidate
          >
            {/* Amount */}
            <div className={styles.formGroup}>
              <label htmlFor="nr-amount" className={styles.label}>
                Amount (NGN)
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputPrefix}>₦</span>
                <input
                  id="nr-amount"
                  type="number"
                  placeholder="0"
                  min={minAmount}
                  max={maxAmount}
                  value={inputAmount ?? ''}
                  onChange={(e) =>
                    setInputAmount(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className={styles.input}
                  disabled={isLoading}
                  aria-label="Amount in NGN"
                />
              </div>
              {conversion && (
                <p className={styles.hint}>
                  ≈ {formatUSDC(conversion.outputAmount)}{' '}
                  {rate && (
                    <span className={styles.rateHint}>
                      @ ₦{rate.toLocaleString()}/USDC
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label htmlFor="nr-email" className={styles.label}>
                Email Address
              </label>
              <input
                id="nr-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Wallet Address */}
            {requireWalletAddress && (
              <div className={styles.formGroup}>
                <label htmlFor="nr-wallet" className={styles.label}>
                  Stellar Wallet Address
                </label>
                <input
                  id="nr-wallet"
                  type="text"
                  placeholder="G..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value.trim())}
                  className={styles.input}
                  disabled={isLoading}
                  spellCheck={false}
                  autoComplete="off"
                />
                {walletAddress && !isValidStellarAddress(walletAddress) && (
                  <p className={styles.fieldError}>Invalid Stellar address</p>
                )}
              </div>
            )}

            {/* Anchor Selector */}
            {showAnchorSelection && (
              <div className={styles.formGroup}>
                <label htmlFor="nr-anchor" className={styles.label}>
                  Provider
                </label>
                {anchorsLoading ? (
                  <p className={styles.hint}>Discovering providers...</p>
                ) : (
                  <select
                    id="nr-anchor"
                    value={selectedAnchor}
                    onChange={(e) => setSelectedAnchor(e.target.value)}
                    className={styles.select}
                    disabled={isLoading}
                  >
                    {anchors.map((a) => (
                      <option key={a.domain} value={a.domain}>
                        {a.displayName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Error banner */}
            {error && step === 'form' && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || !inputAmount || !email}
            >
              {isLoading
                ? 'Initiating...'
                : type === 'deposit'
                ? 'Deposit NGN'
                : 'Withdraw NGN'}
            </button>

            <p className={styles.disclaimer}>
              Secured via Stellar Network · KYC may be required
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
