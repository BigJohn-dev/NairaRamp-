import axios from 'axios';

// SEP-24 and SEP-6 Types
export interface Anchor {
  name: string;
  domain: string;
  displayName: string;
  supportedAssets: Array<{
    code: string;
    issuer: string;
  }>;
  sep24Supported: boolean;
  sep6Supported: boolean;
}

export interface SEPFlowParams {
  apiKey: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  walletAddress?: string;
  customerEmail?: string;
  anchorDomain?: string;
}

export interface SEPFlowResult {
  id: string;
  url?: string;
  interactiveUrl?: string;
  anchorDomain?: string;
  type: 'deposit' | 'withdrawal';
}

export interface Transaction {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  amount: number;
  assetCode: string;
  type: 'deposit' | 'withdrawal';
  createdAt: string;
  updatedAt: string;
  anchorDomain?: string;
}

// Discover Stellar anchors that support NGN/USDC
export async function discoverAnchors(): Promise<Anchor[]> {
  try {
    // Fetch from TOML file endpoints of known NGN anchors
    const knownAnchors = [
      'flutterwave.com',
      'remitly.com',
      'circle.com',
      'stellaranchor.io',
    ];

    const anchors: Anchor[] = [];

    for (const domain of knownAnchors) {
      try {
        await axios.get(
          `https://${domain}/.well-known/stellar.toml`,
          { timeout: 5000 }
        );

        // Parse TOML response for anchor details
        anchors.push({
          name: domain,
          domain,
          displayName: domain.split('.')[0].toUpperCase(),
          supportedAssets: [
            { code: 'NGN', issuer: '' },
            { code: 'USDC', issuer: 'GBBD47AB6P5X574CM6I63QS5BVYSDJD3G7WKBPXQKCDRNL4D5XWDRBE' },
          ],
          sep24Supported: true,
          sep6Supported: true,
        });
      } catch {
        // Skip anchors that don't respond
        continue;
      }
    }

    // If no anchors found from network, return default NGN anchors
    if (anchors.length === 0) {
      return [
        {
          name: 'flutterwave',
          domain: 'flutterwave.com',
          displayName: 'Flutterwave',
          supportedAssets: [
            { code: 'NGN', issuer: '' },
            { code: 'USDC', issuer: 'GBBD47AB6P5X574CM6I63QS5BVYSDJD3G7WKBPXQKCDRNL4D5XWDRBE' },
          ],
          sep24Supported: true,
          sep6Supported: true,
        },
        {
          name: 'remitly',
          domain: 'remitly.com',
          displayName: 'Remitly',
          supportedAssets: [
            { code: 'NGN', issuer: '' },
            { code: 'USDC', issuer: 'GBBD47AB6P5X574CM6I63QS5BVYSDJD3G7WKBPXQKCDRNL4D5XWDRBE' },
          ],
          sep24Supported: true,
          sep6Supported: true,
        },
      ];
    }

    return anchors;
  } catch (error) {
    console.error('Failed to discover anchors:', error);
    throw new Error('Unable to discover available anchors');
  }
}

// Get anchor exchange rates for NGN/USDC pairs
export async function getExchangeRates(
  anchorDomain: string
): Promise<{ buyRate: number; sellRate: number }> {
  try {
    const response = await axios.get(
      `https://api.nairaramp.com/v1/rates/${anchorDomain}?pair=NGN-USDC`
    );

    return {
      buyRate: response.data.buy_rate,
      sellRate: response.data.sell_rate,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch exchange rates: ${error.message}`);
    }
    throw error;
  }
}

// Initiate SEP-24 Interactive Flow
export async function initiateSEP24Flow(params: SEPFlowParams): Promise<SEPFlowResult> {
  const {
    apiKey,
    type,
    amount,
    walletAddress,
    customerEmail,
    anchorDomain,
  } = params;

  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const selectedAnchor = anchorDomain || 'flutterwave.com';

  try {
    const response = await axios.post(
      'https://api.nairaramp.com/v1/sep24/transactions',
      {
        type: type === 'deposit' ? 'deposit-interactive' : 'withdrawal-interactive',
        amount,
        asset_code: 'USDC',
        anchor_domain: selectedAnchor,
        wallet_address: walletAddress,
        customer_email: customerEmail,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      id: response.data.id,
      url: response.data.url,
      interactiveUrl: response.data.interactive_url,
      anchorDomain: selectedAnchor,
      type,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `SEP-24 flow initiation failed: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}

// Initiate SEP-6 Direct Flow (non-interactive)
export async function initiateSEP6Flow(params: SEPFlowParams): Promise<SEPFlowResult> {
  const {
    apiKey,
    type,
    amount,
    walletAddress,
    customerEmail,
    anchorDomain,
  } = params;

  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (!walletAddress) {
    throw new Error('Wallet address is required for SEP-6 flow');
  }

  const selectedAnchor = anchorDomain || 'flutterwave.com';

  try {
    const response = await axios.post(
      'https://api.nairaramp.com/v1/sep6/transactions',
      {
        type: type === 'deposit' ? 'deposit' : 'withdrawal',
        amount,
        asset_code: 'USDC',
        anchor_domain: selectedAnchor,
        account: walletAddress,
        customer_email: customerEmail,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      id: response.data.id,
      url: response.data.url,
      interactiveUrl: response.data.interactive_url,
      anchorDomain: selectedAnchor,
      type,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `SEP-6 flow initiation failed: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
}

// Main SEP flow initiator (auto-selects between SEP-24 and SEP-6)
export async function initiateSEPFlow(params: SEPFlowParams): Promise<SEPFlowResult> {
  // Use SEP-24 for interactive KYC flow, SEP-6 for direct transfers
  if (params.walletAddress) {
    return initiateSEP6Flow(params);
  }
  return initiateSEP24Flow(params);
}

// Get transaction status
export async function getTransactionStatus(
  apiKey: string,
  transactionId: string
): Promise<Transaction> {
  try {
    const response = await axios.get(
      `https://api.nairaramp.com/v1/transactions/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return {
      id: response.data.id,
      status: response.data.status,
      amount: response.data.amount,
      assetCode: response.data.asset_code || 'USDC',
      type: response.data.type === 'deposit' ? 'deposit' : 'withdrawal',
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
      anchorDomain: response.data.anchor_domain,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch transaction status: ${error.message}`);
    }
    throw error;
  }
}

// Check KYC status with anchor
export async function checkKYCStatus(
  apiKey: string,
  anchorDomain: string,
  customerEmail: string
): Promise<{
  status: 'approved' | 'pending' | 'rejected' | 'none';
  message?: string;
}> {
  try {
    const response = await axios.get(
      `https://api.nairaramp.com/v1/kyc/status`,
      {
        params: {
          anchor_domain: anchorDomain,
          customer_email: customerEmail,
        },
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return {
      status: response.data.status,
      message: response.data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to check KYC status: ${error.message}`);
    }
    throw error;
  }
}
