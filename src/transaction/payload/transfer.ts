import { Address } from '../../crypto/address';
import { Amount } from '../../types/amount';

import { PayloadType } from './_payload';

export class TransferPayload {
  constructor(
    public readonly sender: Address,
    public readonly receiver: Address,
    public readonly amount: Amount
  ) {}

  encode(buf: Uint8Array): Uint8Array {
    buf = this.sender.encode(buf);
    buf = this.receiver.encode(buf);

    return this.amount.encode(buf);
  }

  getType(): PayloadType {
    return PayloadType.TRANSFER;
  }

  signer(): Address {
    return this.sender;
  }

  static decode(buf: Uint8Array): [TransferPayload, Uint8Array] {
    const [sender, remaining1] = Address.decode(buf);
    const [receiver, remaining2] = Address.decode(remaining1);
    const [amount, remaining3] = Amount.decode(remaining2);

    return [new TransferPayload(sender, receiver, amount), remaining3];
  }
}
