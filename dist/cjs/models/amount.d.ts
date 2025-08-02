/**
 * Amount model with precise decimal arithmetic using decimal.js
 */
import { Decimal } from 'decimal.js';
import { ValueType } from '../types/common';
/**
 * Represents a monetary amount with precise decimal arithmetic
 */
export declare class Amount {
    private readonly _value;
    private readonly _currency;
    constructor(value: string | number | Decimal, currency: ValueType);
    /**
     * Get the numeric value as a Decimal
     */
    get value(): Decimal;
    /**
     * Get the currency/value type
     */
    get currency(): ValueType;
    /**
     * Convert to string representation
     */
    toString(): string;
    /**
     * Convert to fixed decimal places
     */
    toFixed(decimalPlaces?: number): string;
    /**
     * Convert to number (use with caution for large amounts)
     */
    toNumber(): number;
    /**
     * Add another amount
     */
    add(other: Amount): Amount;
    /**
     * Subtract another amount
     */
    subtract(other: Amount): Amount;
    /**
     * Multiply by a factor
     */
    multiply(factor: string | number | Decimal): Amount;
    /**
     * Divide by a factor
     */
    divide(factor: string | number | Decimal): Amount;
    /**
     * Check if equal to another amount
     */
    equals(other: Amount): boolean;
    /**
     * Check if greater than another amount
     */
    greaterThan(other: Amount): boolean;
    /**
     * Check if less than another amount
     */
    lessThan(other: Amount): boolean;
    /**
     * Check if amount is positive
     */
    isPositive(): boolean;
    /**
     * Check if amount is negative
     */
    isNegative(): boolean;
    /**
     * Check if amount is zero
     */
    isZero(): boolean;
    /**
     * Get absolute value
     */
    abs(): Amount;
    /**
     * Convert to JSON for serialization
     */
    toJSON(): AmountJSON;
    /**
     * Create Amount from JSON
     */
    static fromJSON(json: AmountJSON): Amount;
    /**
     * Create Amount from API response
     */
    static fromApiResponse(data: {
        amount: string;
        currency: string;
    }): Amount;
}
/**
 * JSON representation of an Amount
 */
export interface AmountJSON {
    value: string;
    currency: ValueType;
}
/**
 * Balance information for a specific token
 */
export interface Balance {
    /** Available balance */
    available: Amount;
    /** Pending balance (reserved for pending transactions) */
    pending: Amount;
    /** Total balance (available + pending) */
    total: Amount;
    /** Last updated timestamp */
    updatedAt: Date;
}
//# sourceMappingURL=amount.d.ts.map