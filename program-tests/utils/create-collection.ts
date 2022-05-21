import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Nftoken as NftokenTypes } from "../../target/types/nftoken";
import {
  Base58,
  generateAlphaNumericString,
  logCollection,
  strToArr,
} from "./test-utils";

export const createCollection = async ({
  metadata_url: _metadata_url,
  program,
}: {
  metadata_url?: string;
  program: Program<NftokenTypes>;
}): Promise<{
  signature: Base58;
  creator: PublicKey;
  collection_pubkey: PublicKey;
  collection_keypair: Keypair;
}> => {
  const metadataUrl = strToArr(
    _metadata_url || generateAlphaNumericString(16),
    96
  );

  const collection_keypair = Keypair.generate();

  const creator = anchor.AnchorProvider.local().wallet.publicKey;

  const signature = await program.methods
    .collectionCreate({ metadataUrl })
    .accounts({
      collection: collection_keypair.publicKey,
      creator,
      systemProgram: SystemProgram.programId,
    })
    .signers([collection_keypair])
    .rpc();

  console.log("Created Collection, signature:", signature);
  console.log("Collection Address:", collection_keypair.publicKey.toBase58());

  const fetched_collection = await program.account.collectionAccount.fetch(
    collection_keypair.publicKey
  );
  logCollection(fetched_collection);

  return {
    signature,
    collection_pubkey: collection_keypair.publicKey,
    collection_keypair,
    creator,
  };
};
