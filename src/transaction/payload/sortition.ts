import { Address } from '../../crypto/address';
import { appendFixedBytes, readFixedBytes } from '../../encoding';

import { PayloadType } from './_payload';

export class SortitionPayload {
  constructor(
    public readonly address: Address,
    public readonly proof: Uint8Array,
  ) {}

  encode(buf: Uint8Array): Uint8Array {
    buf = this.address.encode(buf);

    return appendFixedBytes(buf, this.proof);
  }

  getType(): PayloadType {
    return PayloadType.SORTITION;
  }

  signer(): Address {
    return this.address;
  }

  static decode(buf: Uint8Array): [SortitionPayload, Uint8Array] {
    const [address, remaining1] = Address.decode(buf);
    const [proof, remaining2] = readFixedBytes(remaining1, 48);

    return [new SortitionPayload(address, proof), remaining2];
  }
}
