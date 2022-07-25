import { Solana } from "@glow-xyz/solana-client";
import * as anchor from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Buffer } from "buffer";
import { createNft } from "../utils/create-nft";
import {
  DEFAULT_KEYPAIR,
  marketplaceProgram,
  NFTOKEN_ADDRESS,
  nftokenProgram,
} from "../utils/test-utils";

export const listNft = async ({
  holder,
  nft,
  priceLamports = 1_000_000,
}: {
  holder: Solana.Address;
  nft: Solana.Address;
  priceLamports?: number;
}): Promise<{
  nftListing: Solana.Address;
  priceLamports: number;
}> => {
  const [nftListing] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("listing"),
      new PublicKey(holder).toBuffer(),
      new PublicKey(nft).toBuffer(),
    ],
    marketplaceProgram.programId
  );

  await marketplaceProgram.methods
    .listNftV1({
      priceSol: new BN(1_000_000),
    })
    .accounts({
      seller: new PublicKey(holder),
      nft: new PublicKey(nft),
      nftListing,
      nftoken: new PublicKey(NFTOKEN_ADDRESS),
      systemProgram: SystemProgram.programId,
    })
    .signers([])
    .rpc();

  const nftAccount = await nftokenProgram.account.nftAccount.fetch(
    new PublicKey(nft)
  );
  expect(nftAccount.delegate.toBase58()).toEqual(nftListing.toBase58());

  const nftListingAccount =
    await marketplaceProgram.account.nftListingAccount.fetch(nftListing);
  expect(nftListingAccount.priceSol.toNumber()).toEqual(1_000_000);

  return { nftListing: nftListing.toBase58(), priceLamports };
};

describe("ix_list_nft", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  test("lists an nft successfully", async () => {
    const { nft_pubkey } = await createNft({});

    const holder = DEFAULT_KEYPAIR.publicKey;

    await listNft({ holder: holder.toBase58(), nft: nft_pubkey.toBase58() });
  });
});
