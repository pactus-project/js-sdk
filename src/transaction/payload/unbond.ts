import { Address } from '../../crypto/address';
import type { Writer, Reader } from '../../encoding';

import { PayloadType } from './_payload';

export class UnbondPayload {
  constructor(public readonly validator: Address) {}

  encode(writer: Writer): void {
    this.validator.encode(writer);
  }

  getType(): PayloadType {
    return PayloadType.UNBOND;
  }

  signer(): Address {
    return this.validator;
  }

  static decode(reader: Reader): UnbondPayload {
    const validator = Address.decode(reader);

    return new UnbondPayload(validator);
  }
}
