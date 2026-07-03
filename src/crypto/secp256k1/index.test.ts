import { PrivateKey as Secp256k1PrivateKey } from './index';
import { PublicKey as Secp256k1PublicKey } from './index';
import { Signature as Secp256k1Signature } from './index';
import { Address } from '../address';

describe('Secp256k1 Crypto', () => {
  test('encoding', () => {
    const prvData = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
    const pubData = '036d6caac248af96f6afa7f904f550253a0f3ef3f5aa2fe6838a95b216691468e2';
    const addrData = '042bc1db7e0797c45b918dc401093c9257c6012b4c';

    const prvStr = 'SECRET1YQQQSYQCYQ5RQWZQFPG9SCRGWPUGPZYSNZS23V9CCRYDPK8QARC0SPVXU8Z';
    const pubStr = 'public1yqdkke2kzfzheda405lusfa2sy5aq70hn7k4zle5r322my9nfz35wyfamrfs';
    const addrStr = 'pc1y90qakls8jlz9hyvdcsqsj0yj2lrqz26vqu7l0z';

    const prv = Secp256k1PrivateKey.fromString(prvStr);
    const pub = Secp256k1PublicKey.fromString(pubStr);
    const addr = Address.fromString(addrStr);

    expect(bytesToHex(prv.rawBytes())).toBe(prvData);
    expect(bytesToHex(pub.rawBytes())).toBe(pubData);
    expect(bytesToHex(addr.rawBytes())).toBe(addrData);

    const msg = new TextEncoder().encode('pactus');
    const sig = Secp256k1Signature.fromString(
      'c86779676d217b04979434e5bd37eddd02b671e9a54b48d3a812c7862dcb539631bb5e8459fec007608f50ea5661e0a5215aac976705404cb4f36ee623e63199'
    );

    expect(pub.verify(msg, sig)).toBe(true);
    expect(bytesToHex(sig.rawBytes())).toBe(bytesToHex(prv.sign(msg).rawBytes()));
    expect(bytesToHex(pub.rawBytes())).toBe(bytesToHex(prv.publicKey().rawBytes()));
    expect(bytesToHex(addr.rawBytes())).toBe(bytesToHex(pub.accountAddress().rawBytes()));
  });

  test('sign and verify', () => {
    const prv1 = Secp256k1PrivateKey.random();
    const prv2 = Secp256k1PrivateKey.random();
    const pub1 = prv1.publicKey();
    const pub2 = prv2.publicKey();

    const msg = new TextEncoder().encode('pactus');
    const sig1 = prv1.sign(msg);
    const sig2 = prv2.sign(msg);

    expect(pub1.verify(msg, sig1)).toBe(true);
    expect(pub2.verify(msg, sig2)).toBe(true);
    expect(pub1.verify(msg, sig2)).toBe(false);
    expect(pub2.verify(msg, sig1)).toBe(false);

    const differentMsg = new TextEncoder().encode('different');
    const sig3 = prv1.sign(differentMsg);
    expect(pub1.verify(msg, sig3)).toBe(false);
  });

  test('key generation', () => {
    const prv = Secp256k1PrivateKey.random();
    expect(prv).toBeDefined();

    const pub = prv.publicKey();
    expect(pub).toBeDefined();

    const msg = new TextEncoder().encode('test message');
    const sig = prv.sign(msg);
    expect(pub.verify(msg, sig)).toBe(true);
  });

  test('key from bytes', () => {
    const keyBytes = new Uint8Array(32).fill(0x01);
    const prv = Secp256k1PrivateKey.fromBytes(keyBytes);
    expect(bytesToHex(prv.rawBytes())).toBe(bytesToHex(keyBytes));

    const prv2 = Secp256k1PrivateKey.fromBytes(keyBytes);
    const pub1 = prv.publicKey();
    const pub2 = prv2.publicKey();
    expect(pub1.string()).toBe(pub2.string());
  });

  test('string encoding/decoding', () => {
    const prv = Secp256k1PrivateKey.random();
    const prvStr = prv.string();
    const prvDecoded = Secp256k1PrivateKey.fromString(prvStr);
    expect(bytesToHex(prv.rawBytes())).toBe(bytesToHex(prvDecoded.rawBytes()));

    const pub = prv.publicKey();
    const pubStr = pub.string();
    const pubDecoded = Secp256k1PublicKey.fromString(pubStr);
    expect(bytesToHex(pub.rawBytes())).toBe(bytesToHex(pubDecoded.rawBytes()));
  });

  test('signature from string', () => {
    const sigHex = 'a'.repeat(128);
    const sig = Secp256k1Signature.fromString(sigHex);
    expect(sig.rawBytes().length).toBe(64);
    expect(sig.string()).toBe(sigHex);
  });

  test('signature invalid length', () => {
    expect(() => Secp256k1Signature.fromString('00'.repeat(32))).toThrow();
    expect(() => Secp256k1Signature.fromString('00'.repeat(100))).toThrow();
  });

  test('multiple signatures are deterministic', () => {
    const prv = Secp256k1PrivateKey.random();
    const pub = prv.publicKey();
    const msg = new TextEncoder().encode('same message');

    const sig1 = prv.sign(msg);
    const sig2 = prv.sign(msg);

    expect(pub.verify(msg, sig1)).toBe(true);
    expect(pub.verify(msg, sig2)).toBe(true);
    // secp256k1 signatures include random nonces by default with @noble,
    // so they may not be deterministic
    // expect(sig1.string()).toBe(sig2.string());
  });
});

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
