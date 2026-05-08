
# 🔁 NairaRamp SDK

### **The easiest way to integrate NGN ↔ USDC On/Off Ramps into your Nigerian App.**

**NairaRamp** is an open-source, developer-first SDK designed to bridge the gap between the Nigerian Naira (NGN) and USDC using the **Stellar Network**. It abstracts the complexity of Stellar Ecosystem Proposals (SEPs), specifically **SEP-24** and **SEP-6**, allowing you to add crypto-fiat on/off ramps with just a few lines of code.

Built with TypeScript and React, NairaRamp provides both pre-built UI components and low-level APIs for maximum flexibility.

---

## 🚀 Why NairaRamp?

Nigeria is the largest crypto market in Africa, yet developers still struggle with the friction of integrating reliable, compliant, and low-cost on/off ramps.

*   **Stellar Native:** Built on the Stellar network for near-instant settlement and sub-cent fees.
*   **Developer First:** Ready-made React components and a clean TypeScript API.
*   **Anchor Agnostic:** Automatically discovers and connects to the best Stellar Anchors for competitive NGN rates.
*   **Open Source:** Fully transparent and community-driven.
*   **SEP-24 & SEP-6 Support:** Full support for both interactive (SEP-24) and direct (SEP-6) transfer protocols.
*   **KYC Management:** Built-in hooks to handle identity verification requirements with anchors.
*   **Real-time Status:** Poll transaction status and get real-time updates.

---

## 📦 Installation

```bash
npm install @nairaramp/sdk-react
# or
yarn add @nairaramp/sdk-react
```

### Prerequisites
- React 18.0 or higher
- Node.js 14.0 or higher

---

## 🛠 Quick Start

### 1. Initialize the Provider
Wrap your application with the `NairaRampProvider` to provide API credentials.

```jsx
import { NairaRampProvider } from '@nairaramp/sdk-react';

function App() {
  return (
    <NairaRampProvider apiKey="your-public-api-key">
      <YourApp />
    </NairaRampProvider>
  );
}
```

### 2. Add the Ramp Widget
Drop in the pre-built UI component to handle deposits and withdrawals with automatic anchor selection and KYC flow.

```jsx
import { RampWidget } from '@nairaramp/sdk-react';

const OnRampPage = () => {
  return (
    <div>
      <h1>Fund your Account</h1>
      <RampWidget 
        type="deposit" 
        onSuccess={(tx) => {
          console.log('Deposit successful!', tx);
          console.log(`Transaction ID: ${tx.id}`);
          console.log(`Amount: ₦${tx.amount}`);
        }}
        onError={(error) => {
          console.error('Deposit failed:', error.message);
        }}
      />
    </div>
  );
}
```

---

## ✨ Core Features

### 🎨 RampWidget Component
The main UI component for on/off-ramp flows with the following features:

- **Automatic Anchor Discovery:** Discovers available Stellar anchors in the NGN/USDC pair
- **Real-time Exchange Rates:** Displays live buy/sell rates for selected anchor
- **KYC Integration:** Seamless KYC flow with anchor verification
- **Transaction Polling:** Automatically monitors transaction status
- **Responsive Design:** Mobile-optimized for the Nigerian mobile-first market
- **Themable:** Light and dark mode support
- **Email Verification:** Built-in email validation
- **Wallet Integration:** Optional wallet address requirement for SEP-6 flows

#### RampWidget Props

```typescript
interface RampWidgetProps {
  type: 'deposit' | 'withdrawal';           // Type of transaction
  onSuccess?: (transaction: Transaction) => void;  // Success callback
  onError?: (error: Error) => void;         // Error callback
  amount?: number;                          // Pre-filled amount (optional)
  theme?: 'light' | 'dark';                 // Theme (default: 'light')
  showAnchorSelection?: boolean;            // Show anchor selector (default: true)
  requireWalletAddress?: boolean;           // Require Stellar wallet address (default: false)
}
```

#### Transaction Object

```typescript
interface Transaction {
  id: string;                               // Unique transaction ID
  status: 'pending' | 'completed' | 'failed' | 'processing';
  amount: number;                           // Amount in NGN
  assetCode: string;                        // Asset code (USDC)
  type: 'deposit' | 'withdrawal';
  createdAt: string;                        // ISO timestamp
  updatedAt: string;                        // ISO timestamp
  anchorDomain?: string;                    // Selected anchor domain
}
```

### 🌐 SEP-24/SEP-6 Protocol Support

#### SEP-24 (Interactive Flow)
Best for KYC-required transactions. Opens an interactive window for user verification.

```typescript
import { initiateSEP24Flow } from '@nairaramp/sdk-react';

const result = await initiateSEP24Flow({
  apiKey: 'your-api-key',
  type: 'deposit',
  amount: 50000,
  customerEmail: 'user@example.com',
  anchorDomain: 'flutterwave.com'
});

// Opens interactive URL for KYC
if (result.interactiveUrl) {
  window.open(result.interactiveUrl, '_blank');
}
```

#### SEP-6 (Direct Flow)
For direct transfers without interactive KYC. Requires wallet address.

```typescript
import { initiateSEP6Flow } from '@nairaramp/sdk-react';

const result = await initiateSEP6Flow({
  apiKey: 'your-api-key',
  type: 'deposit',
  amount: 50000,
  walletAddress: 'GBUQWP3BOUZX34ULNQG23RQ6F4BFXWBVMODYX42VYQP6FBIHXF2XY7ZO',
  customerEmail: 'user@example.com'
});
```

### 🏦 Anchor Discovery & Management

Automatically discover available NGN anchors:

```typescript
import { discoverAnchors } from '@nairaramp/sdk-react';

const anchors = await discoverAnchors();
console.log(anchors);
// Output:
// [
//   {
//     name: 'flutterwave',
//     domain: 'flutterwave.com',
//     displayName: 'Flutterwave',
//     supportedAssets: [
//       { code: 'NGN', issuer: '' },
//       { code: 'USDC', issuer: 'GBBD47AB6P5X574CM6I63QS5BVYSDJD3G7WKBPXQKCDRNL4D5XWDRBE' }
//     ],
//     sep24Supported: true,
//     sep6Supported: true
//   },
//   ...
// ]
```

### 💱 Exchange Rates

Get real-time exchange rates for NGN/USDC pairs:

```typescript
import { getExchangeRates } from '@nairaramp/sdk-react';

const rates = await getExchangeRates('flutterwave.com');
console.log(rates);
// Output:
// {
//   buyRate: 1600,      // NGN per USDC (for deposits)
//   sellRate: 1595      // NGN per USDC (for withdrawals)
// }
```

### 📊 Transaction Management

Monitor transaction status in real-time:

```typescript
import { getTransactionStatus } from '@nairaramp/sdk-react';

const status = await getTransactionStatus('api-key', 'transaction-id');
console.log(status);
// Output:
// {
//   id: 'txn_123abc',
//   status: 'pending',
//   amount: 50000,
//   assetCode: 'USDC',
//   type: 'deposit',
//   createdAt: '2026-05-08T10:00:00Z',
//   updatedAt: '2026-05-08T10:05:00Z',
//   anchorDomain: 'flutterwave.com'
// }
```

### 🔐 KYC Status Verification

Check KYC approval status with anchors:

```typescript
import { checkKYCStatus } from '@nairaramp/sdk-react';

const kycStatus = await checkKYCStatus(
  'api-key',
  'flutterwave.com',
  'user@example.com'
);
console.log(kycStatus);
// Output:
// {
//   status: 'approved' | 'pending' | 'rejected' | 'none',
//   message?: 'Additional verification required...'
// }
```

---

## 💻 Complete Integration Example

```jsx
import React, { useState } from 'react';
import { 
  NairaRampProvider, 
  RampWidget,
  Transaction 
} from '@nairaramp/sdk-react';

function App() {
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const handleSuccess = (tx: Transaction) => {
    setLastTransaction(tx);
    console.log(`✅ Transaction ${tx.id} initiated!`);
    console.log(`Amount: ₦${tx.amount} = ${(tx.amount / 1600).toFixed(2)} USDC`);
  };

  const handleError = (error: Error) => {
    console.error(`❌ Transaction failed: ${error.message}`);
  };

  return (
    <NairaRampProvider apiKey="pk_live_abc123">
      <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
        <h1>💰 NairaRamp Demo</h1>
        
        <div style={{ marginBottom: '40px' }}>
          <h2>Deposit Funds</h2>
          <RampWidget 
            type="deposit"
            amount={50000}
            theme="light"
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        <div>
          <h2>Withdraw Funds</h2>
          <RampWidget 
            type="withdrawal"
            theme="light"
            requireWalletAddress={true}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        {lastTransaction && (
          <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Last Transaction</h3>
            <p><strong>ID:</strong> {lastTransaction.id}</p>
            <p><strong>Type:</strong> {lastTransaction.type}</p>
            <p><strong>Amount:</strong> ₦{lastTransaction.amount}</p>
            <p><strong>Status:</strong> {lastTransaction.status}</p>
            <p><strong>Anchor:</strong> {lastTransaction.anchorDomain}</p>
          </div>
        )}
      </div>
    </NairaRampProvider>
  );
}

export default App;
```

---

## 🏗 Architecture & Build

The SDK is built with:

- **TypeScript:** Full type safety and excellent IDE support
- **React 18:** Modern hooks-based architecture
- **Stellar SDK:** Integration with Stellar Network
- **Axios:** HTTP client for API communication
- **esbuild:** Fast bundling for both CommonJS and ES Modules

### Build Outputs

```
dist/
├── index.js              # CommonJS bundle (~102kb)
├── index.esm.js          # ES Module bundle (~100kb)
├── index.css             # Bundled styles
├── index.d.ts            # TypeScript declarations
└── *.d.ts.map            # Source maps for debugging
```

### Development Scripts

```bash
npm run build              # Compile TypeScript and bundle
npm run dev                # Watch mode for development
npm run type-check         # TypeScript type checking
npm run lint               # ESLint code quality checks
npm test                   # Run Jest tests
```

---

## 📚 API Reference

### Core Functions

#### `initiateSEPFlow(params: SEPFlowParams): Promise<SEPFlowResult>`
Main entry point that auto-selects between SEP-24 and SEP-6 based on parameters.

#### `initiateSEP24Flow(params: SEPFlowParams): Promise<SEPFlowResult>`
Initiate an interactive SEP-24 flow with KYC.

#### `initiateSEP6Flow(params: SEPFlowParams): Promise<SEPFlowResult>`
Initiate a direct SEP-6 transfer flow.

#### `discoverAnchors(): Promise<Anchor[]>`
Discover available Stellar anchors for NGN/USDC.

#### `getExchangeRates(anchorDomain: string): Promise<{buyRate: number, sellRate: number}>`
Get real-time exchange rates for a specific anchor.

#### `getTransactionStatus(apiKey: string, transactionId: string): Promise<Transaction>`
Check the status of an ongoing transaction.

#### `checkKYCStatus(apiKey: string, anchorDomain: string, customerEmail: string): Promise<{status: string, message?: string}>`
Verify KYC approval status with an anchor.

### React Hooks

#### `useNairaRamp(): {apiKey: string, baseUrl?: string}`
Access the NairaRamp provider configuration within components.

---

## 🔒 Security Best Practices

1. **API Keys:** Store your API key securely. Use environment variables in production.
   ```jsx
   <NairaRampProvider apiKey={process.env.REACT_APP_NAIRARAMP_API_KEY}>
   ```

2. **Email Validation:** The widget performs client-side email validation. Implement server-side validation in production.

3. **HTTPS Only:** All API communications use HTTPS. Never use HTTP in production.

4. **Wallet Validation:** When requiring wallet addresses, validate them on the server side.

5. **Rate Limiting:** Implement rate limiting on your API gateway to prevent abuse.

---

## 🤝 Contributing

We welcome contributions from the Nigerian and global developer community!

1. **Fork** the Project
2. Create your **Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the Branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

### Development Setup

```bash
# Clone the repository
git clone https://github.com/nairaramp/sdk-react.git
cd sdk-react

# Install dependencies
npm install

# Start development
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💬 Support & Community

- **Documentation:** https://docs.nairaramp.io
- **Issues:** https://github.com/nairaramp/sdk-react/issues
- **Discussions:** https://github.com/nairaramp/sdk-react/discussions
- **Twitter:** [@NairaRamp](https://twitter.com/nairaramp)
- **Discord:** [Join our community](https://discord.gg/nairaramp)

---

## 🙏 Acknowledgments

Built on the Stellar Network with support from:
- **Stellar Development Foundation**
- **Nigerian Developer Community**
- **Global Fintech Developers**

---

## 📈 Roadmap

- [x] SEP-24 & SEP-6 Support
- [x] Anchor Discovery
- [x] Real-time Exchange Rates
- [x] Transaction Status Monitoring
- [x] KYC Management
- [ ] Multi-currency Support (NGN, GHS, KES, ZAR)
- [ ] Payment Method Management (Bank Transfers, Mobile Money, Card)
- [ ] Advanced Analytics & Reporting
- [ ] Mobile SDK (React Native)
- [ ] REST API Gateway
- [ ] Webhook Support for Transaction Updates

---

**Made with ❤️ for Nigerian developers and the African fintech ecosystem.**

Distributed under the MIT License. See `LICENSE` for more information.[cite: 1]

---

## 🌍 Community & Support

*   **Twitter:** [@NairaRamp](https://twitter.com/nairaramp)[cite: 1]
*   **Discord:** [Join our Dev Community](https://discord.gg/nairaramp)[cite: 1]
*   **Website:** [nairaramp.dev](https://nairaramp.dev)[cite: 1]

---
*Built with ❤️ for the Nigerian Developer Ecosystem.*