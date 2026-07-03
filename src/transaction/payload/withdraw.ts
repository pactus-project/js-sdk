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

  encode(w: Writer): void {
    this.fromAddr.encode(w);
    this.toAddr.encode(w);
    this.amount.encode(w);
  }

  getType(): PayloadType {
    return PayloadType.WITHDRAW;
  }

  signer(): Address {
    return this.fromAddr;
  }

  static decode(r: Reader): WithdrawPayload {
    const fromAddr = Address.decode(r);
    const toAddr = Address.decode(r);
    const amount = Amount.decode(r);

    return new WithdrawPayload(fromAddr, toAddr, amount);
  }
}
