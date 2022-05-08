import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createCollection } from "./utils/create-collection";
import { strToArr } from "./utils/test-utils";

describe("update collection", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;
  const signer = anchor.AnchorProvider.local().wallet.publicKey;

  test("properly updates metadata", async () => {
    const { collection_pubkey } = await createCollection({ program });

    const metadata_url = strToArr("new-meta", 64);
    const creator_can_update = true;

    const signature = await program.methods
      .collectionUpdate({
        metadataUrl: metadata_url,
        creatorCanUpdate: creator_can_update,
      })
      .accounts({
        collection: collection_pubkey,
        creator: signer,
      })
      .signers([])
      .rpc();
    console.log("Collection Update", signature);

    const updated = await program.account.collectionAccount.fetch(
      collection_pubkey
    );

    expect(updated.metadataUrl).toEqual(metadata_url);
    expect(updated.creatorCanUpdate).toEqual(creator_can_update);
  });

  test("doesn't allow update if !creator_can_update", async () => {
    const { collection_pubkey } = await createCollection({ program });

    const metadata_url = strToArr("new-meta", 64);
    const creator_can_update = false;

    const signature = await program.methods
      .collectionUpdate({
        metadataUrl: metadata_url,
        creatorCanUpdate: creator_can_update,
      })
      .accounts({
        collection: collection_pubkey,
        creator: signer,
      })
      .signers([])
      .rpc();
    console.log("Collection Update", signature);

    const updated = await program.account.collectionAccount.fetch(
      collection_pubkey
    );

    expect(updated.metadataUrl).toEqual(metadata_url);
    expect(updated.creatorCanUpdate).toEqual(creator_can_update);

    // This should error since the collection can't be updated
    const promise = program.methods
      .collectionUpdate({
        metadataUrl: metadata_url,
        creatorCanUpdate: creator_can_update,
      })
      .accounts({
        collection: collection_pubkey,
        creator: signer,
      })
      .signers([])
      .rpc();

    await expect(promise).rejects.toThrow();
  });
});
