import type { Writer, Reader } from '../../encoding';
import { hexToBytes, bytesToHex } from '../utils';

export const SIGNATURE_SIZE = 64;
export const SIGNATURE_TYPE_ED25519 = 3;

export class Signature {
  readonly sig: Uint8Array;

  constructor(sig: Uint8Array) {
    this.sig = sig;
  }

  static fromString(text: string): Signature {
    const data = hexToBytes(text);

    if (data.length !== SIGNATURE_SIZE) {
      throw new Error('Signature data must be 64 bytes long');
    }

    return new Signature(data);
  }

  rawBytes(): Uint8Array {
    return this.sig;
  }

  string(): string {
    return bytesToHex(this.sig);
  }

  encode(writer: Writer): void {
    writer.writeFixedBytes(this.sig);
  }

  static decode(reader: Reader): Signature {
    return new Signature(reader.readFixedBytes(SIGNATURE_SIZE));
  }
}
