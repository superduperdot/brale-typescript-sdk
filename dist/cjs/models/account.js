"use strict";
/**
 * Account model representing a Brale customer account
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountType = exports.AccountStatus = void 0;
/**
 * Account status enumeration
 */
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "active";
    AccountStatus["INACTIVE"] = "inactive";
    AccountStatus["SUSPENDED"] = "suspended";
    AccountStatus["CLOSED"] = "closed";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
/**
 * Account type enumeration
 */
var AccountType;
(function (AccountType) {
    AccountType["PERSONAL"] = "personal";
    AccountType["BUSINESS"] = "business";
    AccountType["INSTITUTIONAL"] = "institutional";
})(AccountType || (exports.AccountType = AccountType = {}));
//# sourceMappingURL=account.js.map