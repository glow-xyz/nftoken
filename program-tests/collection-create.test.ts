import * as anchor from "@project-serum/anchor";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { createCollection } from "./utils/create-collection";
import { DEFAULT_KEYPAIR, program, strToArr } from "./utils/test-utils";

describe("ix_collection_create", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  test("creates a collection", async () => {
    await createCollection({});
  });

  test("mints an NFT into a new collection in one transaction", async () => {
    const metadataUrl = strToArr("hi metadata", 96);
    const collection_keypair = Keypair.generate();
    const nft_keypair = Keypair.generate();
    const creator = DEFAULT_KEYPAIR.publicKey;

    const tx = new Transaction();
    tx.add(
      await program.methods
        .collectionCreate({ metadataUrl })
        .accounts({
          collection: collection_keypair.publicKey,
          creator,
          systemProgram: SystemProgram.programId,
        })
        .instruction()
    );
    tx.add(
      await program.methods
        .nftCreate({ metadataUrl, collectionIncluded: true })
        .accounts({
          nft: nft_keypair.publicKey,
          creator,
          holder: creator,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts([
          {
            pubkey: collection_keypair.publicKey, // collection ID
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: creator, // collection authority
            isSigner: false,
            isWritable: false,
          },
        ])
        .instruction()
    );

    try {
      await program.provider.send?.(tx, [collection_keypair]);
    } catch (e: any) {
      console.error("Logs", e.logs);
      expect(false).toBe(true);
    }
  });
});
