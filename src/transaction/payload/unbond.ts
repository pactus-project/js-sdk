import { Address } from '../../crypto/address';
import type { Writer as w, Reader } from '../../encoding';

import { PayloadType } from './_payload';

export class UnbondPayload {
  constructor(public readonly validator: Address) {}

  encode(w: w): void {
    this.validator.encode(w);
  }

  getType(): PayloadType {
    return PayloadType.UNBOND;
  }

  signer(): Address {
    return this.validator;
  }

  static decode(r: Reader): UnbondPayload {
    const validator = Address.decode(r);

    return new UnbondPayload(validator);
  }
}
