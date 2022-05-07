import * as anchor from "@project-serum/anchor";
import { BN, Program, web3 } from "@project-serum/anchor";
import { Nftoken as NftokenTypes } from "../../target/types/nftoken";

export async function createMintlist({
  treasury,
  goLiveDate,
  price,
  numMints,
  program,
}: {
  treasury: web3.PublicKey;
  goLiveDate: BN;
  price: BN;
  numMints: number;
  program: Program<NftokenTypes>;
}) {
  const { wallet } = anchor.AnchorProvider.local();

  const mintlistKeypair = web3.Keypair.generate();
  const mintlistAccountSize = getMintlistAccountSize(numMints);

  const createMintlistAccountInstruction =
    anchor.web3.SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
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
      treasurySol: treasury,
      goLiveDate,
      price,
      numMints,
      mintingOrder: "sequential",
    })
    .accounts({
      mintlist: mintlistKeypair.publicKey,
      creator: wallet.publicKey,
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

  return { mintlistAddress: mintlistKeypair.publicKey, mintlistData };
}

export function getMintlistAccountSize(numMints: number): number {
  return (
    // Account discriminator
    8 +
    // version
    1 +
    // minting_order
    1 +
    // num_mints
    2 +
    // mints_redeemed
    2 +
    // _alignment
    2 +
    // creator
    32 +
    // treasury_sol
    32 +
    // go_live_date
    8 +
    // price
    8 +
    // collection
    32 +
    // created_at
    8 +
    // mint_infos
    // FIXME: When we figure out how to store the list of `MintInfo`'s, we might need to add the size of the container.
    numMints * getMintInfoSize()
  );
}

function getMintInfoSize(): number {
  return (
    // name
    32 +
    // image_url
    64 +
    // metadata_url
    64 +
    // minted
    1 +
    // _alignment
    7
  );
}
