import { blake2b } from 'blakejs';

import type { Address } from '../crypto/address';
import { Amount } from '../types/amount';
import { Height } from '../types/height';
import type { Reader } from '../encoding';
import { Writer } from '../encoding';

import {
  PayloadType,
  TransferPayload,
  BondPayload,
  SortitionPayload,
  UnbondPayload,
  WithdrawPayload,
  getSignatureSize,
  getPublicKeySize,
  type Payload,
} from './payload';

// ---- Compatibility types for wallet module ----

/** @deprecated Use Transaction class with TransferPayload instead */
export interface TransferTransaction {
  sender: string;
  receiver: string;
  amount: Amount;
  fee: Amount;
  memo?: string;
}

/** @deprecated Use Transaction class with BondPayload instead */
export interface BondTransaction {
  sender: string;
  receiver: string;
  stake: Amount;
  fee: Amount;
  memo?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public_key: string;
}

export const TransactionType = {
  UNKNOWN: 0,
  TRANSFER_PAYLOAD: 1,
  BOND_PAYLOAD: 2,
  SORTITION_PAYLOAD: 3,
  UNBOND_PAYLOAD: 4,
  WITHDRAW_PAYLOAD: 5,
};

export const TransactionDetailsType = {
  TRANSACTION_DATA: 0,
  TRANSACTION_INFO: 1,
};

export interface CalculateFee {
  amount: Amount;
  fee: Amount;
}

export interface RawTransferTransaction {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  raw_transaction: string;
  id: string;
}

// ---- Transaction implementation ----

const FLAG_STRIPPED_PUBLIC_KEY = 0x01;
const FLAG_NOT_SIGNED = 0x02;

export class Transaction {
  public flags: number;
  public version: number;
  public lockTime: Height;
  public fee: Amount;
  public memo: string;
  public payload: Payload;
  public publicKey: Uint8Array | null;
  public signature: Uint8Array | null;

  constructor(lockTime: Height, fee: Amount, memo: string, payload: Payload) {
    this.lockTime = lockTime;
    this.memo = memo;
    this.flags = 0;
    this.version = 1;
    this.fee = fee;
    this.payload = payload;
    this.publicKey = null;
    this.signature = null;
  }

  /** Decode a Transaction from the reader. */
  static decode(reader: Reader): Transaction {
    const flags = reader.readUint8();
    const version = reader.readUint8();
    const lockTime = Height.decode(reader);
    const fee = Amount.decode(reader);
    const memo = reader.readStr();
    const payloadType = reader.readUint8();

    let payload: Payload;

    switch (payloadType) {
      case PayloadType.TRANSFER:
        payload = TransferPayload.decode(reader);
        break;
      case PayloadType.BOND:
        payload = BondPayload.decode(reader);
        break;
      case PayloadType.SORTITION:
        payload = SortitionPayload.decode(reader);
        break;
      case PayloadType.UNBOND:
        payload = UnbondPayload.decode(reader);
        break;
      case PayloadType.WITHDRAW:
        payload = WithdrawPayload.decode(reader);
        break;
      default:
        throw new Error(`unknown payload type: ${payloadType}`);
    }

    const tx = new Transaction(lockTime, fee, memo, payload);

    tx.flags = flags;
    tx.version = version;
    tx.publicKey = null;
    tx.signature = null;

    if (flags & FLAG_NOT_SIGNED) {
      return tx;
    }

    const signerType = payload.signer().addressType();
    const sigSize = getSignatureSize(signerType);

    tx.signature = reader.readFixedBytes(sigSize);

    if ((flags & FLAG_STRIPPED_PUBLIC_KEY) === 0) {
      const pubSize = getPublicKeySize(signerType);

      tx.publicKey = reader.readFixedBytes(pubSize);
    }

    return tx;
  }

  /** Create a transfer transaction. */
  static createTransferTx(
    lockTime: Height,
    sender: Address,
    receiver: Address,
    amount: Amount,
    fee: Amount,
    memo: string = ''
  ): Transaction {
    const payload = new TransferPayload(sender, receiver, amount);

    return new Transaction(lockTime, fee, memo, payload);
  }

  /** Create a bond transaction. */
  static createBondTx(
    lockTime: Height,
    sender: Address,
    receiver: Address,
    publicKey: Uint8Array | null,
    fee: Amount,
    stake: Amount,
    memo: string = ''
  ): Transaction {
    const payload = new BondPayload(sender, receiver, publicKey, stake);

    return new Transaction(lockTime, fee, memo, payload);
  }

  /** Create an unbond transaction. */
  static createUnbondTx(lockTime: Height, validator: Address, memo: string = ''): Transaction {
    const payload = new UnbondPayload(validator);

    return new Transaction(lockTime, Amount.zero(), memo, payload);
  }

  /** Create a withdraw transaction. */
  static createWithdrawTx(
    lockTime: Height,
    fromAddr: Address,
    toAddr: Address,
    amount: Amount,
    fee: Amount,
    memo: string = ''
  ): Transaction {
    const payload = new WithdrawPayload(fromAddr, toAddr, amount);

    return new Transaction(lockTime, fee, memo, payload);
  }

  /** Write the unsigned bytes of the transaction to the writer. */
  private writeUnsignedBytes(writer: Writer): void {
    writer.writeUint8(this.flags);
    writer.writeUint8(this.version);
    this.lockTime.encode(writer);
    this.fee.encode(writer);
    writer.writeStr(this.memo);
    writer.writeUint8(this.payload.getType());
    this.payload.encode(writer);
  }

  /** Return the bytes to be signed (everything except flags). */
  signBytes(): Uint8Array {
    const w = new Writer();

    this.writeUnsignedBytes(w);

    return w.toBytes().slice(1);
  }

  /** Return the transaction ID (blake2b-256 of sign bytes). */
  id(): Uint8Array {
    return blake2b(this.signBytes(), undefined, 32);
  }

  /**
   * Sign the transaction and return signed bytes.
   *
   * NOTE: Signing is not yet supported in the TypeScript SDK.
   * BLS, Ed25519, and secp256k1 signing are not implemented.
   */
  sign(): Uint8Array {
    throw new Error('signing is not supported in the TypeScript SDK');
  }
}
