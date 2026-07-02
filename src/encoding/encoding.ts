/**
 * Writer accumulates bytes in a streaming fashion.
 *
 * Equivalent to Python's io.Writer pattern: each write call appends
 * to an internal buffer, eliminating O(n^2) concatenation.
 */
export class Writer {
  private chunks: Uint8Array[] = [];
  private _len = 0;

  /** Total bytes written so far. */
  get length(): number {
    return this._len;
  }

  /** Append raw bytes. */
  private write(data: Uint8Array): void {
    this.chunks.push(data);
    this._len += data.length;
  }

  /** Write a uint8 value (little-endian). */
  writeUint8(val: number): void {
    const byte = new Uint8Array(1);

    byte[0] = val & 0xff;
    this.write(byte);
  }

  /** Write a uint16 value (little-endian). */
  writeUint16(val: number): void {
    const bytes = new Uint8Array(2);

    bytes[0] = val & 0xff;
    bytes[1] = (val >> 8) & 0xff;
    this.write(bytes);
  }

  /** Write a uint32 value (little-endian). */
  writeUint32(val: number): void {
    const bytes = new Uint8Array(4);

    bytes[0] = val & 0xff;
    bytes[1] = (val >> 8) & 0xff;
    bytes[2] = (val >> 16) & 0xff;
    bytes[3] = (val >> 24) & 0xff;
    this.write(bytes);
  }

  /**
   * Write a variable-length integer.
   *
   * Uses a 7-bit continuation scheme: values 0–0x7f fit in one byte;
   * larger values use multiple bytes with the high bit set on all but the last byte.
   */
  writeVarInt(val: number | bigint): void {
    let v = BigInt(val);
    const parts: number[] = [];

    while (v >= 0x80n) {
      parts.push(Number((v & 0x7fn) | 0x80n));
      v >>= 7n;
    }

    parts.push(Number(v));

    this.write(new Uint8Array(parts));
  }

  /** Write a string (varint length prefix + UTF-8 bytes). */
  writeStr(val: string): void {
    const encoded = new TextEncoder().encode(val);

    this.writeVarInt(BigInt(encoded.length));
    this.write(encoded);
  }

  /** Write raw bytes. */
  writeFixedBytes(data: Uint8Array): void {
    this.write(data);
  }

  /** Return the accumulated bytes as a single Uint8Array. */
  toBytes(): Uint8Array {
    const result = new Uint8Array(this._len);
    let offset = 0;

    for (const chunk of this.chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }
}

/**
 * Reader reads bytes from a Uint8Array with an internal cursor.
 *
 * Equivalent to Python's io.BufferedReader pattern: each read advances
 * the cursor, so there's no need to pass "remaining buffer" tuples around.
 */
export class Reader {
  private buf: Uint8Array;
  private offset = 0;

  constructor(buf: Uint8Array) {
    this.buf = buf;
  }

  /** Whether all bytes have been consumed. */
  isEmpty(): boolean {
    return this.offset >= this.buf.length;
  }

  /** Read exactly `size` bytes from the stream. */
  private read(size: number): Uint8Array {
    if (this.offset + size > this.buf.length) {
      throw new Error('unexpected end of data while reading');
    }

    const data = this.buf.slice(this.offset, this.offset + size);

    this.offset += size;

    return data;
  }

  /** Read a uint8 value (little-endian). */
  readUint8(): number {
    return this.read(1)[0];
  }

  /** Read a uint16 value (little-endian). */
  readUint16(): number {
    const bytes = this.read(2);

    return bytes[0] | (bytes[1] << 8);
  }

  /** Read a uint32 value (little-endian). */
  readUint32(): number {
    const bytes = this.read(4);

    return (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0;
  }

  /** Read a variable-length integer. */
  readVarInt(): bigint {
    let result = 0n;
    let shift = 0n;

    while (true) {
      const byte = this.readUint8();

      result |= BigInt(byte & 0x7f) << shift;

      if ((byte & 0x80) === 0) {
        break;
      }

      shift += 7n;
    }

    return result;
  }

  /** Read a fixed number of bytes. */
  readFixedBytes(size: number): Uint8Array {
    return this.read(size);
  }

  /** Read a string (varint length prefix + UTF-8 bytes). */
  readStr(): string {
    const length = this.readVarInt();
    const raw = this.readFixedBytes(Number(length));

    return new TextDecoder().decode(raw);
  }
}
