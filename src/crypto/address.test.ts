import { Address } from './address';
import { Writer, Reader } from '../encoding';

const testCases = [
  {
    str: 'pc1pcs9ezsmn6n7fc8jxzxks4n2lyw4ltzsdc9v8qn',
    hex: '01c40b914373d4fc9c1e4611ad0acd5f23abf58a0d',
  },
  {
    str: 'pc1zcs9ezsmn6n7fc8jxzxks4n2lyw4ltzsd9wu6hw',
    hex: '02c40b914373d4fc9c1e4611ad0acd5f23abf58a0d',
  },
  {
    str: 'pc1rj65g93q7lpdq0366vst22l7va9d26j3l2vr0em',
    hex: '0396a882c41ef85a07c75a6416a57fcce95aad4a3f',
  },
  {
    str: 'pc1y90qakls8jlz9hyvdcsqsj0yj2lrqz26vqu7l0z',
    hex: '042bc1db7e0797c45b918dc401093c9257c6012b4c',
  },
];

describe('Address', () => {
  describe('string', () => {
    for (const tc of testCases) {
      it(`should parse and serialize "${tc.str}"`, () => {
        const addr = Address.fromString(tc.str);
        expect(addr.string()).toBe(tc.str);
        expect(bytesToHex(addr.rawBytes())).toBe(tc.hex);
      });
    }
  });

  describe('encode/decode', () => {
    for (const tc of testCases) {
      it(`should encode and decode "${tc.str}"`, () => {
        const addr = Address.fromString(tc.str);

        const w = new Writer();
        addr.encode(w);
        expect(bytesToHex(w.toBytes())).toBe(tc.hex);

        const r = new Reader(w.toBytes());
        const decoded = Address.decode(r);
        expect(decoded.string()).toBe(addr.string());
      });
    }
  });

  describe('treasury address', () => {
    it('should handle treasury address', () => {
      const addr = Address.fromString('000000000000000000000000000000000000000000');

      expect(bytesToHex(addr.rawBytes())).toBe('000000000000000000000000000000000000000000');
      expect(addr.isTreasuryAddress()).toBe(true);

      const w = new Writer();
      addr.encode(w);
      expect(bytesToHex(w.toBytes())).toBe('00');
    });
  });

  describe('invalid', () => {
    const invalidCases = ['pc1p0hrct7eflrpw4ccrttxzs4qud2axex4dg8xaf5', ''];

    for (const input of invalidCases) {
      it(`should reject "${input || '<empty>'}"`, () => {
        expect(() => Address.fromString(input)).toThrow();
      });
    }
  });
});

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
