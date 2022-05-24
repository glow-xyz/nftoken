import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createNft, updateNft } from "./utils/create-nft";
import { strToArr } from "./utils/test-utils";

describe("update NFT", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;
  const signer = anchor.AnchorProvider.local().wallet.publicKey;

  test("properly updates metadata", async () => {
    const { nft_pubkey } = await createNft({ program });
    await updateNft({
      nft_pubkey,
      creator: signer,
      metadataUrl: `newww! ${Math.random()}`,
      creatorCanUpdate: true,
      program,
    });
  });

  test("doesn't allow update if !creator_can_update", async () => {
    const { nft_pubkey } = await createNft({ program });

    await updateNft({
      nft_pubkey,
      creator: signer,
      metadataUrl: `newww! ${Math.random()}`,
      creatorCanUpdate: false,
      program,
    });

    await expect(async () => {
      await updateNft({
        nft_pubkey,
        creator: signer,
        metadataUrl: `newww! ${Math.random()}`,
        creatorCanUpdate: false,
        program,
      });
    }).rejects.toThrow();
  });
});
