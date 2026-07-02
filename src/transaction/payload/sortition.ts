import { Address } from '../../crypto/address';
import type { Writer, Reader } from '../../encoding';

import { PayloadType } from './_payload';

export class SortitionPayload {
  constructor(
    public readonly address: Address,
    public readonly proof: Uint8Array
  ) {}

  encode(writer: Writer): void {
    this.address.encode(writer);
    writer.writeFixedBytes(this.proof);
  }

  getType(): PayloadType {
    return PayloadType.SORTITION;
  }

  signer(): Address {
    return this.address;
  }

  static decode(reader: Reader): SortitionPayload {
    const address = Address.decode(reader);
    const proof = reader.readFixedBytes(48);

    return new SortitionPayload(address, proof);
  }
}
