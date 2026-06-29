/**
 * Amount class for handling PAC and NanoPAC conversions.
 *
 * In the Pactus blockchain an Amount is an int64 of nanoPAC (see the Go SDK:
 * `type Amount int64`). JavaScript's only native exact-integer type wide enough
 * for int64 is `bigint` — `number` loses precision above 2^53, while the maximum
 * amount is 4.2e16 nanoPAC. The value is therefore stored as a `bigint` and
 * arithmetic runs directly on it, with no per-operation string conversions.
 */

// Constants
export const NANO_PAC_PER_PAC = 1e9;
export const MAX_NANO_PAC = 42e6 * NANO_PAC_PER_PAC;

const MAX_NANO_PAC_BIG = BigInt(MAX_NANO_PAC);

/**
 * Amount represents the atomic unit in the Pactus blockchain.
 * Each unit is equal to 1e-9 of a PAC.
 *
 * This class provides a type-safe way to handle amounts, storing the value
 * internally as a native `bigint` (nanoPAC) for exact int64 precision.
 */
export class Amount {
  private value: bigint;

  /**
   * Create a new Amount instance
   * @param value - Value in nanoPAC as a string, number, or bigint
   */
  constructor(value: string | number | bigint = 0n) {
    const nanoPac = Amount.parse(value);

    if (nanoPac === null) {
      throw new Error(`Invalid amount: ${value}`);
    }

    this.value = nanoPac;
  }

  /**
   * Parse and validate a nanoPAC value into a bigint.
   * @param value Value in nanoPAC as a string, number, or bigint
   * @returns The value as a bigint, or null if it is not a valid amount
   */
  private static parse(value: string | number | bigint): bigint | null {
    let nanoPac: bigint;

    try {
      if (typeof value === 'bigint') {
        nanoPac = value;
      } else if (typeof value === 'number') {
        if (!Number.isInteger(value)) {
          return null;
        }

        nanoPac = BigInt(value);
      } else {
        const trimmed = value.trim();

        if (!/^\d+$/.test(trimmed)) {
          return null;
        }

        nanoPac = BigInt(trimmed);
      }
    } catch {
      return null;
    }

    return nanoPac >= 0n && nanoPac <= MAX_NANO_PAC_BIG ? nanoPac : null;
  }

  /**
   * Get the internal value as a string
   * @returns Amount value as string (nanoPAC)
   */
  toString(): string {
    return this.value.toString();
  }

  /**
   * Serialize the amount for `JSON.stringify`.
   *
   * Returns the nanoPAC value as a string. Without this, `JSON.stringify` would
   * throw a `TypeError` because the internal value is a `bigint`, which cannot
   * be serialized natively.
   * @returns Amount value as string (nanoPAC)
   */
  toJSON(): string {
    return this.value.toString();
  }

  /**
   * Get amount value in PAC units
   * @returns Amount value as number (PAC)
   */
  toPac(): number {
    return Number(this.value) / NANO_PAC_PER_PAC;
  }

  /**
   * Format amount for display with proper decimal places
   * @param decimals Number of decimal places to display (default: 9)
   * @returns Formatted PAC amount string
   */
  format(decimals: number = 9): string {
    const formatted = this.toPac().toFixed(decimals);

    return formatted;
  }

  /**
   * Format amount for display with proper decimal places
   * @param decimals Number of decimal places to display (default: 9)
   * @param includeUnit Whether to include the PAC unit in the output (default: false)
   * @returns Formatted PAC amount string
   */
  formatIncludeUnit(decimals: number = 9): string {
    const formatted = this.toPac().toFixed(decimals);

    return `${formatted} PAC`;
  }

  /**
   * Check if this amount equals another amount
   * @param other Another Amount instance to compare
   * @returns true if amounts are equal
   */
  equals(other: Amount): boolean {
    return this.value === other.value;
  }

  /**
   * Add another amount to this one
   * @param other Amount to add
   * @returns New Amount instance with the sum
   */
  add(other: Amount): Amount {
    return Amount.fromNanoPac(this.value + other.value);
  }

  /**
   * Subtract another amount from this one
   * @param other Amount to subtract
   * @returns New Amount instance with the difference
   * @throws Error if result would be negative
   */
  subtract(other: Amount): Amount {
    if (this.value < other.value) {
      throw new Error('Amount cannot be negative');
    }

    return Amount.fromNanoPac(this.value - other.value);
  }

  /**
   * Check if this amount is greater than another
   * @param other Amount to compare
   * @returns true if this amount is greater
   */
  greaterThan(other: Amount): boolean {
    return this.value > other.value;
  }

  /**
   * Check if this amount is less than another
   * @param other Amount to compare
   * @returns true if this amount is less
   */
  lessThan(other: Amount): boolean {
    return this.value < other.value;
  }

  /**
   * Create an Amount instance from nanoPAC value
   * @param nanoPac Integer value in nanoPAC units
   * @returns New Amount instance
   */
  static fromNanoPac(nanoPac: string | number | bigint): Amount {
    return new Amount(nanoPac);
  }

  /**
   * Create an Amount instance from PAC value
   * @param pac Floating point value in PAC units
   * @returns New Amount instance
   * @throws Error if pac is NaN or Infinity
   */
  static fromPac(pac: number): Amount {
    if (!Number.isFinite(pac)) {
      throw new Error(`Invalid PAC amount: ${pac}`);
    }

    // Convert PAC to nanoPAC with proper rounding
    const nanoPac = Math.round(pac * NANO_PAC_PER_PAC);

    return Amount.fromNanoPac(nanoPac);
  }

  /**
   * Create an Amount instance from a string representing PAC value
   * @param pacStr String representation of PAC amount
   * @returns New Amount instance
   * @throws Error if string cannot be parsed as a number
   */
  static fromString(pacStr: string): Amount {
    const pac = Number(pacStr);

    if (Number.isNaN(pac)) {
      throw new Error('Invalid PAC amount');
    }

    return Amount.fromPac(pac);
  }

  /**
   * Check if a string or number is a valid amount
   * @param amount Value to validate
   * @returns true if valid, false otherwise
   */
  static isValid(amount: string | number | bigint): boolean {
    return Amount.parse(amount) !== null;
  }

  /**
   * Create an Amount instance with zero value
   * @returns New Amount instance with zero value
   */
  static zero(): Amount {
    return new Amount(0n);
  }
}
