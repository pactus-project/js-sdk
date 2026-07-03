import { PrivateKey as BLSPrivateKey } from './index';
import { PublicKey as BLSPublicKey } from './index';
import { Signature as BLSSignature } from './index';

import { Address } from '../address';

describe('BLS Crypto', () => {
  test('encoding', () => {
    const prvData = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
    const pubData =
      'a7290fc800d2d14f2dc5e5cb416bebf3267dfed1c6c3a79c6edc4ebd1e657d956daa06a2fcaafd42c94b65b32d4d43ea1368f861006829c475b7d54763a502dfd717e9d51c5cc7deae2981e56090a821c9c5bcafc129b8599203ab99031f4ce7';
    const valAddrData = '01c40b914373d4fc9c1e4611ad0acd5f23abf58a0d';
    const accAddrData = '02c40b914373d4fc9c1e4611ad0acd5f23abf58a0d';

    const prvStr = 'SECRET1PQQQSYQCYQ5RQWZQFPG9SCRGWPUGPZYSNZS23V9CCRYDPK8QARC0SEZYD4L';
    const pubStr =
      'public1p5u5sljqq6tg57tw9uh95z6lt7vn8mlk3cmp608rwm38t68n90k2km2sx5t724l2ze99ktvedf4p75ymglpssq6pfc36m0428vwjs9h7hzl5a28zucl02u2vpu4sfp2ppe8zmet7p9xu9nysr4wvsx86vuujrva2z';
    const valAddrStr = 'pc1pcs9ezsmn6n7fc8jxzxks4n2lyw4ltzsdc9v8qn';
    const accAddrStr = 'pc1zcs9ezsmn6n7fc8jxzxks4n2lyw4ltzsd9wu6hw';

    const prv = BLSPrivateKey.fromString(prvStr);
    const pub = BLSPublicKey.fromString(pubStr);
    const valAddr = Address.fromString(valAddrStr);
    const accAddr = Address.fromString(accAddrStr);

    expect(bytesToHex(prv.rawBytes())).toBe(prvData);
    expect(bytesToHex(pub.rawBytes())).toBe(pubData);
    expect(bytesToHex(valAddr.rawBytes())).toBe(valAddrData);
    expect(bytesToHex(accAddr.rawBytes())).toBe(accAddrData);

    const msg = new TextEncoder().encode('pactus');
    const sig = BLSSignature.fromString(
      '8bdda74336efdf43b428a3811d3d6867a19e20889c91261b02a6b950b130f5bb22621394667c27660bfed2a8719d9c52'
    );

    expect(pub.verify(msg, sig)).toBe(true);
    expect(bytesToHex(sig.rawBytes())).toBe(bytesToHex(prv.sign(msg).rawBytes()));
    expect(bytesToHex(pub.rawBytes())).toBe(bytesToHex(prv.publicKey().rawBytes()));
    expect(bytesToHex(valAddr.rawBytes())).toBe(bytesToHex(pub.validatorAddress().rawBytes()));
    expect(bytesToHex(accAddr.rawBytes())).toBe(bytesToHex(pub.accountAddress().rawBytes()));
  });

  test('sign and verify', () => {
    const prv1 = BLSPrivateKey.random();
    const prv2 = BLSPrivateKey.random();
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
    const prv = BLSPrivateKey.random();
    const pub = prv.publicKey();

    const msg = new TextEncoder().encode('pactus');
    const sig1 = prv.sign(msg);
    const sig2 = prv.sign(msg);

    expect(pub.verify(msg, sig1)).toBe(true);
    expect(pub.verify(msg, sig2)).toBe(true);
    expect(bytesToHex(sig1.rawBytes())).toBe(bytesToHex(sig2.rawBytes()));
  });

  test('key gen', () => {
    const tests = [
      { ikm: '', sk: 'Err' },
      {
        ikm: '00000000000000000000000000000000000000000000000000000000000000',
        sk: 'Err',
      },
      {
        ikm: '0000000000000000000000000000000000000000000000000000000000000000',
        sk: '4d129a19df86a0f5345bad4cc6f249ec2a819ccc3386895beb4f7d98b3db6235',
      },
      {
        ikm: '2b1eb88002e83a622792d0b96d4f0695e328f49fdd32480ec0cf39c2c76463af',
        sk: '0000f678e80740072a4a7fe8c7344db88a00ccc7db36aa51fa51f9c68e561584',
      },
      {
        ikm:
          'c55257c360c07c72029aebc1b53c05ed0362ada38ead3e3e9efa3708e5349553' +
          '1f09a6987599d18264c1e1c92f2cf141630c7a3c4ab7c81b2f001698e7463b04',
        sk: '0d7359d57963ab8fbbde1852dcf553fedbc31f464d80ee7d40ae683122b45070',
      },
      {
        ikm: '3141592653589793238462643383279502884197169399375105820974944592',
        sk: '41c9e07822b092a93fd6797396338c3ada4170cc81829fdfce6b5d34bd5e7ec7',
      },
      {
        ikm: '0099FF991111002299DD7744EE3355BBDD8844115566CC55663355668888CC00',
        sk: '3cfa341ab3910a7d00d933d8f7c4fe87c91798a0397421d6b19fd5b815132e80',
      },
      {
        ikm: 'd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
        sk: '2a0e28ffa5fbbe2f8e7aad4ed94f745d6bf755c51182e119bb1694fe61d3afca',
      },
    ];

    for (const testCase of tests) {
      const ikm = hexToBytes(testCase.ikm);
      try {
        const sk = BLSPrivateKey.keyGen(ikm);
        if (testCase.sk === 'Err') {
          throw new Error('Expected error but got key');
        }
        expect(bytesToHex(sk.rawBytes())).toBe(testCase.sk);
      } catch (e) {
        if (testCase.sk !== 'Err') {
          throw e;
        }
      }
    }
  });

  test('aggregate sig', () => {
    const sig1 = BLSSignature.fromString(
      '923d67a8624cbb7972b29328e15ec76cc846076ccf00a9e94d991c677846f334ae4ba4551396fbcd6d1cab7593baf3b7'
    );
    const sig2 = BLSSignature.fromString(
      'ab025936daaed80ca2f85a418c8a47c3d9f4137d7b7651ca52646260d2018e55628bba118d4993a3aa75de268d55e72b'
    );

    const agg = BLSSignature.aggregate([sig1, sig2]);
    expect(agg.string()).toBe(
      'ad747172697127cb08dda29a386e106eb24ab0edfbc044014c3bd7a5f583cc38b3a223ff2c1df9c0b4df110630e6946b'
    );
  });

  test('aggregate pub', () => {
    const pub1 = BLSPublicKey.fromString(
      'public1p4u8hfytl2pj6l9rj0t54gxcdmna4hq52ncqkkqjf3arha5mlk3x4mzpyjkhmdl20jae7f65aamjrvqcvf4sudcapz52ctcwc8r9wz3z2gwxs38880cgvfy49ta5ssyjut05myd4zgmjqstggmetyuyg7v5jhx47a'
    );
    const pub2 = BLSPublicKey.fromString(
      'public1pkms34vh00p0jwpdrv6hpqzsx3u26v547948h38wzpp0vc7j408sdy5cql5w5s4rpz60jnzm8rqw4crcw00lgrjeqydpagwstfgdfd79p9yr6rlrr2edtjaqp0shreqxmx0sk4gwlz336hyvnzh7lquxgwcw5nynk'
    );

    const agg = BLSPublicKey.aggregate([pub1, pub2]);
    expect(agg.string()).toBe(
      'public1pk5pfgdfe9l6q8mc03wfksx2l4r0h3hrx309sjcyuaredzh5krsfh8a86fuk0kcv2nslcduwz3w0zyqlvv2d42ne04c87hha5dw7dc9r2au5l7vhrruud7wf9u5k4fzg5rma6n940uqgfpjph8d9yg20dzswk7wxj'
    );
  });
});

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  if (!hex) {
    return new Uint8Array(0);
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
