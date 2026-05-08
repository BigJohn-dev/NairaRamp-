import React, { useState, useCallback, useEffect } from 'react';
import { useNairaRamp } from './NairaRampProvider';
import {
  initiateSEPFlow,
  discoverAnchors,
  getTransactionStatus,
  getExchangeRates,
  Anchor,
  Transaction,
} from './stellar';
import styles from './RampWidget.module.css';

type RampType = 'deposit' | 'withdrawal';
type WidgetStep = 'amount' | 'details' | 'anchor' | 'processing' | 'success' | 'error';

interface RampWidgetProps {
  type: RampType;
  onSuccess?: (transaction: Transaction) => void;
  onError?: (error: Error) => void;
  amount?: number;
  theme?: 'light' | 'dark';
  showAnchorSelection?: boolean;
  requireWalletAddress?: boolean;
}

export const RampWidget: React.FC<RampWidgetProps> = ({
  type,
  onSuccess,
  onError,
  amount,
  theme = 'light',
  showAnchorSelection = true,
  requireWalletAddress = false,
}) => {
  const { apiKey } = useNairaRamp();
  const [step, setStep] = useState<WidgetStep>('amount');
  const [isLoading, setIsLoading] = useState(false);
  const [inputAmount, setInputAmount] = useState<number | undefined>(amount);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [selectedAnchor, setSelectedAnchor] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  // Discover available anchors on mount
  useEffect(() => {
    const fetchAnchors = async () => {
      try {
        const availableAnchors = await discoverAnchors();
        setAnchors(availableAnchors);
        if (availableAnchors.length > 0) {
          setSelectedAnchor(availableAnchors[0].domain);
        }
      } catch (err) {
        console.error('Failed to fetch anchors:', err);
      }
    };

    if (showAnchorSelection) {
      fetchAnchors();
    }
  }, [showAnchorSelection]);

  // Get exchange rates when anchor changes
  useEffect(() => {
    const fetchRates = async () => {
      if (selectedAnchor && inputAmount) {
        try {
          const rates = await getExchangeRates(selectedAnchor);
          setExchangeRate(type === 'deposit' ? rates.buyRate : rates.sellRate);
        } catch (err) {
          console.error('Failed to fetch rates:', err);
        }
      }
    };

    fetchRates();
  }, [selectedAnchor, inputAmount, type]);

  // Poll transaction status
  useEffect(() => {
    if (transaction && (transaction.status === 'pending' || transaction.status === 'processing')) {
      const interval = setInterval(async () => {
        try {
          const updated = await getTransactionStatus(apiKey, transaction.id);
          setTransaction(updated);

          if (updated.status === 'completed') {
            setStep('success');
            clearInterval(interval);
            onSuccess?.(updated);
          } else if (updated.status === 'failed') {
            setError('Transaction failed. Please try again.');
            setStep('error');
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Failed to check transaction status:', err);
        }
      }, 3000); // Check every 3 seconds

      setStatusCheckInterval(interval);
      return () => clearInterval(interval);
    }
  }, [transaction, apiKey, onSuccess]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInitiate = useCallback(async () => {
    if (!inputAmount || inputAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (requireWalletAddress && !walletAddress) {
      setError('Wallet address is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStep('processing');

    try {
      const result = await initiateSEPFlow({
        apiKey,
        type,
        amount: inputAmount,
        walletAddress: requireWalletAddress ? walletAddress : undefined,
        customerEmail: email,
        anchorDomain: selectedAnchor,
      });

      const tx: Transaction = {
        id: result.id,
        amount: inputAmount,
        assetCode: 'USDC',
        status: 'pending',
        type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        anchorDomain: result.anchorDomain,
      };

      setTransaction(tx);

      // Open interactive URL if available
      if (result.interactiveUrl) {
        window.open(result.interactiveUrl, '_blank');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error.message);
      setStep('error');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    inputAmount,
    email,
    walletAddress,
    type,
    apiKey,
    selectedAnchor,
    requireWalletAddress,
    onError,
  ]);

  const handleReset = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }
    setStep('amount');
    setInputAmount(undefined);
    setEmail('');
    setWalletAddress('');
    setTransaction(null);
    setError(null);
  };

  return (
    <div className={`${styles.widget} ${styles[theme]}`}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          {type === 'deposit' ? '📥 Fund Your Account' : '📤 Withdraw Funds'}
        </h2>

        {step === 'success' && transaction ? (
          <div className={styles.success}>
            <p className={styles.successMessage}>✓ Transaction initiated!</p>
            <p className={styles.transactionId}>ID: {transaction.id}</p>
            <p className={styles.transactionDetails}>
              Amount: ₦{inputAmount?.toLocaleString()} USDC
            </p>
            <p className={styles.statusBadge} style={{ color: '#10b981' }}>
              Status: {transaction.status.toUpperCase()}
            </p>
            <button className={styles.resetButton} onClick={handleReset}>
              Start New Transaction
            </button>
          </div>
        ) : step === 'error' ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>❌ {error}</p>
            <button className={styles.retryButton} onClick={handleReset}>
              Try Again
            </button>
          </div>
        ) : step === 'processing' || transaction?.status === 'processing' ? (
          <div className={styles.processing}>
            <div className={styles.spinner}></div>
            <p>Processing your transaction...</p>
            {transaction && (
              <p className={styles.transactionId}>ID: {transaction.id}</p>
            )}
          </div>
        ) : (
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleInitiate();
            }}
          >
            {/* Amount Input */}
            <div className={styles.formGroup}>
              <label htmlFor="amount" className={styles.label}>
                Amount (NGN)
              </label>
              <input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={inputAmount || ''}
                onChange={(e) => setInputAmount(e.target.value ? parseFloat(e.target.value) : undefined)}
                className={styles.input}
                min="1"
                disabled={isLoading}
              />
              {inputAmount && exchangeRate > 0 && (
                <p className={styles.hint}>
                  ≈ ${(inputAmount / exchangeRate).toFixed(2)} USDC
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                disabled={isLoading}
              />
            </div>

            {/* Wallet Address (if required) */}
            {requireWalletAddress && (
              <div className={styles.formGroup}>
                <label htmlFor="wallet" className={styles.label}>
                  Wallet Address
                </label>
                <input
                  id="wallet"
                  type="text"
                  placeholder="G..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className={styles.input}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Anchor Selection */}
            {showAnchorSelection && anchors.length > 0 && (
              <div className={styles.formGroup}>
                <label htmlFor="anchor" className={styles.label}>
                  Provider
                </label>
                <select
                  id="anchor"
                  value={selectedAnchor}
                  onChange={(e) => setSelectedAnchor(e.target.value)}
                  className={styles.select}
                  disabled={isLoading}
                >
                  {anchors.map((anchor) => (
                    <option key={anchor.domain} value={anchor.domain}>
                      {anchor.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Error Message */}
            {error && <div className={styles.error}>{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || !inputAmount || !email}
            >
              {isLoading ? 'Processing...' : `${type === 'deposit' ? 'Deposit' : 'Withdraw'} NGN`}
            </button>

            {/* Disclaimer */}
            <p className={styles.disclaimer}>
              🔒 KYC verification may be required. All transactions are securely processed via Stellar Network.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
