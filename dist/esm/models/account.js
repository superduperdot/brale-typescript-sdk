/**
 * Account model representing a Brale customer account
 */
/**
 * Account status enumeration
 */
export var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "active";
    AccountStatus["INACTIVE"] = "inactive";
    AccountStatus["SUSPENDED"] = "suspended";
    AccountStatus["CLOSED"] = "closed";
})(AccountStatus || (AccountStatus = {}));
/**
 * Account type enumeration
 */
export var AccountType;
(function (AccountType) {
    AccountType["PERSONAL"] = "personal";
    AccountType["BUSINESS"] = "business";
    AccountType["INSTITUTIONAL"] = "institutional";
})(AccountType || (AccountType = {}));
//# sourceMappingURL=account.js.map