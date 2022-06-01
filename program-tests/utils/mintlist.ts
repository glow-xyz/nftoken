import assert from "assert";
import * as anchor from "@project-serum/anchor";
import { BN, Program, web3 } from "@project-serum/anchor";
import { Nftoken as NftokenTypes, IDL } from "../../target/types/nftoken";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { createMintInfoArg } from "../mintlist-add-mint-infos.test";
import { IdlCoder } from "./IdlCoder";
import { arrayToStr, strToArr } from "./test-utils";

// TODO: Consider using `beet` or some other library for creating this layout.
const MINT_INFO_LAYOUT = IdlCoder.typeDefLayout(
  IDL.types.find((type) => type.name === "MintInfo")!,
  IDL.types
);

type MintingOrder = "sequential" | "random";

export async function createEmptyMintlist({
  treasury,
  goLiveDate,
  priceLamports,
  numNftsTotal,
  program,
  mintingOrder = "sequential",
}: {
  treasury: web3.PublicKey;
  goLiveDate: BN;
  priceLamports: BN;
  numNftsTotal: number;
  program: Program<NftokenTypes>;
  mintingOrder?: MintingOrder;
}) {
  const { wallet } = anchor.AnchorProvider.local();

  const mintlistKeypair = web3.Keypair.generate();
  const mintlistAccountSize = getMintlistAccountSize(numNftsTotal);

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

  const collectionKeypair = Keypair.generate();

  await program.methods
    .mintlistCreateV1({
      goLiveDate,
      priceLamports,
      numNftsTotal,
      mintingOrder,
      metadataUrl: strToArr("random-meta", 96),
      collectionMetadataUrl: "coll-random-meta"
    })
    .accounts({
      collection: collectionKeypair.publicKey,
      mintlist: mintlistKeypair.publicKey,
      authority: wallet.publicKey,
      clock: web3.SYSVAR_CLOCK_PUBKEY,
      treasurySol: treasury,
      systemProgram: SystemProgram.programId,
    })
    .signers([mintlistKeypair, collectionKeypair])
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
  authority: string;
  treasurySol: string;
  goLiveDate: BN;
  priceLamports: BN;
  mintingOrder: MintingOrder;
  numNftsTotal: number;
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

export function getMintlistAccountSize(numNftsTotal: number): number {
  return (
    8 +
    1 +
    32 +
    32 +
    8 +
    8 +
    1 +
    32 +
    96 +
    8 +
    4 +
    4 +
    4 +
    // mint_infos
    numNftsTotal * MINT_INFO_LAYOUT.span
  );
}

// TODO: If we want to include larger batches, we will need to update / avoid buffer-layout which is
//       some weird range out of bounds error.
const ADD_INFOS_BATCH_SIZE = 10;

export async function createMintlistWithInfos({
  treasury,
  goLiveDate,
  priceLamports,
  program,
  mintingOrder,
}: {
  treasury: web3.PublicKey;
  goLiveDate: BN;
  priceLamports: BN;
  program: Program<NftokenTypes>;
  mintingOrder?: MintingOrder;
}): Promise<{ mintlistPubkey: PublicKey; mintlistData: MintlistData }> {
  const { mintlistAddress } = await createEmptyMintlist({
    treasury,
    goLiveDate,
    priceLamports,
    numNftsTotal: ADD_INFOS_BATCH_SIZE,
    program,
    mintingOrder,
  });

  const mintInfos = Array.from({ length: ADD_INFOS_BATCH_SIZE }, (_, i) => {
    return createMintInfoArg(i);
  });

  const { wallet } = anchor.AnchorProvider.local();

  await program.methods
    .mintlistAddMintInfosV1({ currentNftCount: 0, mintInfos })
    .accounts({
      mintlist: mintlistAddress,
      authority: wallet.publicKey,
    })
    .rpc();

  const mintlistData = await getMintlistData({
    mintlistPubkey: mintlistAddress,
    program,
  });
  return { mintlistPubkey: mintlistAddress, mintlistData };
}
