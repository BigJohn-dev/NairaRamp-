export class NairaRampError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'NairaRampError';
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends NairaRampError {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class AnchorError extends NairaRampError {
  readonly anchorDomain: string;

  constructor(message: string, anchorDomain: string) {
    super(message, 'ANCHOR_ERROR');
    this.name = 'AnchorError';
    this.anchorDomain = anchorDomain;
  }
}

export class TransactionError extends NairaRampError {
  readonly transactionId?: string;

  constructor(message: string, transactionId?: string) {
    super(message, 'TRANSACTION_ERROR');
    this.name = 'TransactionError';
    this.transactionId = transactionId;
  }
}

export class KYCError extends NairaRampError {
  readonly kycStatus?: string;

  constructor(message: string, kycStatus?: string) {
    super(message, 'KYC_ERROR');
    this.name = 'KYCError';
    this.kycStatus = kycStatus;
  }
}

export class NetworkError extends NairaRampError {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
    this.statusCode = statusCode;
  }
}

export class AuthError extends NairaRampError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}
