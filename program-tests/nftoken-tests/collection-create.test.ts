import * as anchor from "@project-serum/anchor";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { createCollection } from "../utils/create-collection";
import { DEFAULT_KEYPAIR, nftokenProgram } from "../utils/test-utils";

describe("ix_collection_create", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  test("creates a collection", async () => {
    await createCollection({});
  });

  test("mints an NFT into a new collection in one transaction", async () => {
    const metadataUrl = "hi metadata";
    const collection_keypair = Keypair.generate();
    const nft_keypair = Keypair.generate();
    const authority = DEFAULT_KEYPAIR.publicKey;

    const tx = new Transaction();
    tx.add(
      await nftokenProgram.methods
        .collectionCreateV1({ metadataUrl })
        .accounts({
          collection: collection_keypair.publicKey,
          authority,
          systemProgram: SystemProgram.programId,
        })
        .instruction()
    );
    tx.add(
      await nftokenProgram.methods
        .nftCreateV1({ metadataUrl, collectionIncluded: true })
        .accounts({
          nft: nft_keypair.publicKey,
          authority,
          holder: authority,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts([
          {
            pubkey: collection_keypair.publicKey, // collection ID
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: authority, // collection authority
            isSigner: false,
            isWritable: false,
          },
        ])
        .instruction()
    );

    try {
      await nftokenProgram.provider.send?.(tx, [collection_keypair]);
    } catch (e: any) {
      console.error("Logs", e.logs);
      expect(false).toBe(true);
    }
  });
});
