import assert from "assert";
import * as anchor from "@project-serum/anchor";
import { BN, Program, web3 } from "@project-serum/anchor";
import { Nftoken as NftokenTypes, IDL } from "../../target/types/nftoken";
import { PublicKey } from "@solana/web3.js";
import { IdlCoder } from "./IdlCoder";

// TODO: Consider using `beet` or some other library for creating this layout.
const MINT_INFO_LAYOUT = IdlCoder.typeDefLayout(
  IDL.types.find((type) => type.name === "MintInfo")!,
  IDL.types
);

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

export async function getMintlistData(
  program: Program<NftokenTypes>,
  mintlistAddress: PublicKey
) {
  const mintlistRawData = await program.provider.connection
    .getAccountInfo(mintlistAddress)
    .then((accountInfo) => accountInfo?.data);
  assert(
    mintlistRawData,
    `Cannot find Mintlist account with address ${mintlistAddress.toBase58()}.`
  );

  const mintlistData = program.coder.accounts.decode(
    "MintlistAccount",
    mintlistRawData
  );

  // We need to deserialize `mintInfos` manually because they aren't declared in the anchor `Mintlist` type.

  const mintInfosBytesOffset = getMintlistAccountSize(0);
  const mintInfosBuffer = mintlistRawData.slice(mintInfosBytesOffset);

  const mintInfos = Array.from(
    { length: mintlistData.mintInfosAdded },
    (_, i) => {
      const start = i * MINT_INFO_LAYOUT.span;
      return MINT_INFO_LAYOUT.decode(
        mintInfosBuffer.slice(start, start + MINT_INFO_LAYOUT.span)
      );
    }
  );

  mintlistData.mintInfos = mintInfos;

  return mintlistData;
}

export function getMintlistAccountSize(numMints: number): number {
  return (
    // Account discriminator
    8 +
    // version
    1 +
    // creator
    32 +
    // treasury_sol
    32 +
    // go_live_date
    8 +
    // price
    8 +
    // minting_order
    1 +
    // num_mints
    2 +
    // mints_redeemed
    2 +
    // _alignment
    2 +
    // collection
    32 +
    // created_at
    8 +
    // mint_infos
    numMints * MINT_INFO_LAYOUT.span
  );
}
