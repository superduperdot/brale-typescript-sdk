/**
 * Brale TypeScript SDK
 *
 * Unofficial TypeScript SDK for the Brale API - digital asset infrastructure platform.
 * Provides type-safe access to accounts, transfers, addresses, and automation flows.
 *
 * Note: This is an unofficial, community-developed SDK not endorsed by Brale.
 */
export { BraleClient } from './client';
export { BraleAuth } from './auth';
export * from './models/account';
export * from './models/address';
export * from './models/amount';
export * from './models/transfer';
export * from './models/automation';
export { AccountsService } from './services/accounts';
export { AddressesService } from './services/addresses';
export { TransfersService } from './services/transfers';
export { AutomationsService } from './services/automations';
export * from './utils/retry';
export * from './utils/idempotency';
export * from './utils/pagination';
export * from './types/common';
export * from './errors/api-error';
export type { BraleConfig } from './types/config';
export { ValueType, TransferType, Network } from './types/common';
export { CredentialValidator, CredentialValidationResult } from './security/credential-validator';
export { CredentialRotationManager, MockRotationProvider, RotationProvider, RotationConfig, CredentialMetadata, RotationEvent } from './security/credential-rotation';
export { SecureTokenStorage, SecureStorageOptions, StoredTokenData, defaultTokenStorage } from './security/token-storage';
//# sourceMappingURL=index.d.ts.map