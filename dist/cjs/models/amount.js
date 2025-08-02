"use strict";
/**
 * Amount model with precise decimal arithmetic using decimal.js
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Amount = void 0;
const decimal_js_1 = require("decimal.js");
/**
 * Represents a monetary amount with precise decimal arithmetic
 */
class Amount {
    constructor(value, currency) {
        this._value = new decimal_js_1.Decimal(value);
        this._currency = currency;
    }
    /**
     * Get the numeric value as a Decimal
     */
    get value() {
        return this._value;
    }
    /**
     * Get the currency/value type
     */
    get currency() {
        return this._currency;
    }
    /**
     * Convert to string representation
     */
    toString() {
        return this._value.toString();
    }
    /**
     * Convert to fixed decimal places
     */
    toFixed(decimalPlaces = 2) {
        return this._value.toFixed(decimalPlaces);
    }
    /**
     * Convert to number (use with caution for large amounts)
     */
    toNumber() {
        return this._value.toNumber();
    }
    /**
     * Add another amount
     */
    add(other) {
        if (this._currency !== other._currency) {
            throw new Error(`Cannot add amounts with different currencies: ${this._currency} and ${other._currency}`);
        }
        return new Amount(this._value.add(other._value), this._currency);
    }
    /**
     * Subtract another amount
     */
    subtract(other) {
        if (this._currency !== other._currency) {
            throw new Error(`Cannot subtract amounts with different currencies: ${this._currency} and ${other._currency}`);
        }
        return new Amount(this._value.sub(other._value), this._currency);
    }
    /**
     * Multiply by a factor
     */
    multiply(factor) {
        return new Amount(this._value.mul(factor), this._currency);
    }
    /**
     * Divide by a factor
     */
    divide(factor) {
        return new Amount(this._value.div(factor), this._currency);
    }
    /**
     * Check if equal to another amount
     */
    equals(other) {
        return this._currency === other._currency && this._value.equals(other._value);
    }
    /**
     * Check if greater than another amount
     */
    greaterThan(other) {
        if (this._currency !== other._currency) {
            throw new Error(`Cannot compare amounts with different currencies: ${this._currency} and ${other._currency}`);
        }
        return this._value.greaterThan(other._value);
    }
    /**
     * Check if less than another amount
     */
    lessThan(other) {
        if (this._currency !== other._currency) {
            throw new Error(`Cannot compare amounts with different currencies: ${this._currency} and ${other._currency}`);
        }
        return this._value.lessThan(other._value);
    }
    /**
     * Check if amount is positive
     */
    isPositive() {
        return this._value.isPositive();
    }
    /**
     * Check if amount is negative
     */
    isNegative() {
        return this._value.isNegative();
    }
    /**
     * Check if amount is zero
     */
    isZero() {
        return this._value.isZero();
    }
    /**
     * Get absolute value
     */
    abs() {
        return new Amount(this._value.abs(), this._currency);
    }
    /**
     * Convert to JSON for serialization
     */
    toJSON() {
        return {
            value: this._value.toString(),
            currency: this._currency,
        };
    }
    /**
     * Create Amount from JSON
     */
    static fromJSON(json) {
        return new Amount(json.value, json.currency);
    }
    /**
     * Create Amount from API response
     */
    static fromApiResponse(data) {
        return new Amount(data.amount, data.currency);
    }
}
exports.Amount = Amount;
//# sourceMappingURL=amount.js.map