---
title: Creating an NFT
---

# {% $markdoc.frontmatter.title %}

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
        { address: wallet },
        // The address of the NFT
        { address: nft_keypair.address, signer: true, writable: true },
        // This is the system program
        { address: GPublicKey.nullString, },
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

All of the code for this site is Open Source. You can see the [code for this page on GitHub](https://github.com/glow-xyz/nftoken/blob/master/docs/components/CreateNftSection.tsx).
