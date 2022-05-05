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
  name: _name,
  image_url: _image_url,
  metadata_url: _metadata_url,
  program,
}: {
  name?: string;
  image_url?: string;
  metadata_url?: string;
  program: Program<NftokenTypes>;
}): Promise<{
  signature: Base58;
  nft_pubkey: PublicKey;
  nft_keypair: Keypair;
}> => {
  const name = strToArr(_name || generateAlphaNumericString(16), 32);
  const image_url = strToArr(_image_url || generateAlphaNumericString(16), 64);
  const metadata_url = strToArr(
    _metadata_url || generateAlphaNumericString(16),
    64
  );

  const nftKeypair = Keypair.generate();

  const holder = anchor.AnchorProvider.local().wallet.publicKey;

  const signature = await program.methods
    .nftCreate(
      name,
      image_url,
      metadata_url,
      false // collection_included
    )
    .accounts({
      nft: nftKeypair.publicKey,
      holder,
      systemProgram: SystemProgram.programId,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    })
    .signers([nftKeypair])
    .rpc();

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
