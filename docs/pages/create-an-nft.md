---
title: Create an NFT
---

# {% $markdoc.frontmatter.title %}

You can create an NFT in just a couple seconds.

You don't have to mess around with code or the terminal. This makes it really easy for non-developers to get started.

## 1 - Download Glow

If you don't have the Glow Solana wallet, you'll need to [download Glow](https://glow.app/download). Once you have that downloaded, you can

## 2 - Get SOL

You'll also need to have a small amount of SOL if you want to create an NFT on mainnet.

You can buy SOL from Coinbase, Kraken, or with the "Buy" button inside of Glow.

Now you're ready to create your first NFT:

## 3 - Create an NFT

{% create-nft-section /%}

Once you've created your NFT, you'll be able to see it in the Glow wallet under the NFTs section. Unfortunately, it won't show up in other Solana wallets yet since they haven't implemented the NFToken spec.

## Bonus - The Code

If you want to create an NFT via code, you can see the [code for this page on GitHub](https://github.com/glow-xyz/nftoken/blob/master/docs/components/CreateNftSection.tsx).

Here's what the function to create an NFT looks like:

```ts
import { Network } from "@glow-app/glow-client";
import {
  GKeypair,
  GPublicKey,
  GTransaction,
  SolanaClient,
} from "@glow-app/solana-client";

// This opens the Glow Chrome Extension and give us the current wallet
const { address: wallet } = await window.glow!.connect();

// We create an account for the NFT by creating a Keypair and then signing
// the first transaction with that Keypair. That Keypair is not needed and cannot be 
// used after that first transaction.
const nft_keypair = GKeypair.generate();

// We upload the Metadata about the NFT to S3, but you can also upload it to your own
// decentralized storage service.
const { file_url: metadata_url } = await uploadJsonToS3({
  json: { name, image },
});

// Every transaction on Solana must include a recent (~ 2 min) blockhash so that the cluster
// knows that the transaction should be processed.
const recentBlockhash = await SolanaClient.getRecentBlockhash({
  rpcUrl: "https://api.mainnet-beta.solana.com",
});

// Now we create the transaction locally and then encode it in Base64. Once it's in Base64, we can
// submit it to the Solana cluster to be processed.
const transaction = GTransaction.create({
  feePayer: wallet,
  recentBlockhash,
  instructions: [
    {
      accounts: [
        // NFT Creator / Authority
        { address: wallet, signer: true, writable: true },
        // The initial holder
        { address: wallet, writable: false, signer: false },
        // The address of the NFT
        { address: nft_keypair.address, signer: true, writable: true },
        // This is the system program
        { address: GPublicKey.default.toString(), writable: false, signer: false },
      ],
      program: NFTOKEN_ADDRESS,
      data_base64: NFTOKEN_NFT_CREATE_IX.toBuffer({
        ix: null,
        metadata_url,
        // If you are the authority of an NFT collection, you can add NFTs to the collection.
        collection_included: false,
      }).toString("base64"),
    },
  ],
});

const signedTx = GTransaction.sign({
  secretKey: nft_keypair.secretKey,
  gtransaction: transaction,
});

await window.glow!.signAndSendTransaction({
  transactionBase64: GTransaction.toBuffer({
    gtransaction: signedTx,
  }).toString("base64"),
  network: Network.Mainnet,
});
```
