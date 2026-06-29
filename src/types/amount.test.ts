import { Amount, MAX_NANO_PAC } from './amount';

describe('Amount class', () => {
  describe('basic functionality', () => {
    test('creates with default zero value', () => {
      const amount = new Amount();
      expect(amount.toString()).toBe('0');
      expect(amount.toPac()).toBe(0);
    });

    test('creates from nanoPAC string', () => {
      const amount = new Amount('1000000000');
      expect(amount.toString()).toBe('1000000000');
      expect(amount.toPac()).toBe(1);
    });

    test('creates from PAC values', () => {
      const onePac = Amount.fromPac(1);
      const halfPac = Amount.fromPac(0.5);

      expect(onePac.toString()).toBe('1000000000');
      expect(halfPac.toString()).toBe('500000000');
    });

    test('formats with different decimal places', () => {
      const amount = Amount.fromPac(1.23456789);

      expect(amount.format()).toBe('1.234567890');
      expect(amount.format(2)).toBe('1.23');
      expect(amount.format(0)).toBe('1');
    });
  });

  describe('operations', () => {
    test('adds two amounts', () => {
      const a = Amount.fromPac(1);
      const b = Amount.fromPac(2.5);

      const sum = a.add(b);
      expect(sum.toPac()).toBe(3.5);
    });

    test('subtracts amounts', () => {
      const a = Amount.fromPac(5);
      const b = Amount.fromPac(2);

      const diff = a.subtract(b);
      expect(diff.toPac()).toBe(3);
    });

    test('compares amounts', () => {
      const small = Amount.fromPac(1);
      const medium = Amount.fromPac(5);
      const large = Amount.fromPac(10);

      expect(medium.greaterThan(small)).toBe(true);
      expect(medium.lessThan(large)).toBe(true);
      expect(medium.equals(Amount.fromPac(5))).toBe(true);
    });
  });

  describe('utility methods', () => {
    test('creates zero amount', () => {
      expect(Amount.zero().toString()).toBe('0');
    });

    test('creates from string representation', () => {
      expect(Amount.fromString('1.5').toPac()).toBe(1.5);
    });
  });

  describe('precision and validation', () => {
    test('creates from a bigint value', () => {
      const amount = new Amount(1000000000n);
      expect(amount.toString()).toBe('1000000000');
      expect(amount.toPac()).toBe(1);
    });

    test('preserves large nanoPAC values beyond Number.MAX_SAFE_INTEGER', () => {
      // 2^53 + 1 cannot be represented exactly as a JS number
      const big = '9007199254740993';
      expect(new Amount(big).toString()).toBe(big);
    });

    test('adds and subtracts large amounts exactly', () => {
      const a = new Amount('9007199254740993');
      const b = new Amount('1');

      expect(a.add(b).toString()).toBe('9007199254740994');
      expect(a.subtract(b).toString()).toBe('9007199254740992');
    });

    test('accepts the maximum amount and rejects above it', () => {
      expect(new Amount(MAX_NANO_PAC).toString()).toBe('42000000000000000');
      expect(() => new Amount('42000000000000001')).toThrow('Invalid amount');
    });

    test('rejects negative and non-integer values', () => {
      expect(() => new Amount('-1')).toThrow('Invalid amount');
      expect(() => new Amount(1.5)).toThrow('Invalid amount');
      expect(() => new Amount('abc')).toThrow('Invalid amount');
    });

    test('isValid reflects accepted values', () => {
      expect(Amount.isValid('1000000000')).toBe(true);
      expect(Amount.isValid(MAX_NANO_PAC)).toBe(true);
      expect(Amount.isValid('-1')).toBe(false);
      expect(Amount.isValid('1.5')).toBe(false);
      expect(Amount.isValid('42000000000000001')).toBe(false);
    });

    test('throws when subtraction would go negative', () => {
      expect(() => Amount.fromPac(1).subtract(Amount.fromPac(2))).toThrow(
        'Amount cannot be negative'
      );
    });
  });

  describe('serialization', () => {
    test('serializes to its nanoPAC string via JSON.stringify', () => {
      const amount = new Amount('1000000000');

      expect(JSON.stringify(amount)).toBe('"1000000000"');
      expect(JSON.stringify({ fee: amount })).toBe('{"fee":"1000000000"}');
    });

    test('round-trips a large value through JSON', () => {
      const original = new Amount('9007199254740993');
      const restored = new Amount(JSON.parse(JSON.stringify(original)) as string);

      expect(restored.equals(original)).toBe(true);
    });
  });
});
