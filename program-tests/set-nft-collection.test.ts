import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createCollection } from "./utils/create-collection";
import { createNft } from "./utils/create-nft";
import { logNft, NULL_PUBKEY_STRING } from "./utils/test-utils";

describe("set / unset NFT collection", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  test("set / unset NFT collection", async () => {
    const { nft_pubkey } = await createNft({ program });
    const { collection_keypair } = await createCollection({ program });

    const signer = anchor.AnchorProvider.local().wallet.publicKey;

    const set_sig = await program.methods
      .nftSetCollection()
      .accounts({
        nft: nft_pubkey,
        nftAuthority: signer,
        collection: collection_keypair.publicKey,
        collectionAuthority: signer,
      })
      .signers([])
      .rpc();
    console.log("NFT setCollection signature", set_sig);

    const set = await program.account.nftAccount.fetch(nft_pubkey);
    logNft(set);

    expect(set.collection!.toBase58()).toBe(
      collection_keypair.publicKey.toBase58()
    );

    const unset_sig = await program.methods
      .nftUnsetCollection()
      .accounts({
        nft: nft_pubkey,
        nftAuthority: signer,
      })
      .signers([])
      .rpc();
    console.log("NFT unsetCollection signature", unset_sig);

    const unset = await program.account.nftAccount.fetch(nft_pubkey);
    expect(unset.collection.toBase58()).toEqual(NULL_PUBKEY_STRING);
  });
});
