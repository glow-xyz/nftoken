import * as anchor from "@project-serum/anchor";
import { createCollection } from "../utils/create-collection";
import { createNft } from "../utils/create-nft";
import {
  DEFAULT_KEYPAIR,
  logNft,
  NULL_PUBKEY_STRING,
  nftokenProgram,
} from "../utils/test-utils";

describe("set / unset NFT collection", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  test("set / unset NFT collection", async () => {
    const { nft_pubkey } = await createNft({});
    const { collection_keypair } = await createCollection({});

    const signer = DEFAULT_KEYPAIR.publicKey;

    const set_sig = await nftokenProgram.methods
      .nftSetCollectionV1()
      .accounts({
        nft: nft_pubkey,
        nftAuthority: signer,
        collection: collection_keypair.publicKey,
        collectionAuthority: signer,
      })
      .signers([])
      .rpc();
    console.log("NFT setCollection signature", set_sig);

    const set = await nftokenProgram.account.nftAccount.fetch(nft_pubkey);
    logNft(set);

    expect(set.collection!.toBase58()).toBe(
      collection_keypair.publicKey.toBase58()
    );

    const unset_sig = await nftokenProgram.methods
      .nftUnsetCollectionV1()
      .accounts({
        nft: nft_pubkey,
        authority: signer,
      })
      .signers([])
      .rpc();
    console.log("NFT unsetCollection signature", unset_sig);

    const unset = await nftokenProgram.account.nftAccount.fetch(nft_pubkey);
    expect(unset.collection.toBase58()).toEqual(NULL_PUBKEY_STRING);
  });
});
