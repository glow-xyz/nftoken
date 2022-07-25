import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  Base58,
  DEFAULT_KEYPAIR,
  generateAlphaNumericString,
  logCollection,
  NftokenIdlType,
  nftokenProgram,
} from "./test-utils";

export const createCollection = async ({
  metadata_url: _metadata_url,
  authority_keypair = DEFAULT_KEYPAIR,
  verbose,
  client = nftokenProgram,
}: {
  metadata_url?: string;
  authority_keypair?: Keypair;
  verbose?: boolean;
  client?: Program<NftokenIdlType>;
}): Promise<{
  signature: Base58;
  authority: PublicKey;
  collection_pubkey: PublicKey;
  collection_keypair: Keypair;
}> => {
  const metadataUrl = _metadata_url || generateAlphaNumericString(16);

  const collection_keypair = Keypair.generate();

  const signature = await client.methods
    .collectionCreateV1({ metadataUrl })
    .accounts({
      collection: collection_keypair.publicKey,
      authority: authority_keypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([collection_keypair, authority_keypair])
    .rpc();

  const fetched_collection = await nftokenProgram.account.collectionAccount.fetch(
    collection_keypair.publicKey
  );
  if (verbose) {
    logCollection(fetched_collection);
  }

  return {
    signature,
    collection_pubkey: collection_keypair.publicKey,
    collection_keypair,
    authority: authority_keypair.publicKey,
  };
};
