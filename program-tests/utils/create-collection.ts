import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  Base58,
  DEFAULT_KEYPAIR,
  generateAlphaNumericString,
  logCollection,
  NftokenIdlType,
  program,
} from "./test-utils";

export const createCollection = async ({
  metadata_url: _metadata_url,
  creator_keypair = DEFAULT_KEYPAIR,
  verbose,
  client = program,
}: {
  metadata_url?: string;
  creator_keypair?: Keypair;
  verbose?: boolean;
  client?: Program<NftokenIdlType>;
}): Promise<{
  signature: Base58;
  creator: PublicKey;
  collection_pubkey: PublicKey;
  collection_keypair: Keypair;
}> => {
  const metadataUrl = _metadata_url || generateAlphaNumericString(16);

  const collection_keypair = Keypair.generate();

  const signature = await client.methods
    .collectionCreateV1({ metadataUrl })
    .accounts({
      collection: collection_keypair.publicKey,
      creator: creator_keypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([collection_keypair, creator_keypair])
    .rpc();

  const fetched_collection = await program.account.collectionAccount.fetch(
    collection_keypair.publicKey
  );
  if (verbose) {
    logCollection(fetched_collection);
  }

  return {
    signature,
    collection_pubkey: collection_keypair.publicKey,
    collection_keypair,
    creator: creator_keypair.publicKey,
  };
};
