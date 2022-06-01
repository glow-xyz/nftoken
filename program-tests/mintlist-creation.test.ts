import * as anchor from "@project-serum/anchor";
import { BN, web3 } from "@project-serum/anchor";
import assert from "assert";
import { createEmptyMintlist } from "./utils/mintlist";
import { program } from "./utils/test-utils";

describe("mintlist_create", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  it("should create a mintlist", async () => {
    const treasuryKeypair = web3.Keypair.generate();
    const goLiveDate = new BN(Math.floor(Date.now() / 1000));
    const priceLamports = new BN(web3.LAMPORTS_PER_SOL);
    const numNftsTotal = 10000;

    const { mintlistData } = await createEmptyMintlist({
      treasury: treasuryKeypair.publicKey,
      goLiveDate,
      priceLamports,
      numNftsTotal,
      program,
    });

    assert.equal(mintlistData.version, 1);
    assert.deepEqual(mintlistData.authority, provider.wallet.publicKey);
    assert.deepEqual(mintlistData.treasurySol, treasuryKeypair.publicKey);
    assert.deepEqual(mintlistData.goLiveDate.toNumber(), goLiveDate.toNumber());
    assert.equal(
      mintlistData.priceLamports.toNumber(),
      priceLamports.toNumber()
    );
    assert.deepEqual(mintlistData.numNftsTotal, numNftsTotal);
    assert.deepEqual(mintlistData.numNftsRedeemed, 0);
    assert.deepEqual(mintlistData.mintingOrder, { sequential: {} });
    assert(mintlistData.createdAt.toNumber() <= Date.now() / 1000);
  });
});
