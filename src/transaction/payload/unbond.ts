import { Address } from '../../crypto/address';

import { PayloadType } from './_payload';

export class UnbondPayload {
  constructor(public readonly validator: Address) {}

  encode(buf: Uint8Array): Uint8Array {
    return this.validator.encode(buf);
  }

  getType(): PayloadType {
    return PayloadType.UNBOND;
  }

  signer(): Address {
    return this.validator;
  }

  static decode(buf: Uint8Array): [UnbondPayload, Uint8Array] {
    const [validator, remaining] = Address.decode(buf);

    return [new UnbondPayload(validator), remaining];
  }
}
