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

  encode(writer: Writer): void {
    this.sender.encode(writer);
    this.receiver.encode(writer);

    if (this.publicKey === null) {
      writer.writeVarInt(0);
    } else {
      writer.writeVarInt(96);
      writer.writeFixedBytes(this.publicKey);
    }

    this.stake.encode(writer);
  }

  getType(): PayloadType {
    return PayloadType.BOND;
  }

  signer(): Address {
    return this.sender;
  }

  static decode(reader: Reader): BondPayload {
    const sender = Address.decode(reader);
    const receiver = Address.decode(reader);
    const pubKeySize = reader.readVarInt();
    let publicKey: Uint8Array | null = null;

    if (pubKeySize === 96n) {
      publicKey = reader.readFixedBytes(96);
    } else if (pubKeySize !== 0n) {
      throw new Error(`invalid public key size: ${pubKeySize}`);
    }

    const stake = Amount.decode(reader);

    return new BondPayload(sender, receiver, publicKey, stake);
  }
}
