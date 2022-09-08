import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, Signer, SystemProgram } from "@solana/web3.js";
import { Nftoken as NftokenTypes } from "../../target/types/nftoken";
import {
  Base58,
  DEFAULT_KEYPAIR,
  generateAlphaNumericString,
  logNft,
  NftokenIdlType,
  program,
} from "./test-utils";

export const createNftV1 = async ({
  metadata_url: _metadata_url,
  holder,
  verbose,
  client = program,
}: {
  metadata_url?: string;
  holder?: PublicKey | null;
  verbose?: boolean;
  client?: Program<NftokenIdlType>;
}): Promise<{
  signature: Base58;
  nft_pubkey: PublicKey;
  nft_keypair: Keypair;
}> => {
  const metadata_url = _metadata_url || generateAlphaNumericString(16);

  const nftKeypair = Keypair.generate();

  const creator = DEFAULT_KEYPAIR.publicKey;

  const signature = await client.methods
    .nftCreateV1({
      metadataUrl: metadata_url,
      collectionIncluded: false, // collection_included
    })
    .accounts({
      nft: nftKeypair.publicKey,
      authority: creator,
      holder: holder ?? creator,
      systemProgram: SystemProgram.programId,
    })
    .signers([nftKeypair])
    .rpc()
    .catch((e) => {
      console.error(e);
      throw e;
    });

  const nftResult = await client.account.nftAccount.fetch(nftKeypair.publicKey);
  if (verbose) {
    logNft(nftResult);
  }

  return {
    signature,
    nft_pubkey: nftKeypair.publicKey,
    nft_keypair: nftKeypair,
  };
};

export const createNftV2 = async ({
  metadata_url: _metadata_url,
  authority,
  holder,
  payer,
  verbose,
  client = program,
  extraSigners = [],
}: {
  metadata_url?: string;
  authority?: PublicKey | null;
  holder?: PublicKey | null;
  payer?: PublicKey | null;
  verbose?: boolean;
  client?: Program<NftokenIdlType>;
  extraSigners?: Array<Signer>;
}): Promise<{
  signature: Base58;
  nft_pubkey: PublicKey;
  nft_keypair: Keypair;
}> => {
  const metadata_url = _metadata_url || generateAlphaNumericString(16);

  const nftKeypair = Keypair.generate();

  const creator = DEFAULT_KEYPAIR.publicKey;

  const signature = await client.methods
    .nftCreateV2({
      metadataUrl: metadata_url,
      collectionIncluded: false, // collection_included
    })
    .accounts({
      nft: nftKeypair.publicKey,
      authority: authority ?? creator,
      holder: holder ?? creator,
      payer: payer ?? creator,
      systemProgram: SystemProgram.programId,
    })
    .signers([nftKeypair, ...extraSigners])
    .rpc()
    .catch((e) => {
      console.error(e);
      throw e;
    });

  const nftResult = await client.account.nftAccount.fetch(nftKeypair.publicKey);
  if (verbose) {
    logNft(nftResult);
  }

  return {
    signature,
    nft_pubkey: nftKeypair.publicKey,
    nft_keypair: nftKeypair,
  };
};

export const updateNft = async ({
  nft_pubkey,
  authority,
  metadataUrl: _metadataUrl,
  isFrozen,
  authorityCanUpdate,
  client = program,
}: {
  nft_pubkey: PublicKey;
  authority: PublicKey;
  isFrozen?: boolean;
  metadataUrl: string;
  authorityCanUpdate: boolean;
  client?: Program<NftokenTypes>;
}) => {
  const metadataUrl = "new-meta";
  await client.methods
    .nftUpdateV1({
      metadataUrl,
      authorityCanUpdate,
      isFrozen: isFrozen ?? false,
    })
    .accounts({
      nft: nft_pubkey,
      authority,
    })
    .signers([])
    .rpc();

  const updated = await client.account.nftAccount.fetch(nft_pubkey);

  expect(updated.metadataUrl).toEqual(metadataUrl);
  expect(updated.authorityCanUpdate).toEqual(authorityCanUpdate);
};
