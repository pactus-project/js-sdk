import { secp256k1 as noble } from '@noble/curves/secp256k1';
import { blake2b } from '@noble/hashes/blake2';
import { ripemd160 } from '@noble/hashes/legacy';

import type { Writer, Reader } from '../../encoding';
import { Address, AddressType } from '../address';
import { HRP } from '../hrp';
import { decodeWithType, encodeWithType } from '../utils';

import type { Signature } from './signature';
import { SIGNATURE_TYPE_SECP256K1 } from './signature';

const PUBLIC_KEY_SIZE = 33;

export class PublicKey {
  readonly pub: Uint8Array;

  constructor(pub: Uint8Array) {
    this.pub = pub;
  }

  static fromString(text: string): PublicKey {
    const { hrp, type, data } = decodeWithType(text);

    if (hrp !== HRP.PUBLIC_KEY_HRP) {
      throw new Error(`Invalid hrp: ${hrp}`);
    }

    if (type !== SIGNATURE_TYPE_SECP256K1) {
      throw new Error(`Invalid public key type: ${type}`);
    }

    if (data.length !== PUBLIC_KEY_SIZE) {
      throw new Error('Public key data must be 33 bytes long');
    }

    return new PublicKey(data);
  }

  rawBytes(): Uint8Array {
    return this.pub;
  }

  string(): string {
    return encodeWithType(HRP.PUBLIC_KEY_HRP, SIGNATURE_TYPE_SECP256K1, this.pub);
  }

  encode(writer: Writer): void {
    writer.writeFixedBytes(this.pub);
  }

  static decode(reader: Reader): PublicKey {
    return new PublicKey(reader.readFixedBytes(PUBLIC_KEY_SIZE));
  }

  accountAddress(): Address {
    const hash256 = blake2b(this.pub, { dkLen: 32 });
    const hash160 = ripemd160(hash256);

    return new Address(AddressType.SECP256K1_ACCOUNT, hash160);
  }

  verify(msg: Uint8Array, sig: Signature): boolean {
    const msgHash = blake2b(msg, { dkLen: 32 });

    return noble.verify(sig.sig, msgHash, this.pub);
  }
}
