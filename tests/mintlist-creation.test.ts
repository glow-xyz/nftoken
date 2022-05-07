import assert from "assert";
import * as anchor from "@project-serum/anchor";
import { Program, web3, BN } from "@project-serum/anchor";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { getMintlistAccountSize } from "./utils/create-mintlist";

describe("mintlist_create", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  it("should create a mintlist", async () => {
    const treasuryKeypair = web3.Keypair.generate();
    const goLiveDate = new BN(Math.floor(Date.now() / 1000));
    const price = new BN(web3.LAMPORTS_PER_SOL);
    const numMints = 10000;

    const mintlistKeypair = web3.Keypair.generate();

    const mintlistAccountSize = getMintlistAccountSize(numMints);

    const createMintlistAccountInstruction =
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: mintlistKeypair.publicKey,
        space: mintlistAccountSize,
        lamports:
          await program.provider.connection.getMinimumBalanceForRentExemption(
            mintlistAccountSize
          ),
        programId: program.programId,
      });

    await program.methods
      .mintlistCreate({
        treasurySol: treasuryKeypair.publicKey,
        goLiveDate,
        price,
        numMints,
        mintingOrder: "sequential",
      })
      .accounts({
        mintlist: mintlistKeypair.publicKey,
        creator: provider.wallet.publicKey,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
      })
      .signers([mintlistKeypair])
      .preInstructions([createMintlistAccountInstruction])
      .rpc()
      .catch((e) => {
        console.error(e.logs);
        throw e;
      });

    const mintlistData = await program.account.mintlistAccount.fetch(
      mintlistKeypair.publicKey
    );

    assert.equal(mintlistData.version, 1);
    assert.deepEqual(mintlistData.creator, provider.wallet.publicKey);
    assert.deepEqual(mintlistData.treasurySol, treasuryKeypair.publicKey);
    assert.deepEqual(mintlistData.goLiveDate.toNumber(), goLiveDate.toNumber());
    assert.equal(mintlistData.price.toNumber(), price.toNumber());
    assert.deepEqual(mintlistData.numMints, numMints);
    assert.deepEqual(mintlistData.mintsRedeemed, 0);
    assert.deepEqual(mintlistData.mintingOrder, { sequential: {} });
    assert.deepEqual(mintlistData.collection, web3.PublicKey.default);
    assert(mintlistData.createdAt.toNumber() <= Date.now() / 1000);
  });
});
