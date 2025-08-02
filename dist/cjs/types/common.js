"use strict";
/**
 * Common types and enums used throughout the SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressType = exports.TransferStatus = exports.TransferType = exports.ValueType = exports.Network = void 0;
var Network;
(function (Network) {
    Network["ETHEREUM"] = "ethereum";
    Network["BASE"] = "base";
    Network["POLYGON"] = "polygon";
    Network["ARBITRUM"] = "arbitrum";
    Network["OPTIMISM"] = "optimism";
    Network["AVALANCHE"] = "avalanche";
    Network["CELO"] = "celo";
    Network["SOLANA"] = "solana";
    Network["BNB"] = "bnb";
    Network["CANTON"] = "canton";
})(Network || (exports.Network = Network = {}));
var ValueType;
(function (ValueType) {
    ValueType["SBC"] = "SBC";
    ValueType["USDC"] = "USDC";
    ValueType["USD"] = "USD";
})(ValueType || (exports.ValueType = ValueType = {}));
var TransferType;
(function (TransferType) {
    // Offchain (traditional payment rails)
    TransferType["WIRE"] = "wire";
    TransferType["ACH"] = "ach";
    // Onchain (blockchain networks)
    TransferType["ETHEREUM"] = "ethereum";
    TransferType["BASE"] = "base";
    TransferType["POLYGON"] = "polygon";
    TransferType["ARBITRUM"] = "arbitrum";
    TransferType["OPTIMISM"] = "optimism";
    TransferType["AVALANCHE"] = "avalanche";
    TransferType["CELO"] = "celo";
    TransferType["SOLANA"] = "solana";
    TransferType["BNB"] = "bnb";
    TransferType["CANTON"] = "canton";
})(TransferType || (exports.TransferType = TransferType = {}));
var TransferStatus;
(function (TransferStatus) {
    TransferStatus["PENDING"] = "pending";
    TransferStatus["PROCESSING"] = "processing";
    TransferStatus["COMPLETED"] = "completed";
    TransferStatus["FAILED"] = "failed";
    TransferStatus["CANCELLED"] = "cancelled";
})(TransferStatus || (exports.TransferStatus = TransferStatus = {}));
var AddressType;
(function (AddressType) {
    AddressType["INTERNAL"] = "internal";
    AddressType["EXTERNAL"] = "external";
})(AddressType || (exports.AddressType = AddressType = {}));
//# sourceMappingURL=common.js.map