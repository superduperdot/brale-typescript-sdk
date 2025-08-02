/**
 * Amount model with precise decimal arithmetic using decimal.js
 */

import { Decimal } from 'decimal.js';
import { ValueType } from '../types/common';

/**
 * Represents a monetary amount with precise decimal arithmetic
 */
export class Amount {
  private readonly _value: Decimal;
  private readonly _currency: ValueType;

  constructor(value: string | number | Decimal, currency: ValueType) {
    this._value = new Decimal(value);
    this._currency = currency;
  }

  /**
   * Get the numeric value as a Decimal
   */
  get value(): Decimal {
    return this._value;
  }

  /**
   * Get the currency/value type
   */
  get currency(): ValueType {
    return this._currency;
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return this._value.toString();
  }

  /**
   * Convert to fixed decimal places
   */
  toFixed(decimalPlaces: number = 2): string {
    return this._value.toFixed(decimalPlaces);
  }

  /**
   * Convert to number (use with caution for large amounts)
   */
  toNumber(): number {
    return this._value.toNumber();
  }

  /**
   * Add another amount
   */
  add(other: Amount): Amount {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot add amounts with different currencies: ${this._currency} and ${other._currency}`);
    }
    return new Amount(this._value.add(other._value), this._currency);
  }

  /**
   * Subtract another amount
   */
  subtract(other: Amount): Amount {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot subtract amounts with different currencies: ${this._currency} and ${other._currency}`);
    }
    return new Amount(this._value.sub(other._value), this._currency);
  }

  /**
   * Multiply by a factor
   */
  multiply(factor: string | number | Decimal): Amount {
    return new Amount(this._value.mul(factor), this._currency);
  }

  /**
   * Divide by a factor
   */
  divide(factor: string | number | Decimal): Amount {
    return new Amount(this._value.div(factor), this._currency);
  }

  /**
   * Check if equal to another amount
   */
  equals(other: Amount): boolean {
    return this._currency === other._currency && this._value.equals(other._value);
  }

  /**
   * Check if greater than another amount
   */
  greaterThan(other: Amount): boolean {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot compare amounts with different currencies: ${this._currency} and ${other._currency}`);
    }
    return this._value.greaterThan(other._value);
  }

  /**
   * Check if less than another amount
   */
  lessThan(other: Amount): boolean {
    if (this._currency !== other._currency) {
      throw new Error(`Cannot compare amounts with different currencies: ${this._currency} and ${other._currency}`);
    }
    return this._value.lessThan(other._value);
  }

  /**
   * Check if amount is positive
   */
  isPositive(): boolean {
    return this._value.isPositive();
  }

  /**
   * Check if amount is negative
   */
  isNegative(): boolean {
    return this._value.isNegative();
  }

  /**
   * Check if amount is zero
   */
  isZero(): boolean {
    return this._value.isZero();
  }

  /**
   * Get absolute value
   */
  abs(): Amount {
    return new Amount(this._value.abs(), this._currency);
  }

  /**
   * Convert to JSON for serialization
   */
  toJSON(): AmountJSON {
    return {
      value: this._value.toString(),
      currency: this._currency,
    };
  }

  /**
   * Create Amount from JSON
   */
  static fromJSON(json: AmountJSON): Amount {
    return new Amount(json.value, json.currency);
  }

  /**
   * Create Amount from API response
   */
  static fromApiResponse(data: { amount: string; currency: string }): Amount {
    return new Amount(data.amount, data.currency as ValueType);
  }
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