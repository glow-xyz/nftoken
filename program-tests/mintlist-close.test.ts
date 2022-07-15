import * as anchor from "@project-serum/anchor";
import { BN, web3 } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { createEmptyMintlist } from "./utils/mintlist";
import { program } from "./utils/test-utils";

describe("mintlist_close", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  it("should close a mintlist", async () => {
    const treasuryKeypair = web3.Keypair.generate();
    const goLiveDate = new BN(0);
    const priceLamports = new BN(web3.LAMPORTS_PER_SOL);
    const numNftsTotal = 1;

    const { mintlistAddress } = await createEmptyMintlist({
      treasury: treasuryKeypair.publicKey,
      goLiveDate,
      priceLamports,
      numNftsTotal,
      program,
    });

    const { wallet } = anchor.AnchorProvider.local();

    await program.methods
      .mintlistCloseV1()
      .accounts({
        mintlist: mintlistAddress,
        authority: wallet.publicKey,
      })
      .signers([])
      .rpc();

    const mintlistAccount = await program.provider.connection.getAccountInfo(
      new PublicKey(mintlistAddress)
    );
    expect(mintlistAccount).toBeNull();
  });
});
