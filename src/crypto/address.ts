import type { Writer, Reader } from '../encoding';

import { decodeWithType, encodeWithType } from './utils';
import { HRP } from './hrp';

const ADDRESS_SIZE = 21;
const TREASURY_ADDRESS_STRING = '000000000000000000000000000000000000000000';

export enum AddressType {
  TREASURY = 0,
  VALIDATOR = 1,
  BLS_ACCOUNT = 2,
  ED25519_ACCOUNT = 3,
  SECP256K1_ACCOUNT = 4,
}

/**
 * Address represents a Pactus blockchain address.
 *
 * The internal format is 21 bytes: 1 type byte + 20 bytes data.
 */
export class Address {
  private readonly _data: Uint8Array;

  constructor(addressType: AddressType, data: Uint8Array) {
    if (data.length !== ADDRESS_SIZE - 1) {
      throw new Error('Data must be 20 bytes long');
    }

    this._data = new Uint8Array(ADDRESS_SIZE);
    this._data[0] = addressType;
    this._data.set(data, 1);
  }

  /** Create an Address from a bech32m encoded string. */
  static fromString(text: string): Address {
    if (text === TREASURY_ADDRESS_STRING) {
      return new Address(AddressType.TREASURY, new Uint8Array(20));
    }

    const { hrp, type, data } = decodeWithType(text);

    if (hrp !== HRP.ADDRESS_HRP) {
      throw new Error(`Invalid HRP: ${hrp}`);
    }

    if (
      type === AddressType.VALIDATOR ||
      type === AddressType.BLS_ACCOUNT ||
      type === AddressType.ED25519_ACCOUNT ||
      type === AddressType.SECP256K1_ACCOUNT
    ) {
      if (data.length !== 20) {
        throw new Error(`Invalid length: ${data.length + 1}`);
      }
    } else {
      throw new Error(`Invalid address type: ${type}`);
    }

    return new Address(type, data);
  }

  /** Return the raw 21-byte representation (type + data). */
  rawBytes(): Uint8Array {
    return this._data;
  }

  /** Convert the address to a bech32m string. */
  string(): string {
    if (this.isTreasuryAddress()) {
      return TREASURY_ADDRESS_STRING;
    }

    return encodeWithType(HRP.ADDRESS_HRP, this._data[0], this._data.slice(1));
  }

  /** Get the address type. */
  addressType(): AddressType {
    return this._data[0] as AddressType;
  }

  /** Check if this is a treasury address. */
  isTreasuryAddress(): boolean {
    return this.addressType() === AddressType.TREASURY;
  }

  /** Check if this is an account address. */
  isAccountAddress(): boolean {
    return !this.isValidatorAddress();
  }

  /** Check if this is a validator address. */
  isValidatorAddress(): boolean {
    return this.addressType() === AddressType.VALIDATOR;
  }

  /** Encode the address to the writer. */
  encode(writer: Writer): void {
    if (this.isTreasuryAddress()) {
      writer.writeUint8(AddressType.TREASURY);
    } else {
      writer.writeFixedBytes(this.rawBytes());
    }
  }

  /** Decode an Address from the reader. */
  static decode(reader: Reader): Address {
    const addrType = reader.readUint8();

    if (addrType === AddressType.TREASURY) {
      return new Address(AddressType.TREASURY, new Uint8Array(20));
    }

    const data = reader.readFixedBytes(20);

    return new Address(addrType as AddressType, data);
  }
}
