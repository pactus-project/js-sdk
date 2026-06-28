# Pactus JS SDK

Type-safe TypeScript SDK for the [Pactus](https://pactus.org) blockchain.

## Installation

```bash
npm install @pactus/sdk
```

## Quick Start

```typescript
import { initWalletSDK, NetworkValues, MnemonicValues } from "@pactus/sdk";
import { MemoryStorage } from "@pactus/sdk";

const storage = new MemoryStorage();
const walletManager = await initWalletSDK(storage);

const wallet = await walletManager.createWallet(
  "my-password",
  "My Wallet",
  MnemonicValues.NORMAL,
  NetworkValues.MAINNET
);

const address = wallet.createAddress("Personal Address");
console.info("New address:", address);
```

## License

MIT
