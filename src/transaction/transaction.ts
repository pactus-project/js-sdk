import { blake2b } from 'blakejs';

import type { Address } from '../crypto/address';
import { Amount } from '../types/amount';
import { Height } from '../types/height';
import {
  appendUint8,
  appendStr,
  readUint8,
  readStr,
  readFixedBytes,
} from '../encoding';

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

  /** Decode a Transaction from bytes. Returns [Transaction, remaining_buf]. */
  static decode(buf: Uint8Array): [Transaction, Uint8Array] {
    const [flags, remaining1] = readUint8(buf);
    const [version, remaining2] = readUint8(remaining1);
    const [lockTime, remaining3] = Height.decode(remaining2);
    const [fee, remaining4] = Amount.decode(remaining3);
    const [memo, remaining5] = readStr(remaining4);
    const [payloadType, remaining6] = readUint8(remaining5);

    let payload: Payload;
    let remaining7: Uint8Array;

    switch (payloadType) {
      case PayloadType.TRANSFER: {
        const [p, r] = TransferPayload.decode(remaining6);

        payload = p;
        remaining7 = r;
        break;
      }

      case PayloadType.BOND: {
        const [p, r] = BondPayload.decode(remaining6);

        payload = p;
        remaining7 = r;
        break;
      }

      case PayloadType.SORTITION: {
        const [p, r] = SortitionPayload.decode(remaining6);

        payload = p;
        remaining7 = r;
        break;
      }

      case PayloadType.UNBOND: {
        const [p, r] = UnbondPayload.decode(remaining6);

        payload = p;
        remaining7 = r;
        break;
      }

      case PayloadType.WITHDRAW: {
        const [p, r] = WithdrawPayload.decode(remaining6);

        payload = p;
        remaining7 = r;
        break;
      }

      default:
        throw new Error(`unknown payload type: ${payloadType}`);
    }

    const tx = new Transaction(lockTime, fee, memo, payload);

    tx.flags = flags;
    tx.version = version;
    tx.publicKey = null;
    tx.signature = null;

    if (flags & FLAG_NOT_SIGNED) {
      return [tx, remaining7];
    }

    const signerType = payload.signer().addressType();
    const sigSize = getSignatureSize(signerType);
    const [sig, remaining8] = readFixedBytes(remaining7, sigSize);

    tx.signature = sig;

    if ((flags & FLAG_STRIPPED_PUBLIC_KEY) === 0) {
      const pubSize = getPublicKeySize(signerType);
      const [pub, remaining9] = readFixedBytes(remaining8, pubSize);

      tx.publicKey = pub;

      return [tx, remaining9];
    }

    return [tx, remaining8];
  }

  /** Create a transfer transaction. */
  static createTransferTx(
    lockTime: Height,
    sender: Address,
    receiver: Address,
    amount: Amount,
    fee: Amount,
    memo: string = '',
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
    memo: string = '',
  ): Transaction {
    const payload = new BondPayload(sender, receiver, publicKey, stake);

    return new Transaction(lockTime, fee, memo, payload);
  }

  /** Create an unbond transaction. */
  static createUnbondTx(
    lockTime: Height,
    validator: Address,
    memo: string = '',
  ): Transaction {
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
    memo: string = '',
  ): Transaction {
    const payload = new WithdrawPayload(fromAddr, toAddr, amount);

    return new Transaction(lockTime, fee, memo, payload);
  }

  /** Generate the unsigned bytes of the transaction (includes flags). */
  private getUnsignedBytes(buf: Uint8Array): Uint8Array {
    buf = appendUint8(buf, this.flags);
    buf = appendUint8(buf, this.version);
    buf = this.lockTime.encode(buf);
    buf = this.fee.encode(buf);
    buf = appendStr(buf, this.memo);
    buf = appendUint8(buf, this.payload.getType());

    return this.payload.encode(buf);
  }

  /** Return the bytes to be signed (everything except flags). */
  signBytes(): Uint8Array {
    const buf = this.getUnsignedBytes(new Uint8Array(0));

    return buf.slice(1);
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
