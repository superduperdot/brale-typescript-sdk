/**
 * Common types and enums used throughout the SDK
 */
export var Network;
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
})(Network || (Network = {}));
export var ValueType;
(function (ValueType) {
    ValueType["SBC"] = "SBC";
    ValueType["USDC"] = "USDC";
    ValueType["USD"] = "USD";
})(ValueType || (ValueType = {}));
export var TransferType;
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
})(TransferType || (TransferType = {}));
export var TransferStatus;
(function (TransferStatus) {
    TransferStatus["PENDING"] = "pending";
    TransferStatus["PROCESSING"] = "processing";
    TransferStatus["COMPLETED"] = "completed";
    TransferStatus["FAILED"] = "failed";
    TransferStatus["CANCELLED"] = "cancelled";
})(TransferStatus || (TransferStatus = {}));
export var AddressType;
(function (AddressType) {
    AddressType["INTERNAL"] = "internal";
    AddressType["EXTERNAL"] = "external";
})(AddressType || (AddressType = {}));
//# sourceMappingURL=common.js.map