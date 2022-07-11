# `@glow-xyz/nftoken-js`

The `@glow-xyz/nftoken-js` gives you a client to interact with the NFToken program. This makes it easy to create and manage NFTs, collections and mintlists.

## Installing

```sh
# npm
npm install @glow-xyz/nftoken-js

# yarn
yarn add @glow-xyz/nftoken-js

# pnpm
pnpm install @glow-xyz/nftoken-js
```

## Creating an NFT

You can create an NFT in just a couple lines of code:

```ts
import { constructCreateNftTx } from "@glow-xyz/nftoken-js";

// This opens the Glow Browser Extension and give us the current wallet
const { address: wallet } = await window.glow!.connect();

// This is the location where you have uploaded Metadata about the NFT. This can be in Arweave, IPFS, S3,
// or another storage service.
const metadata_url = "";

const { transactionBase64 } = await constructCreateNftTx({
  metadata_url,
  network,
  creator: wallet,
});

await window.glow!.signAndSendTransaction({
  transactionBase64,
  network: network,
});
```
