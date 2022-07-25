import * as anchor from "@project-serum/anchor";
import { createCollection } from "../utils/create-collection";
import { DEFAULT_KEYPAIR, nftokenProgram } from "../utils/test-utils";

describe("update collection", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const signer = DEFAULT_KEYPAIR.publicKey;

  test("properly updates metadata", async () => {
    const { collection_pubkey } = await createCollection({});

    const metadata_url = "new-meta";
    const authority_can_update = true;

    const signature = await nftokenProgram.methods
      .collectionUpdateV1({
        metadataUrl: metadata_url,
        authorityCanUpdate: authority_can_update,
      })
      .accounts({
        collection: collection_pubkey,
        authority: signer,
      })
      .signers([])
      .rpc();
    console.log("Collection Update", signature);

    const updated = await nftokenProgram.account.collectionAccount.fetch(
      collection_pubkey
    );

    expect(updated.metadataUrl).toEqual(metadata_url);
    expect(updated.authorityCanUpdate).toEqual(authority_can_update);
  });

  test("doesn't allow update if !authority_can_update", async () => {
    const { collection_pubkey } = await createCollection({});

    const metadata_url = "new-meta";
    const authority_can_update = false;

    const signature = await nftokenProgram.methods
      .collectionUpdateV1({
        metadataUrl: metadata_url,
        authorityCanUpdate: authority_can_update,
      })
      .accounts({
        collection: collection_pubkey,
        authority: signer,
      })
      .signers([])
      .rpc();
    console.log("Collection Update", signature);

    const updated = await nftokenProgram.account.collectionAccount.fetch(
      collection_pubkey
    );

    expect(updated.metadataUrl).toEqual(metadata_url);
    expect(updated.authorityCanUpdate).toEqual(authority_can_update);

    // This should error since the collection can't be updated
    const promise = nftokenProgram.methods
      .collectionUpdateV1({
        metadataUrl: metadata_url,
        authorityCanUpdate: authority_can_update,
      })
      .accounts({
        collection: collection_pubkey,
        authority: signer,
      })
      .signers([])
      .rpc();

    await expect(promise).rejects.toThrow();
  });
});
