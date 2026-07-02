import { Address } from '../../crypto/address';
import { Amount } from '../../types/amount';
import { appendVarInt, appendFixedBytes, readVarInt, readFixedBytes } from '../../encoding';

import { PayloadType } from './_payload';

export class BondPayload {
  constructor(
    public readonly sender: Address,
    public readonly receiver: Address,
    public readonly publicKey: Uint8Array | null,
    public readonly stake: Amount,
  ) {}

  encode(buf: Uint8Array): Uint8Array {
    buf = this.sender.encode(buf);
    buf = this.receiver.encode(buf);
    if (this.publicKey !== null) {
      buf = appendVarInt(buf, 96);
      buf = appendFixedBytes(buf, this.publicKey);
    } else {
      buf = appendVarInt(buf, 0);
    }
    return this.stake.encode(buf);
  }

  getType(): PayloadType {
    return PayloadType.BOND;
  }

  signer(): Address {
    return this.sender;
  }

  static decode(buf: Uint8Array): [BondPayload, Uint8Array] {
    const [sender, remaining1] = Address.decode(buf);
    const [receiver, remaining2] = Address.decode(remaining1);
    const [pubKeySize, remaining3] = readVarInt(remaining2);
    let publicKey: Uint8Array | null = null;
    let remaining4 = remaining3;
    if (pubKeySize === 96n) {
      const [pk, rest] = readFixedBytes(remaining3, 96);
      publicKey = pk;
      remaining4 = rest;
    } else if (pubKeySize !== 0n) {
      throw new Error(`invalid public key size: ${pubKeySize}`);
    }
    const [stake, remaining5] = Amount.decode(remaining4);
    return [new BondPayload(sender, receiver, publicKey, stake), remaining5];
  }
}
