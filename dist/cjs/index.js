"use strict";
/**
 * Brale TypeScript SDK
 *
 * Unofficial TypeScript SDK for the Brale API - digital asset infrastructure platform.
 * Provides type-safe access to accounts, transfers, addresses, and automation flows.
 *
 * Note: This is an unofficial, community-developed SDK not endorsed by Brale.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTokenStorage = exports.SecureTokenStorage = exports.MockRotationProvider = exports.CredentialRotationManager = exports.CredentialValidator = exports.Network = exports.TransferType = exports.ValueType = exports.AutomationsService = exports.TransfersService = exports.AddressesService = exports.AccountsService = exports.BraleAuth = exports.BraleClient = void 0;
var client_1 = require("./client");
Object.defineProperty(exports, "BraleClient", { enumerable: true, get: function () { return client_1.BraleClient; } });
var auth_1 = require("./auth");
Object.defineProperty(exports, "BraleAuth", { enumerable: true, get: function () { return auth_1.BraleAuth; } });
// Models
__exportStar(require("./models/account"), exports);
__exportStar(require("./models/address"), exports);
__exportStar(require("./models/amount"), exports);
__exportStar(require("./models/transfer"), exports);
__exportStar(require("./models/automation"), exports);
// Services
var accounts_1 = require("./services/accounts");
Object.defineProperty(exports, "AccountsService", { enumerable: true, get: function () { return accounts_1.AccountsService; } });
var addresses_1 = require("./services/addresses");
Object.defineProperty(exports, "AddressesService", { enumerable: true, get: function () { return addresses_1.AddressesService; } });
var transfers_1 = require("./services/transfers");
Object.defineProperty(exports, "TransfersService", { enumerable: true, get: function () { return transfers_1.TransfersService; } });
var automations_1 = require("./services/automations");
Object.defineProperty(exports, "AutomationsService", { enumerable: true, get: function () { return automations_1.AutomationsService; } });
// Utilities
__exportStar(require("./utils/retry"), exports);
__exportStar(require("./utils/idempotency"), exports);
__exportStar(require("./utils/pagination"), exports);
// Types and errors
__exportStar(require("./types/common"), exports);
__exportStar(require("./errors/api-error"), exports);
// Re-export Value Types for convenience
var common_1 = require("./types/common");
Object.defineProperty(exports, "ValueType", { enumerable: true, get: function () { return common_1.ValueType; } });
Object.defineProperty(exports, "TransferType", { enumerable: true, get: function () { return common_1.TransferType; } });
Object.defineProperty(exports, "Network", { enumerable: true, get: function () { return common_1.Network; } });
// Re-export Security and Rotation utilities
var credential_validator_1 = require("./security/credential-validator");
Object.defineProperty(exports, "CredentialValidator", { enumerable: true, get: function () { return credential_validator_1.CredentialValidator; } });
var credential_rotation_1 = require("./security/credential-rotation");
Object.defineProperty(exports, "CredentialRotationManager", { enumerable: true, get: function () { return credential_rotation_1.CredentialRotationManager; } });
Object.defineProperty(exports, "MockRotationProvider", { enumerable: true, get: function () { return credential_rotation_1.MockRotationProvider; } });
var token_storage_1 = require("./security/token-storage");
Object.defineProperty(exports, "SecureTokenStorage", { enumerable: true, get: function () { return token_storage_1.SecureTokenStorage; } });
Object.defineProperty(exports, "defaultTokenStorage", { enumerable: true, get: function () { return token_storage_1.defaultTokenStorage; } });
//# sourceMappingURL=index.js.map