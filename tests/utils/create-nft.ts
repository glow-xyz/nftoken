import { Nftoken as NftokenTypes } from "../../target/types/nftoken";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  Base58,
  generateAlphaNumericString,
  logNft,
  strToArr,
} from "./test-utils";

export const createNft = async ({
  metadata_url: _metadata_url,
  program,
}: {
  metadata_url?: string;
  program: Program<NftokenTypes>;
}): Promise<{
  signature: Base58;
  nft_pubkey: PublicKey;
  nft_keypair: Keypair;
}> => {
  const metadata_url = strToArr(
    _metadata_url || generateAlphaNumericString(16),
    64
  );

  const nftKeypair = Keypair.generate();

  const holder = anchor.AnchorProvider.local().wallet.publicKey;

  const signature = await program.methods
    .nftCreate({
      metadataUrl: metadata_url,
      collectionIncluded: false, // collection_included
    })
    .accounts({
      nft: nftKeypair.publicKey,
      holder,
      systemProgram: SystemProgram.programId,
    })
    .signers([nftKeypair])
    .rpc()
    .catch((e) => {
      console.error(e.logs);
      throw e;
    });

  console.log("Mint NFT", signature);

  const nftResult = await program.account.nftAccount.fetch(
    nftKeypair.publicKey
  );
  logNft(nftResult);

  return {
    signature,
    nft_pubkey: nftKeypair.publicKey,
    nft_keypair: nftKeypair,
  };
};
