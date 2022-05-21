import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createNft } from "./utils/create-nft";
import { strToArr } from "./utils/test-utils";

describe("update NFT", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;
  const signer = anchor.AnchorProvider.local().wallet.publicKey;

  test("properly updates metadata", async () => {
    const { nft_pubkey } = await createNft({ program });

    const metadataUrl = strToArr("new-meta", 96);
    const creatorCanUpdate = true;

    const signature = await program.methods
      .nftUpdate({ metadataUrl, creatorCanUpdate })
      .accounts({
        nft: nft_pubkey,
        creator: signer,
      })
      .signers([])
      .rpc();
    console.log("NFT Update", signature);

    const updated = await program.account.nftAccount.fetch(nft_pubkey);

    expect(updated.metadataUrl).toEqual(metadataUrl);
    expect(updated.creatorCanUpdate).toEqual(creatorCanUpdate);
  });

  test("doesn't allow update if !creator_can_update", async () => {
    const { nft_pubkey } = await createNft({ program });

    const metadataUrl = strToArr("new-meta", 96);
    const creatorCanUpdate = false;

    const signature = await program.methods
      .nftUpdate({ metadataUrl, creatorCanUpdate })
      .accounts({
        nft: nft_pubkey,
        creator: signer,
      })
      .signers([])
      .rpc();
    console.log("NFT Update", signature);

    const updated = await program.account.nftAccount.fetch(nft_pubkey);

    expect(updated.metadataUrl).toEqual(metadataUrl);
    expect(updated.creatorCanUpdate).toEqual(creatorCanUpdate);

    // This should error since the collection can't be updated
    const promise = program.methods
      .nftUpdate({ metadataUrl, creatorCanUpdate })
      .accounts({
        nft: nft_pubkey,
        creator: signer,
      })
      .signers([])
      .rpc();

    await expect(promise).rejects.toThrow();
  });
});
