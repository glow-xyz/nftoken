import assert from "assert";
import * as anchor from "@project-serum/anchor";
import { Program, web3, BN } from "@project-serum/anchor";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createMintlist } from "./utils/create-mintlist";
import {
  generateAlphaNumericString,
  strToArr,
  MintInfo,
  nullArray32,
  nullArray64,
  arrayToStr,
} from "./utils/test-utils";

describe("mintlist_add_mint_infos", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  it("should populate mintlist with mintInfo's", async () => {
    const treasuryKeypair = web3.Keypair.generate();
    const goLiveDate = new BN(Math.floor(Date.now() / 1000));
    const price = new BN(web3.LAMPORTS_PER_SOL);
    const numMints = 10000;

    const { mintlistAddress } = await createMintlist({
      treasury: treasuryKeypair.publicKey,
      goLiveDate,
      price,
      numMints,
      program,
    });

    // This is maximum number of mintInfo's that fits in a transaction.
    const batchSize = 6;

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

    let mintlistData = await program.account.mintlistAccount.fetch(
      mintlistAddress
    );

    for (const [i, mintInfo] of (
      mintlistData.mintInfos as MintInfo[]
    ).entries()) {
      if (i < batchSize) {
        assert.deepEqual(mintInfo.name, mintInfos1[i].name);
        assert.deepEqual(mintInfo.imageUrl, mintInfos1[i].imageUrl);
        assert.deepEqual(mintInfo.metadataUrl, mintInfos1[i].metadataUrl);
      } else {
        // Check that the rest of the mintInfos are not populated.
        assert.deepEqual(mintInfo.name, nullArray32);
        assert.deepEqual(mintInfo.imageUrl, nullArray64);
        assert.deepEqual(mintInfo.metadataUrl, nullArray64);
      }
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

    mintlistData = await program.account.mintlistAccount.fetch(mintlistAddress);

    for (const [i, mintInfo] of (
      mintlistData.mintInfos as MintInfo[]
    ).entries()) {
      if (i < batchSize) {
        assert.deepEqual(mintInfo.name, mintInfos1[i].name);
        assert.deepEqual(mintInfo.imageUrl, mintInfos1[i].imageUrl);
        assert.deepEqual(mintInfo.metadataUrl, mintInfos1[i].metadataUrl);
      } else if (i < batchSize * 2) {
        assert.deepEqual(mintInfo.name, mintInfos2[i - batchSize].name);
        assert.deepEqual(mintInfo.imageUrl, mintInfos2[i - batchSize].imageUrl);
        assert.deepEqual(
          mintInfo.metadataUrl,
          mintInfos2[i - batchSize].metadataUrl
        );
      } else {
        // Check that the rest of the mintInfos are not populated.
        assert.deepEqual(mintInfo.name, nullArray32);
        assert.deepEqual(mintInfo.imageUrl, nullArray64);
        assert.deepEqual(mintInfo.metadataUrl, nullArray64);
      }
    }

    // TODO: Test full population of the mintlist.
  });
});

function createMintInfoArg(index: number) {
  return {
    name: strToArr(`Pesky Animals #${index}`, 32),
    imageUrl: strToArr(generateAlphaNumericString(16), 64),
    metadataUrl: strToArr(generateAlphaNumericString(16), 64),
  };
}
