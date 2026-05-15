# Open Issues & Feature Requests

This file tracks proposed enhancements for the NairaRamp SDK.
Community contributors are welcome to pick any item and open a pull request.
Please read [CONTRIBUTING](README.md#contributing) before starting.

---

## 🔥 High Priority

### [FEATURE] SEP-10 Authentication (JWT) Support
**Label:** `enhancement` `stellar` `security`

Currently the SDK does not implement SEP-10 challenge/response authentication.
Anchors that require SEP-10 will reject requests without a valid JWT.

**Scope:**
- Implement `performSEP10Auth(anchorDomain, walletPublicKey, signFn)` in `stellar-utils.ts`
- The `signFn` callback receives the challenge XDR and must return the signed XDR — enabling hardware wallets and Freighter
- Cache the JWT per anchor/wallet pair with expiry handling
- Pass the token automatically in `initiateSEP24Flow` and `initiateSEP6Flow`

**References:** [SEP-10 spec](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md)

---

### [FEATURE] Freighter Wallet Integration
**Label:** `enhancement` `wallet` `dx`

Add first-class support for [Freighter](https://www.freighter.app/), the most popular Stellar browser wallet.

**Scope:**
- `useFreighterWallet()` hook — connect, get public key, sign transactions
- `FreighterConnectButton` component with branded styling
- Auto-detect Freighter installation and prompt download if absent
- Integrate with SEP-10 signing

---

### [FEATURE] Webhook Registration & Delivery
**Label:** `enhancement` `backend`

Allow developers to register a webhook URL and receive POST callbacks for transaction state changes instead of polling.

**Scope:**
- `registerWebhook(apiKey, url, events)` — subscribe to events like `transaction.completed`, `transaction.failed`, `kyc.approved`
- `listWebhooks(apiKey)` — list registered webhooks
- `deleteWebhook(apiKey, webhookId)` — remove a webhook
- Signature verification helper: `verifyWebhookSignature(payload, signature, secret)`

---

### [FEATURE] React Native (Expo) SDK
**Label:** `enhancement` `react-native` `mobile`

Nigeria is a mobile-first market. A React Native port would unlock a massive developer segment.

**Scope:**
- Separate package `@nairaramp/sdk-react-native`
- Replace CSS modules with StyleSheet / NativeWind
- Replace `window.open` with `expo-web-browser` for the SEP-24 interactive flow
- Deep-link callback handling after KYC completion
- Compatible with Expo Go and bare workflow

---

## 🟡 Medium Priority

### [FEATURE] Multi-Currency Support: GHS, KES, ZAR
**Label:** `enhancement` `africa`

Expand beyond NGN to cover Ghana (GHS), Kenya (KES), and South Africa (ZAR).

**Scope:**
- Update `SupportedCurrency` type in `NairaRampProvider`
- Currency-aware rate fetching — `getExchangeRates(anchorDomain, { from: 'GHS', to: 'USDC' })`
- Locale-aware `formatCurrency(amount, currency, locale)` utility
- Currency selector UI in `ConversionCalculator`

---

### [FEATURE] Transaction History Component
**Label:** `enhancement` `component`

A pre-built `TransactionHistory` component that renders paginated transaction history.

**Scope:**
- Wraps `getTransactionHistory` with `useTransactionHistory` hook
- Filterable by status, date range, and type
- Exportable as CSV
- Supports both light and dark themes

---

### [FEATURE] Fee Transparency UI
**Label:** `enhancement` `ux`

Surface anchor fees clearly in the `RampWidget` before the user submits.

**Scope:**
- Call `estimateConversion` after the user enters an amount (debounced)
- Show: gross amount, estimated fee, net amount received — as a breakdown card
- Update in real-time as amount changes

---

### [FEATURE] TOML-Based Anchor Discovery via Stellar SDK
**Label:** `enhancement` `stellar`

Currently anchor discovery uses a hardcoded list. Real discovery should parse `stellar.toml` using the Stellar SDK's `StellarToml.Resolver`.

**Scope:**
- Replace hardcoded list with `StellarToml.Resolver.resolve(domain)` calls
- Parse `CURRENCIES`, `TRANSFER_SERVER_SEP0024`, and `SIGNING_KEY` from the TOML
- Build a community-maintained registry of NGN-supporting anchors
- Cache parsed TOML with a 1-hour TTL

---

### [FEATURE] Testnet Mode
**Label:** `enhancement` `dx` `testing`

The `network: 'testnet'` provider prop is accepted but has no effect today.

**Scope:**
- Route all API calls to `api.testnet.nairaramp.com` when `network === 'testnet'`
- Use Stellar testnet USDC issuer address: `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`
- Document testnet API keys and Friendbot funding in the README
- Add a `<TestnetBanner />` component that alerts users they're in test mode

---

### [FEATURE] `useTransactionHistory` Hook
**Label:** `enhancement` `hooks`

A data hook to manage paginated transaction history in React.

```typescript
const { transactions, total, page, setPage, isLoading, error, refresh } =
  useTransactionHistory({ limit: 10, type: 'deposit' });
```

---

### [FEATURE] Amount Quick-Select Buttons
**Label:** `enhancement` `ux` `component`

Add preset amount buttons to `RampWidget` (e.g., ₦5K, ₦10K, ₦50K, ₦100K) common in Nigerian fintech apps.

**Scope:**
- `quickAmounts` prop on `RampWidget` — accepts `number[]`
- Renders as pill buttons above the amount input
- Tapping a pill fills the amount field

---

### [IMPROVEMENT] Debounced Rate Fetch in RampWidget
**Label:** `improvement` `performance`

The widget currently fetches rates immediately on anchor change. Add a 400ms debounce to avoid rate-limit issues when users switch anchors quickly.

---

## 🟢 Good First Issues

### [FEATURE] `CopyButton` Utility Component
**Label:** `good first issue` `component`

A small reusable component that copies text to the clipboard and shows a "Copied!" confirmation.

**Usage:**
```tsx
<CopyButton value={transaction.id} label="Copy TX ID" />
```

---

### [FEATURE] Stellar Address QR Code Component
**Label:** `good first issue` `component`

A `WalletQRCode` component that generates a QR code for a Stellar wallet address.
Should use `qrcode.react` (already widely used in Stellar ecosystem apps).

---

### [IMPROVEMENT] Accessible ARIA Attributes in RampWidget
**Label:** `good first issue` `accessibility` `a11y`

The `RampWidget` form is functional but lacks proper ARIA roles and live region announcements for screen readers.

**Scope:**
- Add `aria-live="polite"` to the error and status regions
- Add `aria-describedby` links between inputs and their hint/error paragraphs
- Ensure focus is moved to the success/error heading after state transitions

---

### [DOCS] Add CodeSandbox / StackBlitz Playground
**Label:** `good first issue` `documentation`

Create a live interactive demo on CodeSandbox or StackBlitz linked from the README so developers can try the SDK without installing it.

---

### [IMPROVEMENT] Replace `setInterval` in Status Polling with Exponential Backoff
**Label:** `good first issue` `improvement`

The current polling in `subscribeToTransaction` uses a fixed interval. An exponential backoff strategy (e.g., 3s → 5s → 10s → 30s) would reduce API load for long-running transactions.

---

### [FEATURE] `NairaRampError` `toJSON()` Method
**Label:** `good first issue` `dx`

Add a `toJSON()` method to all error classes so they serialize correctly when `JSON.stringify`-ed or sent to error tracking services like Sentry.

```typescript
error.toJSON() // { name: 'AnchorError', code: 'ANCHOR_ERROR', message: '...', anchorDomain: '...' }
```

---

## 🔵 Long-Term / Research

### [RESEARCH] Stellar Path Payments for Multi-Hop Conversion
**Label:** `research` `stellar`

Instead of relying solely on anchors for conversion, explore using Stellar's built-in DEX and path-payment feature to route NGN → XLM → USDC directly on-chain when anchor rates are unfavourable.

---

### [RESEARCH] AI-Powered Rate Prediction
**Label:** `research` `ai`

Research feasibility of training a lightweight model on historical NGN/USDC rate data to predict optimal transaction timing for users. Could surface as a `getRateForecast()` utility.

---

### [FEATURE] CLI Tool — `nairaramp`
**Label:** `tooling` `dx`

A command-line tool for developers to test the SDK locally:
```bash
nairaramp rates --anchor flutterwave.com
nairaramp kyc-status --email user@example.com --anchor yellowcard.io
nairaramp tx status --id txn_abc123
```

---

## 📝 How to Contribute

1. Comment on the issue you want to work on so maintainers can assign it to you
2. Fork the repo and create a branch: `git checkout -b feature/your-feature-name`
3. Write code and tests (aim for >80% coverage on new logic)
4. Open a PR with a clear description of what changed and why
5. Link the PR to this issue file entry

All contributions, big and small, are welcome. Thank you for helping build better fintech infrastructure for Africa!
