import type { Writer } from '../encoding';

/**
 * Interface for a public key that can verify signatures.
 *
 * Concrete implementations: ed25519.PublicKey, bls.PublicKey
 */
export interface IPublicKey {
  /** Raw key material. */
  rawBytes(): Uint8Array;

  /** Bech32m-encoded string representation (e.g. "public1..."). */
  string(): string;

  /** Encode the key to the writer. */
  encode(w: Writer): void;

  /** Verify a signature against a message. */
  verify(msg: Uint8Array, sig: ISignature): boolean;
}

/**
 * Interface for a cryptographic signature.
 *
 * Concrete implementations: ed25519.Signature, bls.Signature
 */
export interface ISignature {
  /** Raw signature bytes. */
  rawBytes(): Uint8Array;

  /** Hex-encoded string representation. */
  string(): string;

  /** Encode the signature to the writer. */
  encode(w: Writer): void;
}

/**
 * Interface for a private key that can sign messages.
 *
 * Concrete implementations: ed25519.PrivateKey, bls.PrivateKey
 */
export interface IPrivateKey {
  /** Raw scalar bytes. */
  rawBytes(): Uint8Array;

  /** Bech32m-encoded string representation (e.g. "secret1..."). */
  string(): string;

  /** Derive the corresponding public key. */
  publicKey(): IPublicKey;

  /** Sign a message and return the signature. */
  sign(msg: Uint8Array): ISignature;
}
