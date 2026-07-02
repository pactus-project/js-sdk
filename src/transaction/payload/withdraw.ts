import { Address } from '../../crypto/address';
import { Amount } from '../../types/amount';
import type { Writer, Reader } from '../../encoding';

import { PayloadType } from './_payload';

export class WithdrawPayload {
  constructor(
    public readonly fromAddr: Address,
    public readonly toAddr: Address,
    public readonly amount: Amount
  ) {}

  encode(writer: Writer): void {
    this.fromAddr.encode(writer);
    this.toAddr.encode(writer);
    this.amount.encode(writer);
  }

  getType(): PayloadType {
    return PayloadType.WITHDRAW;
  }

  signer(): Address {
    return this.fromAddr;
  }

  static decode(reader: Reader): WithdrawPayload {
    const fromAddr = Address.decode(reader);
    const toAddr = Address.decode(reader);
    const amount = Amount.decode(reader);

    return new WithdrawPayload(fromAddr, toAddr, amount);
  }
}
