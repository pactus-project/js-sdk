import { Address } from '../../crypto/address';
import { Amount } from '../../types/amount';

import { PayloadType } from './_payload';

export class WithdrawPayload {
  constructor(
    public readonly fromAddr: Address,
    public readonly toAddr: Address,
    public readonly amount: Amount,
  ) {}

  encode(buf: Uint8Array): Uint8Array {
    buf = this.fromAddr.encode(buf);
    buf = this.toAddr.encode(buf);
    return this.amount.encode(buf);
  }

  getType(): PayloadType {
    return PayloadType.WITHDRAW;
  }

  signer(): Address {
    return this.fromAddr;
  }

  static decode(buf: Uint8Array): [WithdrawPayload, Uint8Array] {
    const [fromAddr, remaining1] = Address.decode(buf);
    const [toAddr, remaining2] = Address.decode(remaining1);
    const [amount, remaining3] = Amount.decode(remaining2);
    return [new WithdrawPayload(fromAddr, toAddr, amount), remaining3];
  }
}
