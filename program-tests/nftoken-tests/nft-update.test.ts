import * as anchor from "@project-serum/anchor";
import { createNft, updateNft } from "../utils/create-nft";
import { DEFAULT_KEYPAIR } from "../utils/test-utils";

describe("update NFT", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const signer = DEFAULT_KEYPAIR.publicKey;

  test("properly updates metadata", async () => {
    const { nft_pubkey } = await createNft({});
    await updateNft({
      nft_pubkey,
      authority: signer,
      metadataUrl: `newww! ${Math.random()}`,
      authorityCanUpdate: true,
    });
  });

  test("doesn't allow update if !authority_can_update", async () => {
    const { nft_pubkey } = await createNft({});

    await updateNft({
      nft_pubkey,
      authority: signer,
      metadataUrl: `newww! ${Math.random()}`,
      authorityCanUpdate: false,
    });

    await expect(async () => {
      await updateNft({
        nft_pubkey,
        authority: signer,
        metadataUrl: `newww! ${Math.random()}`,
        authorityCanUpdate: false,
      });
    }).rejects.toThrow();
  });
});
