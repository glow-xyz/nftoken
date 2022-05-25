import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Nftoken as NftokenTypes } from "../../target/types/nftoken";
import {
  Base58,
  DEFAULT_KEYPAIR,
  generateAlphaNumericString,
  logNft,
  NftokenIdlType, program,
  strToArr
} from "./test-utils";

export const createNft = async ({
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
  const metadata_url = strToArr(
    _metadata_url || generateAlphaNumericString(16),
    96
  );

  const nftKeypair = Keypair.generate();

  const creator = DEFAULT_KEYPAIR.publicKey;

  const signature = await client.methods
    .nftCreate({
      metadataUrl: metadata_url,
      collectionIncluded: false, // collection_included
    })
    .accounts({
      nft: nftKeypair.publicKey,
      creator,
      holder: holder ?? creator,
      systemProgram: SystemProgram.programId,
    })
    .signers([nftKeypair])
    .rpc()
    .catch((e) => {
      console.error(e);
      throw e;
    });

  const nftResult = await client.account.nftAccount.fetch(
    nftKeypair.publicKey
  );
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
  creator,
  metadataUrl: _metadataUrl,
  creatorCanUpdate,
  client = program,
}: {
  nft_pubkey: PublicKey;
  creator: PublicKey;
  metadataUrl: string;
  creatorCanUpdate: boolean;
  client?: Program<NftokenTypes>;
}) => {
  const metadataUrl = strToArr("new-meta", 96);
  await client.methods
    .nftUpdate({ metadataUrl, creatorCanUpdate })
    .accounts({
      nft: nft_pubkey,
      creator,
    })
    .signers([])
    .rpc();

  const updated = await client.account.nftAccount.fetch(nft_pubkey);

  expect(updated.metadataUrl).toEqual(metadataUrl);
  expect(updated.creatorCanUpdate).toEqual(creatorCanUpdate);
};
