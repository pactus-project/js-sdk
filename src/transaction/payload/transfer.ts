import { Address } from '../../crypto/address';
import { Amount } from '../../types/amount';
import type { Writer as w, Reader } from '../../encoding';

import { PayloadType } from './_payload';

export class TransferPayload {
  constructor(
    public readonly sender: Address,
    public readonly receiver: Address,
    public readonly amount: Amount
  ) {}

  encode(w: w): void {
    this.sender.encode(w);
    this.receiver.encode(w);
    this.amount.encode(w);
  }

  getType(): PayloadType {
    return PayloadType.TRANSFER;
  }

  signer(): Address {
    return this.sender;
  }

  static decode(r: Reader): TransferPayload {
    const sender = Address.decode(r);
    const receiver = Address.decode(r);
    const amount = Amount.decode(r);

    return new TransferPayload(sender, receiver, amount);
  }
}
