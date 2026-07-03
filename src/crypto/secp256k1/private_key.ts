import { secp256k1 as noble } from '@noble/curves/secp256k1';
import { blake2b } from '@noble/hashes/blake2';

import { decodeWithType, encodeWithType } from '../utils';
import { HRP } from '../hrp';

import { PublicKey } from './public_key';
import { Signature, SIGNATURE_TYPE_SECP256K1 } from './signature';

const PRIVATE_KEY_SIZE = 32;

export class PrivateKey {
  readonly scalar: Uint8Array;

  constructor(scalar: Uint8Array) {
    this.scalar = scalar;
  }

  static fromBytes(buffer: Uint8Array): PrivateKey {
    return new PrivateKey(buffer);
  }

  static random(): PrivateKey {
    return new PrivateKey(noble.utils.randomSecretKey());
  }

  static fromString(text: string): PrivateKey {
    const { hrp, type, data } = decodeWithType(text);

    if (hrp !== HRP.PRIVATE_KEY_HRP) {
      throw new Error(`Invalid hrp: ${hrp}`);
    }

    if (type !== SIGNATURE_TYPE_SECP256K1) {
      throw new Error(`Invalid private key type: ${type}`);
    }

    if (data.length !== PRIVATE_KEY_SIZE) {
      throw new Error('Private key data must be 32 bytes long');
    }

    return new PrivateKey(data);
  }

  rawBytes(): Uint8Array {
    return this.scalar;
  }

  string(): string {
    return encodeWithType(HRP.PRIVATE_KEY_HRP, SIGNATURE_TYPE_SECP256K1, this.scalar);
  }

  publicKey(): PublicKey {
    return new PublicKey(noble.getPublicKey(this.scalar, true));
  }

  sign(msg: Uint8Array): Signature {
    const msgHash = blake2b(msg, { dkLen: 32 });

    return new Signature(noble.sign(msgHash, this.scalar).toCompactRawBytes());
  }
}
