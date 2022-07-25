import * as anchor from "@project-serum/anchor";
import { BN, web3 } from "@project-serum/anchor";
import { createEmptyMintlist } from "../utils/mintlist";
import { nftokenProgram } from "../utils/test-utils";

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
      program: nftokenProgram,
    });

    expect(mintlistData.version).toBe(1);
    expect(mintlistData.authority.toBase58()).toBe(
      provider.wallet.publicKey.toBase58()
    );
    expect(mintlistData.treasurySol.toBase58()).toBe(
      treasuryKeypair.publicKey.toBase58()
    );
    expect(mintlistData.goLiveDate.toNumber()).toBe(goLiveDate.toNumber());
    expect(mintlistData.priceLamports.toNumber()).toBe(
      priceLamports.toNumber()
    );
    expect(mintlistData.numNftsTotal).toBe(numNftsTotal);
    expect(mintlistData.numNftsRedeemed).toBe(0);
    expect(mintlistData.mintingOrder).toEqual({ sequential: {} });
    expect(mintlistData.createdAt.toNumber() <= Date.now() / 1000).toBeTruthy();
  });
});
