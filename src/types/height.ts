import type { Writer, Reader } from '../encoding';

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

  /** Encode the height as uint32 (little-endian) to the writer. */
  encode(w: Writer): void {
    w.writeUint32(this.value);
  }

  /** Decode a Height from the reader. */
  static decode(r: Reader): Height {
    return new Height(r.readUint32());
  }
}
