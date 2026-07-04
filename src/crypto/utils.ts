import { bech32m } from 'bech32';

export function decodeWithType(
  text: string,
  limit = 90
): { hrp: string; type: number; data: Uint8Array } {
  const decoded = bech32m.decode(text, limit);
  const type = decoded.words[0];
  const data = new Uint8Array(bech32m.fromWords(decoded.words.slice(1)));

  return { hrp: decoded.prefix, type, data };
}

export function encodeWithType(hrp: string, type: number, data: Uint8Array, limit = 90): string {
  const words = bech32m.toWords(data);

  words.unshift(type);

  return bech32m.encode(hrp, words, limit);
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  if (!hex) {
    return new Uint8Array(0);
  }

  const bytes = new Uint8Array(hex.length / 2);

  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }

  return bytes;
}

/**
 * Decode a bech32m-encoded public key string into raw bytes.
 *
 * Validates the HRP against the given value (default "public" for mainnet).
 */
export function decodeBech32PublicKey(text: string, expectedHrp: string = 'public'): Uint8Array {
  const { hrp, data } = decodeWithType(text);

  if (hrp !== expectedHrp) {
    throw new Error(`Invalid public key hrp: ${hrp}, expected: ${expectedHrp}`);
  }

  return data;
}
