import { Address } from '../../crypto/address';
import { Amount } from '../../types/amount';
import type { Writer, Reader } from '../../encoding';

import { PayloadType } from './_payload';

export class BondPayload {
  constructor(
    public readonly sender: Address,
    public readonly receiver: Address,
    public readonly publicKey: Uint8Array | null,
    public readonly stake: Amount
  ) {}

  encode(w: Writer): void {
    this.sender.encode(w);
    this.receiver.encode(w);

    if (this.publicKey === null) {
      w.writeVarInt(0);
    } else {
      w.writeVarInt(96);
      w.writeFixedBytes(this.publicKey);
    }

    this.stake.encode(w);
  }

  getType(): PayloadType {
    return PayloadType.BOND;
  }

  signer(): Address {
    return this.sender;
  }

  static decode(r: Reader): BondPayload {
    const sender = Address.decode(r);
    const receiver = Address.decode(r);
    const pubKeySize = r.readVarInt();
    let publicKey: Uint8Array | null = null;

    if (pubKeySize === 96n) {
      publicKey = r.readFixedBytes(96);
    } else if (pubKeySize !== 0n) {
      throw new Error(`invalid public key size: ${pubKeySize}`);
    }

    const stake = Amount.decode(r);

    return new BondPayload(sender, receiver, publicKey, stake);
  }
}
