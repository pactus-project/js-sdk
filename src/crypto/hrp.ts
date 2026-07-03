/** Human-Readable Part prefixes for mainnet and testnet. */
export class HRP {
  static ADDRESS_HRP = 'pc';
  static PUBLIC_KEY_HRP = 'public';
  static PRIVATE_KEY_HRP = 'secret';

  static useMainnet(): void {
    HRP.ADDRESS_HRP = 'pc';
    HRP.PUBLIC_KEY_HRP = 'public';
    HRP.PRIVATE_KEY_HRP = 'secret';
  }

  static useTestnet(): void {
    HRP.ADDRESS_HRP = 'tpc';
    HRP.PUBLIC_KEY_HRP = 'tpublic';
    HRP.PRIVATE_KEY_HRP = 'tsecret';
  }
}
