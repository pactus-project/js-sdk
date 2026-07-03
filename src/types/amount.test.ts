import { Amount } from './amount';
import { Writer, Reader } from '../encoding';

const testCases = [
  {
    pacValue: 0,
    nanoPacValue: 0,
    strValue: '0.0',
  },
  {
    pacValue: 42.5,
    nanoPacValue: 42_500_000_000,
    strValue: '42.5',
  },
  {
    pacValue: 1.0,
    nanoPacValue: 1_000_000_000,
    strValue: '1.0',
  },
  {
    pacValue: 0.5,
    nanoPacValue: 500_000_000,
    strValue: '0.5',
  },
  {
    pacValue: 1000000.0,
    nanoPacValue: 1_000_000_000_000_000,
    strValue: '1000000.0',
  },
  {
    pacValue: 42000000,
    nanoPacValue: 42_000_000_000_000_000,
    strValue: '42000000.0',
  },
  {
    pacValue: 0.000_000_001,
    nanoPacValue: 1,
    strValue: '1e-09',
  },
];

describe('Amount', () => {
  describe('from pac', () => {
    it('should reject NaN and Infinity', () => {
      expect(() => Amount.fromPac(NaN)).toThrow();
      expect(() => Amount.fromPac(Infinity)).toThrow();
      expect(() => Amount.fromPac(-Infinity)).toThrow();
    });
  });

  describe('from string', () => {
    for (const tc of testCases) {
      it(`should parse "${tc.strValue}"`, () => {
        const amt = Amount.fromString(tc.strValue);
        expect(Number(amt.toString())).toBe(tc.nanoPacValue);
      });
    }
  });

  describe('conversion', () => {
    for (const tc of testCases) {
      it(`should convert ${tc.pacValue} PAC`, () => {
        const amt = Amount.fromPac(tc.pacValue);
        expect(amt.toPac()).toBe(tc.pacValue);
        expect(Number(amt.toString())).toBe(tc.nanoPacValue);
      });
    }
  });

  describe('encode/decode', () => {
    for (const tc of testCases) {
      it(`should encode and decode ${tc.nanoPacValue} nanoPAC`, () => {
        const amt = Amount.fromNanoPac(tc.nanoPacValue.toString());

        const w = new Writer();
        amt.encode(w);

        const r = new Reader(w.toBytes());
        const decoded = Amount.decode(r);
        expect(decoded.toString()).toBe(amt.toString());
      });
    }
  });

  describe('operations', () => {
    it('adds two amounts', () => {
      const a = Amount.fromPac(1);
      const b = Amount.fromPac(2.5);
      const sum = a.add(b);
      expect(sum.toPac()).toBe(3.5);
    });

    it('subtracts amounts', () => {
      const a = Amount.fromPac(5);
      const b = Amount.fromPac(2);
      const diff = a.subtract(b);
      expect(diff.toPac()).toBe(3);
    });

    it('compares amounts', () => {
      const small = Amount.fromPac(1);
      const medium = Amount.fromPac(5);
      const large = Amount.fromPac(10);
      expect(medium.greaterThan(small)).toBe(true);
      expect(medium.lessThan(large)).toBe(true);
      expect(medium.equals(Amount.fromPac(5))).toBe(true);
    });

    it('creates zero amount', () => {
      expect(Amount.zero().toString()).toBe('0');
    });
  });
});
