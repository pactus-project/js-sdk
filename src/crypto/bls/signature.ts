import { bls12_381 } from '@noble/curves/bls12-381';

import type { Writer, Reader } from '../../encoding';
import { hexToBytes, bytesToHex } from '../utils';

export const SIGNATURE_SIZE = 48;
export const SIGNATURE_TYPE_BLS = 1;
export const DST = 'BLS_SIG_BLS12381G1_XMD:SHA-256_SSWU_RO_NUL_';

const bls = bls12_381.shortSignatures;

export class Signature {
  readonly sig: Uint8Array;

  constructor(sig: Uint8Array) {
    this.sig = sig;
  }

  static fromString(text: string): Signature {
    const data = hexToBytes(text);

    if (data.length !== SIGNATURE_SIZE) {
      throw new Error('Signature data must be 48 bytes long');
    }

    return new Signature(data);
  }

  static aggregate(sigs: Signature[]): Signature {
    const pts = sigs.map(s => bls.Signature.fromBytes(new Uint8Array(s.sig)));
    const agg = bls.aggregateSignatures(pts);

    return new Signature(agg.toBytes(true));
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
    const data = reader.readFixedBytes(SIGNATURE_SIZE);
    const pt = bls.Signature.fromBytes(new Uint8Array(data));

    return new Signature(pt.toBytes(true));
  }
}
