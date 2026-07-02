import {
  appendUint8,
  appendUint16,
  appendUint32,
  appendVarInt,
  appendStr,
  readUint8,
  readUint16,
  readUint32,
  readVarInt,
  readStr,
} from './encoding';

describe('encoding', () => {
  describe('uint8', () => {
    const tests: Array<[number, number[]]> = [
      [0x00, [0x00]],
      [0x55, [0x55]],
      [0xff, [0xff]],
    ];

    for (const [value, expectedBytes] of tests) {
      it(`should encode and decode ${value}`, () => {
        const buf = appendUint8(new Uint8Array(0), value);

        expect(Array.from(buf)).toEqual(expectedBytes);

        const [read, remaining] = readUint8(buf);

        expect(read).toBe(value);
        expect(remaining.length).toBe(0);
      });
    }
  });

  describe('uint16', () => {
    const tests: Array<[number, number[]]> = [
      [0x0000, [0x00, 0x00]],
      [0x5050, [0x50, 0x50]],
      [0x0505, [0x05, 0x05]],
      [0x1234, [0x34, 0x12]],
      [0xffff, [0xff, 0xff]],
    ];

    for (const [value, expectedBytes] of tests) {
      it(`should encode and decode ${value}`, () => {
        const buf = appendUint16(new Uint8Array(0), value);

        expect(Array.from(buf)).toEqual(expectedBytes);

        const [read, remaining] = readUint16(buf);

        expect(read).toBe(value);
        expect(remaining.length).toBe(0);
      });
    }
  });

  describe('uint32', () => {
    const tests: Array<[number, number[]]> = [
      [0x00000000, [0x00, 0x00, 0x00, 0x00]],
      [0x50505050, [0x50, 0x50, 0x50, 0x50]],
      [0x05050505, [0x05, 0x05, 0x05, 0x05]],
      [0x12345678, [0x78, 0x56, 0x34, 0x12]],
      [0xffffffff, [0xff, 0xff, 0xff, 0xff]],
    ];

    for (const [value, expectedBytes] of tests) {
      it(`should encode and decode ${value}`, () => {
        const buf = appendUint32(new Uint8Array(0), value);

        expect(Array.from(buf)).toEqual(expectedBytes);

        const [read, remaining] = readUint32(buf);

        expect(read).toBe(value);
        expect(remaining.length).toBe(0);
      });
    }
  });

  describe('varint', () => {
    const tests: Array<[bigint, number[]]> = [
      [0x0n, [0x00]],
      [0xffn, [0xff, 0x01]],
      [0x7fffn, [0xff, 0xff, 0x01]],
      [0x3fffffn, [0xff, 0xff, 0xff, 0x01]],
      [0x1fffffffn, [0xff, 0xff, 0xff, 0xff, 0x01]],
      [0xfffffffffn, [0xff, 0xff, 0xff, 0xff, 0xff, 0x01]],
      [0x7ffffffffffn, [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01]],
      [0x3ffffffffffffn, [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01]],
      [0x1ffffffffffffffn, [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01]],
      [0xffffffffffffffffn, [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01]],
      [0x200n, [0x80, 0x04]],
      [0x027fn, [0xff, 0x04]],
      [0xff00000000n, [0x80, 0x80, 0x80, 0x80, 0xf0, 0x1f]],
      [0xffffffffn, [0xff, 0xff, 0xff, 0xff, 0x0f]],
      [0x100000000n, [0x80, 0x80, 0x80, 0x80, 0x10]],
      [0x7ffffffffn, [0xff, 0xff, 0xff, 0xff, 0x7f]],
      [0x800000000n, [0x80, 0x80, 0x80, 0x80, 0x80, 0x01]],
    ];

    for (const [value, expectedBytes] of tests) {
      it(`should encode and decode ${value}`, () => {
        const buf = appendVarInt(new Uint8Array(0), value);

        expect(Array.from(buf)).toEqual(expectedBytes);

        const [read, remaining] = readVarInt(buf);

        expect(read).toBe(value);
        expect(remaining.length).toBe(0);
      });
    }
  });

  describe('str', () => {
    it('should encode and decode empty string', () => {
      const buf = appendStr(new Uint8Array(0), '');

      expect(Array.from(buf)).toEqual([0x00]);

      const [read, remaining] = readStr(buf);

      expect(read).toBe('');
      expect(remaining.length).toBe(0);
    });

    it('should encode and decode "Test"', () => {
      const buf = appendStr(new Uint8Array(0), 'Test');

      expect(Array.from(buf)).toEqual([0x04, ...new TextEncoder().encode('Test')]);

      const [read, remaining] = readStr(buf);

      expect(read).toBe('Test');
      expect(remaining.length).toBe(0);
    });

    it('should encode and decode a 256-character string', () => {
      const str256 = 'test'.repeat(64);
      const buf = appendStr(new Uint8Array(0), str256);

      // Length 256 is encoded as varint: 256 = 0x100 -> varint: [0x80, 0x02]
      const expected = new Uint8Array([0x80, 0x02, ...new TextEncoder().encode(str256)]);

      expect(Array.from(buf)).toEqual(Array.from(expected));

      const [read, remaining] = readStr(buf);

      expect(read).toBe(str256);
      expect(remaining.length).toBe(0);
    });
  });
});
