import assert from "assert";
import * as anchor from "@project-serum/anchor";
import { BN, Program, web3 } from "@project-serum/anchor";
import { Nftoken as NftokenTypes, IDL } from "../../target/types/nftoken";
import { PublicKey } from "@solana/web3.js";
import { createMintInfoArg } from "../mintlist-add-mint-infos.test";
import { IdlCoder } from "./IdlCoder";
import { arrayToStr } from "./test-utils";

// TODO: Consider using `beet` or some other library for creating this layout.
const MINT_INFO_LAYOUT = IdlCoder.typeDefLayout(
  IDL.types.find((type) => type.name === "MintInfo")!,
  IDL.types
);

type MintingOrder = "sequential" | "random";

export async function createEmptyMintlist({
  treasury,
  goLiveDate,
  price,
  numTotalNfts,
  program,
  mintingOrder = "sequential",
}: {
  treasury: web3.PublicKey;
  goLiveDate: BN;
  price: BN;
  numTotalNfts: number;
  program: Program<NftokenTypes>;
  mintingOrder?: MintingOrder;
}) {
  const { wallet } = anchor.AnchorProvider.local();

  const mintlistKeypair = web3.Keypair.generate();
  const mintlistAccountSize = getMintlistAccountSize(numTotalNfts);

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
      numTotalNfts,
      mintingOrder,
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

type MintlistData = {
  version: number;
  creator: string;
  treasurySol: string;
  goLiveDate: BN;
  price: BN;
  mintingOrder: MintingOrder;
  numTotalNfts: number;
  numNftsConfigured: number;
  numNftsRedeemed: number;
  collection: string;
  mintInfos: Array<{ minted: boolean; metadataUrl: string }>;
};

export async function getMintlistData({
  program,
  mintlistPubkey,
}: {
  program: Program<NftokenTypes>;
  mintlistPubkey: PublicKey;
}): Promise<MintlistData> {
  const mintlistRawData = await program.provider.connection
    .getAccountInfo(mintlistPubkey)
    .then((accountInfo) => accountInfo?.data);
  assert(
    mintlistRawData,
    `Cannot find Mintlist account with address ${mintlistPubkey.toBase58()}.`
  );

  const mintlistData = program.coder.accounts.decode(
    "MintlistAccount",
    mintlistRawData
  );

  // We need to deserialize `mintInfos` manually because they aren't declared in the anchor `Mintlist` type.

  const mintInfosBytesOffset = getMintlistAccountSize(0);
  const mintInfosBuffer = mintlistRawData.slice(mintInfosBytesOffset);

  const mintInfos = Array.from(
    { length: mintlistData.numNftsConfigured },
    (_, i) => {
      const start = i * MINT_INFO_LAYOUT.span;
      return MINT_INFO_LAYOUT.decode(
        mintInfosBuffer.slice(start, start + MINT_INFO_LAYOUT.span)
      );
    }
  ).map(({ minted, metadataUrl }) => ({
    minted,
    metadataUrl: arrayToStr(metadataUrl),
  }));

  mintlistData.mintInfos = mintInfos;

  return mintlistData;
}

export function getMintlistAccountSize(numTotalNfts: number): number {
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
    numTotalNfts * MINT_INFO_LAYOUT.span
  );
}

// TODO: If we want to include larger batches, we will need to update / avoid buffer-layout which is
//       some weird range out of bounds error.
const ADD_INFOS_BATCH_SIZE = 10;

export async function createMintlistWithInfos({
  treasury,
  goLiveDate,
  price,
  program,
  mintingOrder,
}: {
  treasury: web3.PublicKey;
  goLiveDate: BN;
  price: BN;
  program: Program<NftokenTypes>;
  mintingOrder?: MintingOrder;
}): Promise<{ mintlistPubkey: PublicKey; mintlistData: MintlistData }> {
  const { mintlistAddress } = await createEmptyMintlist({
    treasury,
    goLiveDate,
    price,
    numTotalNfts: ADD_INFOS_BATCH_SIZE,
    program,
    mintingOrder,
  });

  const mintInfos = Array.from({ length: ADD_INFOS_BATCH_SIZE }, (_, i) => {
    return createMintInfoArg(i);
  });

  const { wallet } = anchor.AnchorProvider.local();

  await program.methods
    .mintlistAddMintInfos(mintInfos)
    .accounts({
      mintlist: mintlistAddress,
      creator: wallet.publicKey,
    })
    .rpc();

  const mintlistData = await getMintlistData({
    mintlistPubkey: mintlistAddress,
    program,
  });
  return { mintlistPubkey: mintlistAddress, mintlistData };
}
