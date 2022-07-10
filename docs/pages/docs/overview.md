---
title: Welcome to NFToken
---

# {% $markdoc.frontmatter.title %}

NFToken is a simple, cheap NFT standard for Solana. 

### NFToken is 4x Cheaper Than Metaplex

Creating an NFT with NFToken costs 2M Lamports or $0.08. Metaplex costs 10M Lamports or $0.32.

### NFToken is Simple and Easy to Understand

A Metaplex NFT with a Collection requires mint, token, metadata, and edition accounts for the NFT and another set for the collection.

An NFToken NFT with a Collection requires two accounts: one for the NFT and one for the collection.

### NFToken Doesn't Require the Terminal

These docs are interactive. That means you can get started without even opening the terminal. You can even create a primary drop (equivalent of Candy Machine) without installing anything.

### Try Creating an NFT

You can try it out right here. Just pick an image to create an NFT.

{% create-nft-section /%}

Once you've created your NFT, you'll be able to see it your Glow wallet. 

## Bonus - The Code

If you want to create an NFT via code, you can see the [code for this page on GitHub](https://github.com/glow-xyz/nftoken/blob/master/docs/components/CreateNftSection.tsx).

Here's what the function to create an NFT looks like:

```ts
import { Network } from "@glow-xyz/glow-client";
import {
  GKeypair,
  GPublicKey,
  GTransaction,
  SolanaClient,
} from "@glow-xyz/solana-client";

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
        {
          address: GPublicKey.default.toString(),
          writable: false,
          signer: false,
        },
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
