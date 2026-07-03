import { sha256 } from '@noble/hashes/sha2';

export function os2ip(bytes: Uint8Array): bigint {
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return BigInt(`0x${hex || '0'}`);
}

export function hmacSha256(key: Uint8Array, msg: Uint8Array): Uint8Array {
  const blockSize = 64;
  let k = new Uint8Array(key);

  if (k.length > blockSize) {
    k = new Uint8Array(sha256(k));
  }

  if (k.length < blockSize) {
    k = new Uint8Array([...k, ...new Uint8Array(blockSize - k.length)]);
  }

  const iPad = new Uint8Array(blockSize);
  const oPad = new Uint8Array(blockSize);

  for (let i = 0; i < blockSize; i++) {
    oPad[i] = k[i] ^ 0x5c;
    iPad[i] = k[i] ^ 0x36;
  }

  return new Uint8Array(
    sha256(new Uint8Array([...oPad, ...new Uint8Array(sha256(new Uint8Array([...iPad, ...msg])))]))
  );
}

export function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Uint8Array {
  return hmacSha256(salt, ikm);
}

export function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Uint8Array {
  const result = new Uint8Array(length);
  let t = new Uint8Array(0);
  let offset = 0;
  let i = 1;

  while (offset < length) {
    const input = new Uint8Array([...t, ...info, i]);

    t = new Uint8Array(hmacSha256(prk, input));
    const toCopy = Math.min(t.length, length - offset);

    result.set(t.subarray(0, toCopy), offset);
    offset += toCopy;
    i++;
  }

  return result;
}

export function i2osp(value: number, length: number): Uint8Array {
  const result = new Uint8Array(length);

  if (length >= 2) {
    result[length - 2] = (value >> 8) & 0xff;
  }

  result[length - 1] = value & 0xff;

  return result;
}
