"use strict";
/**
 * Address models for both internal (custodial) and external addresses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationMethod = void 0;
/**
 * Address verification methods
 */
var VerificationMethod;
(function (VerificationMethod) {
    VerificationMethod["EMAIL"] = "email";
    VerificationMethod["SMS"] = "sms";
    VerificationMethod["MANUAL"] = "manual";
    VerificationMethod["AUTOMATED"] = "automated";
})(VerificationMethod || (exports.VerificationMethod = VerificationMethod = {}));
//# sourceMappingURL=address.js.map