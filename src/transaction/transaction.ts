import { blake2b } from 'blakejs';

import type { Address } from '../crypto/address';
import { AddressType } from '../crypto/address';
import type { IPublicKey, ISignature, IPrivateKey } from '../crypto/interfaces';
import { PublicKey as Ed25519PublicKey } from '../crypto/ed25519/public_key';
import { Signature as Ed25519Signature } from '../crypto/ed25519/signature';
import { PublicKey as BlsPublicKey } from '../crypto/bls/public_key';
import { Signature as BlsSignature } from '../crypto/bls/signature';
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

export const FLAG_NOT_SIGNED = 0x02;

export class Transaction {
  public flags: number;
  public version: number;
  public lockTime: Height;
  public fee: Amount;
  public memo: string;
  public payload: Payload;
  public publicKey: IPublicKey | null;
  public signature: ISignature | null;

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
  static decode(r: Reader): Transaction {
    const flags = r.readUint8();
    const version = r.readUint8();
    const lockTime = Height.decode(r);
    const fee = Amount.decode(r);
    const memo = r.readStr();
    const payloadType = r.readUint8();

    let payload: Payload;

    switch (payloadType) {
      case PayloadType.TRANSFER:
        payload = TransferPayload.decode(r);
        break;
      case PayloadType.BOND:
        payload = BondPayload.decode(r);
        break;
      case PayloadType.SORTITION:
        payload = SortitionPayload.decode(r);
        break;
      case PayloadType.UNBOND:
        payload = UnbondPayload.decode(r);
        break;
      case PayloadType.WITHDRAW:
        payload = WithdrawPayload.decode(r);
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
    const sigBytes = r.readFixedBytes(sigSize);

    tx.signature = createSignature(sigBytes, signerType);

    if ((flags & FLAG_STRIPPED_PUBLIC_KEY) === 0) {
      const pubSize = getPublicKeySize(signerType);

      tx.publicKey = createPublicKey(r.readFixedBytes(pubSize), signerType);
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

  /** Encode the transaction to the writer (unsigned or signed). */
  encode(w: Writer): void {
    w.writeUint8(this.flags);
    w.writeUint8(this.version);
    this.lockTime.encode(w);
    this.fee.encode(w);
    w.writeStr(this.memo);
    w.writeUint8(this.payload.getType());
    this.payload.encode(w);

    if (!(this.flags & FLAG_NOT_SIGNED) && this.signature && this.publicKey) {
      this.signature.encode(w);
      this.publicKey.encode(w);
    }
  }

  /** Return the bytes to be signed (version through payload, without flags). */
  signBytes(): Uint8Array {
    const w = new Writer();

    w.writeUint8(this.version);
    this.lockTime.encode(w);
    this.fee.encode(w);
    w.writeStr(this.memo);
    w.writeUint8(this.payload.getType());
    this.payload.encode(w);

    return w.toBytes();
  }

  /** Return the transaction ID (blake2b-256 of sign bytes). */
  id(): Uint8Array {
    return blake2b(this.signBytes(), undefined, 32);
  }

  /**
   * Sign the transaction with a private key.
   *
   * Clears the FLAG_NOT_SIGNED flag, computes the signature over signBytes(),
   * and stores both signature and the derived public key.
   */
  sign(privateKey: IPrivateKey): void {
    const msg = this.signBytes();

    this.signature = privateKey.sign(msg);
    this.publicKey = privateKey.publicKey();
    this.flags &= ~FLAG_NOT_SIGNED;
  }

  /**
   * Verify the transaction signature.
   *
   * Returns true if the signature is valid against the stored public key and
   * the transaction's sign bytes. Returns false if publicKey or signature is
   * missing.
   */
  verify(): boolean {
    if (!this.publicKey || !this.signature) {
      return false;
    }

    return this.publicKey.verify(this.signBytes(), this.signature);
  }
}

// ---- Factory helpers for typed crypto objects ----

function createPublicKey(bytes: Uint8Array, addressType: AddressType): IPublicKey {
  // Ensure a plain Uint8Array (not a Buffer subclass) for noble compatibility
  const raw = new Uint8Array(bytes);

  switch (addressType) {
    case AddressType.ED25519_ACCOUNT:
      return new Ed25519PublicKey(raw);
    case AddressType.BLS_ACCOUNT:
    case AddressType.VALIDATOR:
      return new BlsPublicKey(raw);
    default:
      throw new Error(`unknown address type for public key: ${addressType}`);
  }
}

function createSignature(bytes: Uint8Array, addressType: AddressType): ISignature {
  // Ensure a plain Uint8Array (not a Buffer subclass) for noble compatibility
  const raw = new Uint8Array(bytes);

  switch (addressType) {
    case AddressType.ED25519_ACCOUNT:
      return new Ed25519Signature(raw);
    case AddressType.BLS_ACCOUNT:
    case AddressType.VALIDATOR:
      return new BlsSignature(raw);
    default:
      throw new Error(`unknown address type for signature: ${addressType}`);
  }
}
