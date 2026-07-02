import { AddressType } from '../../crypto/address';
import type { Address } from '../../crypto/address';

export enum PayloadType {
  TRANSFER = 1,
  BOND = 2,
  SORTITION = 3,
  UNBOND = 4,
  WITHDRAW = 5,
}

export interface Payload {
  encode(buf: Uint8Array): Uint8Array;
  getType(): PayloadType;
  signer(): Address;
}

/** Signature size in bytes for each address type. */
export function getSignatureSize(addressType: AddressType): number {
  switch (addressType) {
    case AddressType.VALIDATOR:
    case AddressType.BLS_ACCOUNT:
      return 48;
    case AddressType.ED25519_ACCOUNT:
      return 64;
    case AddressType.SECP256K1_ACCOUNT:
      return 64;
    default:
      throw new Error(`unknown address type for signature: ${addressType}`);
  }
}

/** Public key size in bytes for each address type. */
export function getPublicKeySize(addressType: AddressType): number {
  switch (addressType) {
    case AddressType.VALIDATOR:
    case AddressType.BLS_ACCOUNT:
      return 96;
    case AddressType.ED25519_ACCOUNT:
      return 32;
    case AddressType.SECP256K1_ACCOUNT:
      return 33;
    default:
      throw new Error(`unknown address type for public key: ${addressType}`);
  }
}
