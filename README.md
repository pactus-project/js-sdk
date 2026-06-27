# Pactus JS SDK

A powerful, type-safe TypeScript SDK for creating, managing, and interacting with
[Pactus](https://pactus.org) blockchain wallets. Designed with flexibility and security in mind,
it provides comprehensive wallet management capabilities for browser and Node.js environments.

> This package was extracted from the
> [`pactus-wallet`](https://github.com/pactus-project/pactus-wallet) monorepo so it can be developed,
> versioned, and published independently.

## Features

- 🔐 Secure wallet creation and encryption
- 🔑 Mnemonic (BIP39) phrase management
- 📦 Multiple network support (Mainnet / Testnet)
- 🔢 Address generation
- 💾 Pluggable storage (memory, browser, IndexedDB)
- 🛡️ Robust, typed error handling
- 📘 Full TypeScript type safety

## Installation

```bash
npm install @pactus/wallet-sdk
# or
yarn add @pactus/wallet-sdk
```

### Prerequisites

- Node.js 18+
- `@trustwallet/wallet-core` (installed automatically as a dependency)

## Quick Start

### Initialize the SDK

```typescript
import { initWalletSDK, NetworkValues, MnemonicValues } from '@pactus/wallet-sdk';
import { MemoryStorage } from '@pactus/wallet-sdk';

async function createWallet() {
  // Use any storage implementation that satisfies the IStorage interface
  const storage = new MemoryStorage();

  // Initialize the SDK (loads the wallet-core WASM under the hood)
  const walletManager = await initWalletSDK(storage);

  // Create a new wallet
  const wallet = await walletManager.createWallet(
    'my-secure-password',
    'My Wallet',
    MnemonicValues.NORMAL,
    NetworkValues.MAINNET
  );

  // Derive an address
  const address = wallet.createAddress('Personal Address');
  console.info('New address:', address);
}
```

### Restore a wallet

```typescript
async function restoreWallet() {
  const storage = new MemoryStorage();
  const walletManager = await initWalletSDK(storage);

  const wallet = await walletManager.restoreWallet(
    'your mnemonic phrase here',
    'your-secure-password'
  );

  console.info('Wallet restored:', wallet.getWalletInfo());
}
```

## API Reference

### `initWalletSDK(storage: IStorage): Promise<WalletManager>`

Initializes the wallet-core library and returns a `WalletManager` bound to the given storage.

### Wallet creation options

| Option     | Description                  | Default                  |
| ---------- | ---------------------------- | ------------------------ |
| `password` | Wallet encryption password   | —                        |
| `name`     | Wallet name                  | `'My Wallet'`            |
| `strength` | Mnemonic strength            | `MnemonicValues.NORMAL`  |
| `network`  | Network type                 | `NetworkValues.MAINNET`  |

**Network types**

- `NetworkValues.MAINNET` — primary Pactus network
- `NetworkValues.TESTNET` — development and testing network

**Mnemonic strength**

- `MnemonicValues.NORMAL` — 12-word phrase (128 bits of entropy)
- `MnemonicValues.HIGH` — 24-word phrase (256 bits of entropy)

### Error types

- `WalletCreationError` — problems creating a wallet
- `WalletRestoreError` — errors during wallet restoration
- `StorageError` — issues with wallet storage

```typescript
import { WalletRestoreError } from '@pactus/wallet-sdk';

try {
  // wallet operations
} catch (error) {
  if (error instanceof WalletRestoreError) {
    // handle restoration error
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build the package (emits to dist/)
npm run build

# Run the test suite
npm test

# Type-check without emitting
npm run type-check

# Lint
npm run lint
```

## Security Recommendations

1. Never share your mnemonic phrase.
2. Use strong, unique passwords.
3. Store mnemonics offline and securely.
4. Use hardware wallets for large amounts.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull
request.

## License

Licensed under the [MIT License](LICENSE).
