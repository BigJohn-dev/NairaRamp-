import React, { useState } from 'react';
import { 
  NairaRampProvider, 
  RampWidget,
  Transaction,
  discoverAnchors,
  Anchor
} from '@nairaramp/sdk-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdrawal'>('deposit');
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [showAnchorList, setShowAnchorList] = useState(false);

  const handleDiscoverAnchors = async () => {
    try {
      const discovered = await discoverAnchors();
      setAnchors(discovered);
      setShowAnchorList(true);
    } catch (error) {
      console.error('Failed to discover anchors:', error);
    }
  };

  const handleSuccess = (tx: Transaction) => {
    setLastTransaction(tx);
    console.log('✅ Transaction successful!', tx);
  };

  const handleError = (error: Error) => {
    console.error('❌ Transaction failed:', error.message);
  };

  return (
    <NairaRampProvider apiKey={process.env.REACT_APP_NAIRARAMP_API_KEY || "pk_test_demo"}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>💰 NairaRamp SDK Demo</h1>
          <p style={styles.subtitle}>
            Seamless NGN ↔ USDC On/Off Ramps powered by Stellar
          </p>
        </div>

        {/* Anchor Discovery Section */}
        <div style={styles.card}>
          <h2>🏦 Available Anchors</h2>
          <button 
            onClick={handleDiscoverAnchors}
            style={styles.button}
          >
            Discover Anchors
          </button>
          
          {showAnchorList && anchors.length > 0 && (
            <div style={styles.anchorList}>
              {anchors.map((anchor) => (
                <div key={anchor.domain} style={styles.anchorCard}>
                  <h3>{anchor.displayName}</h3>
                  <p><strong>Domain:</strong> {anchor.domain}</p>
                  <p><strong>SEP-24:</strong> {anchor.sep24Supported ? '✅' : '❌'}</p>
                  <p><strong>SEP-6:</strong> {anchor.sep6Supported ? '✅' : '❌'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('deposit')}
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'deposit' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'deposit' ? 'white' : '#333',
            }}
          >
            📥 Deposit Funds
          </button>
          <button
            onClick={() => setActiveTab('withdrawal')}
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'withdrawal' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'withdrawal' ? 'white' : '#333',
            }}
          >
            📤 Withdraw Funds
          </button>
        </div>

        {/* Widgets */}
        <div style={styles.widgetsContainer}>
          {activeTab === 'deposit' && (
            <div style={styles.widgetWrapper}>
              <RampWidget 
                type="deposit"
                amount={50000}
                theme="light"
                showAnchorSelection={true}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          )}

          {activeTab === 'withdrawal' && (
            <div style={styles.widgetWrapper}>
              <RampWidget 
                type="withdrawal"
                theme="light"
                showAnchorSelection={true}
                requireWalletAddress={false}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          )}
        </div>

        {/* Transaction History */}
        {lastTransaction && (
          <div style={styles.card}>
            <h2>📊 Last Transaction</h2>
            <div style={styles.transactionDetails}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Transaction ID:</span>
                <code style={styles.detailValue}>{lastTransaction.id}</code>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Type:</span>
                <span style={styles.detailValue}>
                  {lastTransaction.type === 'deposit' ? '📥 Deposit' : '📤 Withdrawal'}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Amount:</span>
                <span style={styles.detailValue}>
                  ₦{lastTransaction.amount.toLocaleString()} NGN
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>USDC Equivalent:</span>
                <span style={styles.detailValue}>
                  ${(lastTransaction.amount / 1600).toFixed(2)} USDC
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status:</span>
                <span 
                  style={{
                    ...styles.detailValue,
                    backgroundColor: {
                      'pending': '#fef3c7',
                      'processing': '#dbeafe',
                      'completed': '#dcfce7',
                      'failed': '#fee2e2'
                    }[lastTransaction.status] || '#f3f4f6',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}
                >
                  {lastTransaction.status.toUpperCase()}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Anchor:</span>
                <span style={styles.detailValue}>{lastTransaction.anchorDomain}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Initiated:</span>
                <span style={styles.detailValue}>
                  {new Date(lastTransaction.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div style={styles.card}>
          <h2>✨ SDK Features</h2>
          <div style={styles.featuresList}>
            <div style={styles.featureItem}>
              <span>✅</span> SEP-24 Interactive Flow
            </div>
            <div style={styles.featureItem}>
              <span>✅</span> SEP-6 Direct Transfers
            </div>
            <div style={styles.featureItem}>
              <span>✅</span> Automatic Anchor Discovery
            </div>
            <div style={styles.featureItem}>
              <span>✅</span> Real-time Exchange Rates
            </div>
            <div style={styles.featureItem}>
              <span>✅</span> KYC Management
            </div>
            <div style={styles.featureItem}>
              <span>✅</span> Transaction Status Monitoring
            </div>
            <div style={styles.featureItem}>
              <span>✅</span> TypeScript Support
            </div>
            <div style={styles.featureItem}>
              <span>✅</span> Light & Dark Themes
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p>
            Built with ❤️ for the Nigerian developer community
          </p>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>
            Powered by Stellar Network | Learn more at{' '}
            <a href="https://docs.nairaramp.io" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              docs.nairaramp.io
            </a>
          </p>
        </div>
      </div>
    </NairaRampProvider>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e5e7eb',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
  },
  tabButton: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: 1,
  } as React.CSSProperties,
  widgetsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  widgetWrapper: {
    maxWidth: '400px',
    width: '100%',
  },
  anchorList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginTop: '16px',
  },
  anchorCard: {
    padding: '16px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  },
  transactionDetails: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e5e7eb',
  } as React.CSSProperties,
  detailLabel: {
    fontWeight: 'bold',
    color: '#4b5563',
  },
  detailValue: {
    fontFamily: 'monospace',
    color: '#1f2937',
    wordBreak: 'break-all' as const,
  },
  featuresList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  featureItem: {
    padding: '12px',
    backgroundColor: '#f0fdf4',
    borderRadius: '6px',
    color: '#15803d',
    fontWeight: '500',
  },
  footer: {
    textAlign: 'center' as const,
    padding: '24px',
    color: '#6b7280',
    fontSize: '14px',
  },
};

export default App;
