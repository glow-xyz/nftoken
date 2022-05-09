import * as anchor from "@project-serum/anchor";
import { BN, Program, web3 } from "@project-serum/anchor";
import assert from "assert";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createEmptyMintlist, getMintlistData } from "./utils/mintlist";
import { strToArr } from "./utils/test-utils";

describe("mintlist_add_mint_infos", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  it("should populate mintlist with mintInfo's", async () => {
    const treasuryKeypair = web3.Keypair.generate();
    const goLiveDate = new BN(Math.floor(Date.now() / 1000));
    const price = new BN(web3.LAMPORTS_PER_SOL);
    const numTotalNfts = 1000;

    const { mintlistAddress } = await createEmptyMintlist({
      treasury: treasuryKeypair.publicKey,
      goLiveDate,
      price,
      numTotalNfts,
      program,
    });

    // TODO: If we want to include larger batches, we will need to update / avoid buffer-layout which is
    //       some weird range out of bounds error.
    const batchSize = 10;

    // First batch.
    const mintInfos1 = Array.from({ length: batchSize }, (_, i) => {
      return createMintInfoArg(i);
    });

    await program.methods
      .mintlistAddMintInfos(mintInfos1)
      .accounts({
        mintlist: mintlistAddress,
        creator: provider.wallet.publicKey,
      })
      .rpc();

    let mintlistData = await getMintlistData(program, mintlistAddress);

    assert.equal(mintlistData.mintInfos.length, batchSize);

    for (const [i, mintInfo] of mintlistData.mintInfos.entries()) {
      assert.deepEqual(mintInfo.metadataUrl, mintInfos1[i].metadataUrl);
    }

    // Second batch.

    const mintInfos2 = Array.from({ length: batchSize }, (_, i) => {
      return createMintInfoArg(mintInfos1.length + i);
    });

    await program.methods
      .mintlistAddMintInfos(mintInfos2)
      .accounts({
        mintlist: mintlistAddress,
        creator: provider.wallet.publicKey,
      })
      .rpc();

    mintlistData = await getMintlistData(program, mintlistAddress);

    assert.equal(mintlistData.mintInfos.length, batchSize * 2);

    for (const [i, mintInfo] of mintlistData.mintInfos.entries()) {
      if (i < batchSize) {
        assert.deepEqual(mintInfo.metadataUrl, mintInfos1[i].metadataUrl);
      } else if (i < batchSize * 2) {
        assert.deepEqual(
          mintInfo.metadataUrl,
          mintInfos2[i - batchSize].metadataUrl
        );
      }
    }

    // TODO: Test full population of the mintlist.
  });
});

export function createMintInfoArg(index: number) {
  return {
    metadataUrl: strToArr(`generateAlphaNumericString(16)--${index}`, 64),
  };
}
