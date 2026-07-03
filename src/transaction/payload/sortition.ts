import { Address } from '../../crypto/address';
import type { Writer, Reader } from '../../encoding';

import { PayloadType } from './_payload';

export class SortitionPayload {
  constructor(
    public readonly address: Address,
    public readonly proof: Uint8Array
  ) {}

  encode(w: Writer): void {
    this.address.encode(w);
    w.writeFixedBytes(this.proof);
  }

  getType(): PayloadType {
    return PayloadType.SORTITION;
  }

  signer(): Address {
    return this.address;
  }

  static decode(r: Reader): SortitionPayload {
    const address = Address.decode(r);
    const proof = r.readFixedBytes(48);

    return new SortitionPayload(address, proof);
  }
}
