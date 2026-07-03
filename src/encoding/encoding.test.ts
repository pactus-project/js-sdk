import { Writer, Reader } from './encoding';

describe('encoding', () => {
  describe('Writer/Reader', () => {
    describe('uint8', () => {
      const tests: Array<[number, number[]]> = [
        [0x00, [0x00]],
        [0x55, [0x55]],
        [0xff, [0xff]],
      ];

      for (const [value, expectedBytes] of tests) {
        it(`should encode and decode ${value}`, () => {
          const w = new Writer();
          w.writeUint8(value);
          expect(Array.from(w.toBytes())).toEqual(expectedBytes);

          const r = new Reader(w.toBytes());
          expect(r.readUint8()).toBe(value);
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
          const w = new Writer();
          w.writeUint16(value);
          expect(Array.from(w.toBytes())).toEqual(expectedBytes);

          const r = new Reader(w.toBytes());
          expect(r.readUint16()).toBe(value);
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
          const w = new Writer();
          w.writeUint32(value);
          expect(Array.from(w.toBytes())).toEqual(expectedBytes);

          const r = new Reader(w.toBytes());
          expect(r.readUint32()).toBe(value);
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
          const w = new Writer();
          w.writeVarInt(value);
          expect(Array.from(w.toBytes())).toEqual(expectedBytes);

          const r = new Reader(w.toBytes());
          expect(r.readVarInt()).toBe(value);
        });
      }
    });

    describe('str', () => {
      const str256 = 'test'.repeat(64);
      const tests: Array<[string, number[]]> = [
        ['', [0x00]],
        ['Test', [0x04, ...new TextEncoder().encode('Test')]],
        [str256, [0x80, 0x02, ...new TextEncoder().encode(str256)]],
      ];

      for (const [value, expectedBytes] of tests) {
        it(`should encode and decode "${value.length > 20 ? `${value.substring(0, 20)}...` : value}"`, () => {
          const w = new Writer();
          w.writeStr(value);
          expect(Array.from(w.toBytes())).toEqual(expectedBytes);

          const r = new Reader(w.toBytes());
          expect(r.readStr()).toBe(value);
        });
      }
    });
  });
});
