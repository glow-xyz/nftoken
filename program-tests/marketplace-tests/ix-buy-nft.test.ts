import * as anchor from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { createNft } from "../utils/create-nft";
import {
  DEFAULT_KEYPAIR,
  marketplaceProgram,
  NFTOKEN_ADDRESS,
} from "../utils/test-utils";
import { listNft } from "./ix-list-nft.test";

describe("ix_buy_nft", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  test("buys an NFT", async () => {
    const { nft_pubkey } = await createNft({});

    const holder = DEFAULT_KEYPAIR.publicKey;

    const { nftListing, priceLamports } = await listNft({
      holder: holder.toBase58(),
      nft: nft_pubkey.toBase58(),
    });
    console.log('listing', nftListing)

    await marketplaceProgram.methods
      .buyNftV1({
        priceSol: new BN(priceLamports),
      })
      .accounts({
        seller: new PublicKey(holder),
        buyer: new PublicKey(holder),
        nft: nft_pubkey,
        nftListing,
        nftoken: new PublicKey(NFTOKEN_ADDRESS),
        systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc()
      .catch((e) => {
        console.log(e);
        throw e
      });
  });
});
