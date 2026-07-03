import { PrivateKey as Ed25519PrivateKey } from './index';
import { PublicKey as Ed25519PublicKey } from './index';
import { Signature as Ed25519Signature } from './index';
import { Address } from '../address';

describe('Ed25519 Crypto', () => {
  test('encoding', () => {
    const prvData = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
    const pubData = '03a107bff3ce10be1d70dd18e74bc09967e4d6309ba50d5f1ddc8664125531b8';
    const addrData = '0396a882c41ef85a07c75a6416a57fcce95aad4a3f';

    const prvStr = 'SECRET1RQQQSYQCYQ5RQWZQFPG9SCRGWPUGPZYSNZS23V9CCRYDPK8QARC0SW5D8X2';
    const pubStr = 'public1rqwss00lnecgtu8tsm5vwwj7qn9n7f43snwjs6hcamjrxgyj4xxuq5agu5g';
    const addrStr = 'pc1rj65g93q7lpdq0366vst22l7va9d26j3l2vr0em';

    const prv = Ed25519PrivateKey.fromString(prvStr);
    const pub = Ed25519PublicKey.fromString(pubStr);
    const addr = Address.fromString(addrStr);

    expect(bytesToHex(prv.rawBytes())).toBe(prvData);
    expect(bytesToHex(pub.rawBytes())).toBe(pubData);
    expect(bytesToHex(addr.rawBytes())).toBe(addrData);

    const msg = new TextEncoder().encode('pactus');
    const sig = Ed25519Signature.fromString(
      '1fc2c800499342d08242db9c3eb654027cb7b821e6af9ede56dfdb67e824f15bddb419d2db3fd5aaf3ef1a9ebb9a9deb749380f0d6a110cbe95319fe9f794305'
    );

    expect(pub.verify(msg, sig)).toBe(true);
    expect(bytesToHex(sig.rawBytes())).toBe(bytesToHex(prv.sign(msg).rawBytes()));
    expect(bytesToHex(pub.rawBytes())).toBe(bytesToHex(prv.publicKey().rawBytes()));
    expect(bytesToHex(addr.rawBytes())).toBe(bytesToHex(pub.accountAddress().rawBytes()));
  });

  test('sign and verify', () => {
    const prv1 = Ed25519PrivateKey.random();
    const prv2 = Ed25519PrivateKey.random();
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

  test('multiple signatures are deterministic', () => {
    const prv = Ed25519PrivateKey.random();
    const pub = prv.publicKey();

    const msg = new TextEncoder().encode('pactus');
    const sig1 = prv.sign(msg);
    const sig2 = prv.sign(msg);

    expect(pub.verify(msg, sig1)).toBe(true);
    expect(pub.verify(msg, sig2)).toBe(true);
    expect(bytesToHex(sig1.rawBytes())).toBe(bytesToHex(sig2.rawBytes()));
  });
});

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
