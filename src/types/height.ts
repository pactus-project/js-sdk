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
  encode(writer: Writer): void {
    writer.writeUint32(this.value);
  }

  /** Decode a Height from the reader. */
  static decode(reader: Reader): Height {
    return new Height(reader.readUint32());
  }
}
