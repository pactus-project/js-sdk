import { Transaction } from './transaction';
import { Address } from '../crypto/address';
import { Amount } from '../types/amount';
import { Height } from '../types/height';
import { Reader } from '../encoding';
import type { TransferPayload, BondPayload } from './payload';
import { PayloadType } from './payload';

describe('Transaction', () => {
  describe('decode transfer transaction', () => {
    it('should decode a signed transfer transaction', () => {
      // https://pactusscan.com/transaction/1b6b7226f7935a15f05371d1a1fefead585a89704ce464b7cc1d453d299d235f
      const signedDataHex =
        '000124a3230080ade2040b77616c6c65742d636f726501' +
        '037098338e0b6808119dfd4457ab806b9c2059b89b' +
        '037a14ae24533816e7faaa6ed28fcdde8e55a7df21' +
        '8084af5f' +
        '4ed8fee3d8992e82660dd05bbe8608fc56ceabffdeeee61e3213b9b49d33a0fc' +
        '8dea6d79ee7ec60f66433f189ed9b3c50b2ad6fa004e26790ee736693eda8506' +
        '95794161374b22c696dabb98e93f6ca9300b22f3b904921fbf560bb72145f4fa';
      const expectedTxId = '1b6b7226f7935a15f05371d1a1fefead585a89704ce464b7cc1d453d299d235f';
      const expectedSignBytes =
        '0124a3230080ade2040b77616c6c65742d636f726501' +
        '037098338e0b6808119dfd4457ab806b9c2059b89b' +
        '037a14ae24533816e7faaa6ed28fcdde8e55a7df21' +
        '8084af5f';

      const raw = hexToBytes(signedDataHex);
      const tx = Transaction.decode(new Reader(raw));

      expect(tx.version).toBe(1);
      expect(tx.lockTime.value).toBe(2335524);
      expect(tx.fee.toString()).toBe('10000000');
      expect(tx.memo).toBe('wallet-core');
      expect(tx.payload.getType()).toBe(PayloadType.TRANSFER);

      const pld = tx.payload as TransferPayload;
      expect(pld.sender.string()).toBe('pc1rwzvr8rstdqypr80ag3t6hqrtnss9nwymcxy3lr');
      expect(pld.receiver.string()).toBe('pc1r0g22ufzn8qtw0742dmfglnw73e260hep0k3yra');
      expect(pld.amount.toString()).toBe('200000000');

      // Signature and public key should be present
      expect(tx.signature).not.toBeNull();
      expect(tx.publicKey).not.toBeNull();

      // Signature is 64 bytes (ED25519_ACCOUNT)
      const sig = tx.signature as Uint8Array;
      expect(sig.length).toBe(64);
      // Public key is 32 bytes (ED25519_ACCOUNT)
      const pub = tx.publicKey as Uint8Array;
      expect(pub.length).toBe(32);

      // Transaction ID
      expect(bytesToHex(tx.id())).toBe(expectedTxId);

      // Sign bytes
      expect(bytesToHex(tx.signBytes())).toBe(expectedSignBytes);
    });
  });

  describe('decode bond transaction', () => {
    it('should decode a signed bond transaction', () => {
      // https://pactusscan.com/transaction/f83f583a5c40adf93a90ea536a7e4b467d30ca4f308d5da52624d80c42adec80
      const signedDataHex =
        '00015ca3230080ade2040b77616c6c65742d636f726502' +
        '037098338e0b6808119dfd4457ab806b9c2059b89b' +
        '01d2fa2a7d560502199995ea260954f064d90278be' +
        '00' +
        '8094ebdc03' +
        '9e6279fb64067c7d7316ac74630bbb8589df268aa4548f1c7d85c087a8748ff0' +
        '715b9149afbd94c5d8ee6b37c787ec63e963cbb38be513ebc436aa58f9a8f00d' +
        '95794161374b22c696dabb98e93f6ca9300b22f3b904921fbf560bb72145f4fa';
      const expectedTxId = 'f83f583a5c40adf93a90ea536a7e4b467d30ca4f308d5da52624d80c42adec80';
      const expectedSignBytes =
        '015ca3230080ade2040b77616c6c65742d636f726502' +
        '037098338e0b6808119dfd4457ab806b9c2059b89b' +
        '01d2fa2a7d560502199995ea260954f064d90278be' +
        '00' +
        '8094ebdc03';

      const raw = hexToBytes(signedDataHex);
      const tx = Transaction.decode(new Reader(raw));

      expect(tx.version).toBe(1);
      expect(tx.lockTime.value).toBe(2335580);
      expect(tx.fee.toString()).toBe('10000000');
      expect(tx.memo).toBe('wallet-core');
      expect(tx.payload.getType()).toBe(PayloadType.BOND);

      const pld = tx.payload as BondPayload;
      expect(pld.sender.string()).toBe('pc1rwzvr8rstdqypr80ag3t6hqrtnss9nwymcxy3lr');
      expect(pld.receiver.string()).toBe('pc1p6taz5l2kq5ppnxv4agnqj48svnvsy797xpe6wd');
      expect(pld.stake.toString()).toBe('1000000000');
      expect(pld.publicKey).toBeNull();

      // Signature and public key should be present
      expect(tx.signature).not.toBeNull();
      expect(tx.publicKey).not.toBeNull();

      // Signature is 64 bytes (ED25519_ACCOUNT)
      const sig = tx.signature as Uint8Array;
      expect(sig.length).toBe(64);
      // Public key is 32 bytes (ED25519_ACCOUNT)
      const pub = tx.publicKey as Uint8Array;
      expect(pub.length).toBe(32);

      // Transaction ID
      expect(bytesToHex(tx.id())).toBe(expectedTxId);

      // Sign bytes
      expect(bytesToHex(tx.signBytes())).toBe(expectedSignBytes);
    });
  });

  describe('create transfer transaction', () => {
    it('should create an unsigned transfer transaction', () => {
      const lockTime = new Height(0x123456);
      const sender = Address.fromString('pc1z5x2a0lkt5nrrdqe0rkcv6r4pfkmdhrr3mawvua');
      const receiver = Address.fromString('pc1zt6qcdymkk48c5ds0fzfsaf6puwu8w8djn3ffpn');
      const amount = Amount.fromPac(1.0);
      const fee = Amount.fromPac(0.001);
      const memo = 'test';

      const tx = Transaction.createTransferTx(lockTime, sender, receiver, amount, fee, memo);

      const signBytes = tx.signBytes();
      const expectedSignBytes =
        '01' + // Version
        '56341200' + // LockTime
        'c0843d' + // Fee
        '0474657374' + // Memo
        '01' + // PayloadType
        '02a195d7fecba4c636832f1db0cd0ea14db6db8c71' + // Sender
        '025e81869376b54f8a360f48930ea741e3b8771db2' + // Receiver
        '8094ebdc03'; // Amount

      expect(bytesToHex(signBytes)).toBe(expectedSignBytes);
    });
  });

  describe('sign', () => {
    it('should throw error when sign is called', () => {
      const lockTime = new Height(0);
      const sender = Address.fromString('pc1z5x2a0lkt5nrrdqe0rkcv6r4pfkmdhrr3mawvua');
      const receiver = Address.fromString('pc1zt6qcdymkk48c5ds0fzfsaf6puwu8w8djn3ffpn');
      const amount = Amount.zero();
      const fee = Amount.zero();

      const tx = Transaction.createTransferTx(lockTime, sender, receiver, amount, fee);

      expect(() => tx.sign()).toThrow('signing is not supported in the TypeScript SDK');
    });
  });
});

/** Convert a hex string to Uint8Array. */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/** Convert a Uint8Array to lowercase hex string. */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
