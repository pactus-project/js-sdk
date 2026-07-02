import { appendUint32, readUint32 } from '../encoding';

/**
 * Height represents a block height in the Pactus blockchain.
 *
 * It encapsulates a raw integer value representing a block height.
 * It can be used for transaction lock times.
 */
export class Height {
  public readonly value: number;

  constructor(value: number = 0) {
    this.value = value >>> 0;
  }

  /** Encode the height as uint32 (little-endian) and append to the buffer. */
  encode(buf: Uint8Array): Uint8Array {
    return appendUint32(buf, this.value);
  }

  /** Decode a Height from bytes. Returns [Height, remaining_buf]. */
  static decode(buf: Uint8Array): [Height, Uint8Array] {
    const [val, remaining] = readUint32(buf);

    return [new Height(val), remaining];
  }
}
