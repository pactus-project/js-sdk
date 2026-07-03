import { bls12_381 } from '@noble/curves/bls12-381';
import { blake2b } from '@noble/hashes/blake2';
import { ripemd160 } from '@noble/hashes/legacy';

import type { Writer, Reader } from '../../encoding';
import { Address, AddressType } from '../address';
import { HRP } from '../hrp';
import { decodeWithType, encodeWithType } from '../utils';

import type { Signature } from './signature';
import { SIGNATURE_TYPE_BLS, DST } from './signature';

export const PUBLIC_KEY_SIZE = 96;

const bls = bls12_381.shortSignatures;
const G2 = bls12_381.G2.Point;

export class PublicKey {
  readonly point: Uint8Array;

  constructor(point: Uint8Array) {
    this.point = point;
  }

  static fromBytes(data: Uint8Array): PublicKey {
    return new PublicKey(new Uint8Array(data));
  }

  static fromString(text: string): PublicKey {
    const { hrp, type, data } = decodeWithType(text, 200);

    if (hrp !== HRP.PUBLIC_KEY_HRP) {
      throw new Error(`Invalid hrp: ${hrp}`);
    }

    if (type !== SIGNATURE_TYPE_BLS) {
      throw new Error(`Invalid public key type: ${type}`);
    }

    if (data.length !== PUBLIC_KEY_SIZE) {
      throw new Error('Public key data must be 96 bytes long');
    }

    return new PublicKey(new Uint8Array(data));
  }

  static aggregate(pubs: PublicKey[]): PublicKey {
    const pts = pubs.map(p => G2.fromBytes(new Uint8Array(p.point)));
    const agg = bls.aggregatePublicKeys(pts);

    return new PublicKey(new Uint8Array(agg.toBytes(true)));
  }

  rawBytes(): Uint8Array {
    return this.point;
  }

  string(): string {
    return encodeWithType(HRP.PUBLIC_KEY_HRP, SIGNATURE_TYPE_BLS, this.point, 200);
  }

  encode(writer: Writer): void {
    writer.writeFixedBytes(this.point);
  }

  static decode(reader: Reader): PublicKey {
    return new PublicKey(reader.readFixedBytes(PUBLIC_KEY_SIZE));
  }

  accountAddress(): Address {
    return this._makeAddress(AddressType.BLS_ACCOUNT);
  }

  validatorAddress(): Address {
    return this._makeAddress(AddressType.VALIDATOR);
  }

  private _makeAddress(addressType: AddressType): Address {
    const hash256 = blake2b(this.point, { dkLen: 32 });
    const hash160 = ripemd160(hash256);

    return new Address(addressType, new Uint8Array(hash160));
  }

  verify(msg: Uint8Array, sig: Signature): boolean {
    const hashedMsg = bls.hash(msg, DST);
    const sigPoint = bls.Signature.fromBytes(new Uint8Array(sig.sig));
    const pubPoint = G2.fromBytes(new Uint8Array(this.point));

    return bls.verify(sigPoint, hashedMsg, pubPoint);
  }
}
