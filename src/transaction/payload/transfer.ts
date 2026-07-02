import { Address } from '../../crypto/address';
import { Amount } from '../../types/amount';
import type { Writer, Reader } from '../../encoding';

import { PayloadType } from './_payload';

export class TransferPayload {
  constructor(
    public readonly sender: Address,
    public readonly receiver: Address,
    public readonly amount: Amount
  ) {}

  encode(writer: Writer): void {
    this.sender.encode(writer);
    this.receiver.encode(writer);
    this.amount.encode(writer);
  }

  getType(): PayloadType {
    return PayloadType.TRANSFER;
  }

  signer(): Address {
    return this.sender;
  }

  static decode(reader: Reader): TransferPayload {
    const sender = Address.decode(reader);
    const receiver = Address.decode(reader);
    const amount = Amount.decode(reader);

    return new TransferPayload(sender, receiver, amount);
  }
}
