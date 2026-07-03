import { bls12_381 } from '@noble/curves/bls12-381';
import { sha256 } from '@noble/hashes/sha2';

import { decodeWithType, encodeWithType } from '../utils';
import { HRP } from '../hrp';

import { PublicKey } from './public_key';
import { Signature, SIGNATURE_TYPE_BLS, DST } from './signature';
import { os2ip, hkdfExtract, hkdfExpand, i2osp } from './helpers';

const PRIVATE_KEY_SIZE = 32;
const bls = bls12_381.shortSignatures;
const curveOrder = BigInt('0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001');

export class PrivateKey {
  readonly scalar: Uint8Array;

  constructor(scalar: Uint8Array) {
    this.scalar = scalar;
  }

  static fromBytes(data: Uint8Array): PrivateKey {
    return new PrivateKey(new Uint8Array(data));
  }

  static keyGen(
    ikm: Uint8Array = new Uint8Array(0),
    keyInfo: Uint8Array = new Uint8Array(0)
  ): PrivateKey {
    let salt = new TextEncoder().encode('BLS-SIG-KEYGEN-SALT-');
    let sk = BigInt(0);

    while (sk === BigInt(0)) {
      salt = new Uint8Array(sha256(salt));
      const prk = hkdfExtract(salt, new Uint8Array([...ikm, 0x00]));
      const l = Math.ceil((1.5 * Math.ceil(Math.log2(Number(curveOrder)))) / 8);
      const okm = hkdfExpand(prk, new Uint8Array([...keyInfo, ...i2osp(l, 2)]), l);

      sk = os2ip(okm) % curveOrder;
    }

    const hex = sk.toString(16).padStart(64, '0');
    const result = new Uint8Array(PRIVATE_KEY_SIZE);

    for (let i = 0; i < 32; i++) {
      result[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }

    return new PrivateKey(result);
  }

  static random(): PrivateKey {
    const ikm = crypto.getRandomValues(new Uint8Array(32));

    return PrivateKey.keyGen(ikm);
  }

  static fromString(text: string): PrivateKey {
    const { hrp, type, data } = decodeWithType(text);

    if (hrp !== HRP.PRIVATE_KEY_HRP) {
      throw new Error(`Invalid hrp: ${hrp}`);
    }

    if (type !== SIGNATURE_TYPE_BLS) {
      throw new Error(`Invalid private key type: ${type}`);
    }

    if (data.length !== PRIVATE_KEY_SIZE) {
      throw new Error('Private key data must be 32 bytes long');
    }

    return PrivateKey.fromBytes(new Uint8Array(data));
  }

  rawBytes(): Uint8Array {
    return this.scalar;
  }

  string(): string {
    return encodeWithType(HRP.PRIVATE_KEY_HRP, SIGNATURE_TYPE_BLS, this.scalar, 200);
  }

  publicKey(): PublicKey {
    const pt = bls.getPublicKey(this.scalar);

    return new PublicKey(pt.toBytes(true));
  }

  sign(msg: Uint8Array): Signature {
    const hashedMsg = bls.hash(msg, DST);
    const sigPt = bls.sign(hashedMsg, this.scalar);

    return new Signature(sigPt.toBytes(true));
  }
}
