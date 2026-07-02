/**
 * Concatenate two Uint8Arrays into a new Uint8Array.
 */
function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length + b.length);

  result.set(a);
  result.set(b, a.length);

  return result;
}

/**
 * Append a uint8 value (little-endian) to the buffer.
 */
export function appendUint8(buf: Uint8Array, val: number): Uint8Array {
  const byte = new Uint8Array(1);

  byte[0] = val & 0xff;

  return concat(buf, byte);
}

/**
 * Append a uint16 value (little-endian) to the buffer.
 */
export function appendUint16(buf: Uint8Array, val: number): Uint8Array {
  const bytes = new Uint8Array(2);

  bytes[0] = val & 0xff;
  bytes[1] = (val >> 8) & 0xff;

  return concat(buf, bytes);
}

/**
 * Append a uint32 value (little-endian) to the buffer.
 */
export function appendUint32(buf: Uint8Array, val: number): Uint8Array {
  const bytes = new Uint8Array(4);

  bytes[0] = val & 0xff;
  bytes[1] = (val >> 8) & 0xff;
  bytes[2] = (val >> 16) & 0xff;
  bytes[3] = (val >> 24) & 0xff;

  return concat(buf, bytes);
}

/**
 * Append a variable-length integer to the buffer.
 *
 * Uses a 7-bit continuation scheme: values 0–0x7f fit in one byte;
 * larger values use multiple bytes with the high bit set on all but the last byte.
 *
 * Accepts both `number` and `bigint`. Returns a buffer with the encoded varint.
 */
export function appendVarInt(buf: Uint8Array, val: number | bigint): Uint8Array {
  let v = BigInt(val);

  const parts: number[] = [];

  while (v >= 0x80n) {
    const n = Number((v & 0x7fn) | 0x80n);

    parts.push(n);
    v >>= 7n;
  }

  parts.push(Number(v));

  return concat(buf, new Uint8Array(parts));
}

/**
 * Append a string to the buffer.
 *
 * The string is encoded as a varint length prefix followed by UTF-8 encoded bytes.
 */
export function appendStr(buf: Uint8Array, val: string): Uint8Array {
  const encoded = new TextEncoder().encode(val);

  const withLength = appendVarInt(buf, BigInt(encoded.length));

  return concat(withLength, encoded);
}

/**
 * Append raw bytes to the buffer.
 */
export function appendFixedBytes(buf: Uint8Array, data: Uint8Array): Uint8Array {
  return concat(buf, data);
}

/**
 * Read a uint8 value (little-endian) from the buffer.
 * Returns the value and the remaining bytes.
 */
export function readUint8(buf: Uint8Array): [number, Uint8Array] {
  const val = buf[0];

  return [val, buf.slice(1)];
}

/**
 * Read a uint16 value (little-endian) from the buffer.
 * Returns the value and the remaining bytes.
 */
export function readUint16(buf: Uint8Array): [number, Uint8Array] {
  const val = buf[0] | (buf[1] << 8);

  return [val, buf.slice(2)];
}

/**
 * Read a uint32 value (little-endian) from the buffer.
 * Returns the value and the remaining bytes.
 */
export function readUint32(buf: Uint8Array): [number, Uint8Array] {
  const val = (buf[0] | (buf[1] << 8) | (buf[2] << 16) | (buf[3] << 24)) >>> 0;

  return [val, buf.slice(4)];
}

/**
 * Read a variable-length integer from the buffer.
 * Returns the value as a bigint and the remaining bytes.
 *
 * @throws Error if the buffer ends unexpectedly while reading the varint.
 */
export function readVarInt(buf: Uint8Array): [bigint, Uint8Array] {
  let result = 0n;
  let shift = 0n;

  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];

    result |= BigInt(byte & 0x7f) << shift;
    shift += 7n;

    if ((byte & 0x80) === 0) {
      return [result, buf.slice(i + 1)];
    }
  }

  throw new Error('unexpected end of data while reading varint');
}

/**
 * Read a fixed number of bytes from the buffer.
 * Returns the read bytes and the remaining bytes.
 *
 * @throws Error if the buffer has fewer bytes than requested.
 */
export function readFixedBytes(buf: Uint8Array, size: number): [Uint8Array, Uint8Array] {
  if (size > buf.length) {
    throw new Error('unexpected end of data while reading fixed bytes');
  }

  return [buf.slice(0, size), buf.slice(size)];
}

/**
 * Read a variable-length string (varint length prefix + UTF-8 bytes) from the buffer.
 * Returns the string and the remaining bytes.
 */
export function readStr(buf: Uint8Array): [string, Uint8Array] {
  const [length, remaining] = readVarInt(buf);
  const [raw, rest] = readFixedBytes(remaining, Number(length));

  return [new TextDecoder().decode(raw), rest];
}
