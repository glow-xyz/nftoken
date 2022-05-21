import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createCollection } from "./utils/create-collection";
import { createNft } from "./utils/create-nft";
import { logNft, NULL_PUBKEY_STRING, strToArr } from "./utils/test-utils";

describe("ix_nft_create", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  test("mints an NFT", async () => {
    const creator = anchor.AnchorProvider.local().wallet.publicKey;
    const { nft_pubkey } = await createNft({ program });
    const nft = await program.account.nftAccount.fetch(nft_pubkey);

    expect(nft.creator.toBase58()).toEqual(creator.toBase58());
    expect(nft.holder.toBase58()).toEqual(creator.toBase58());
    expect(nft.collection.toBase58()).toEqual(NULL_PUBKEY_STRING);
    expect(nft.version).toEqual(1);
  });

  test("mints an NFT to a different holder", async () => {
    const creator = anchor.AnchorProvider.local().wallet.publicKey;
    const holder = Keypair.generate().publicKey;
    const { nft_pubkey } = await createNft({ program, holder });
    const nft = await program.account.nftAccount.fetch(nft_pubkey);

    expect(nft.creator.toBase58()).toEqual(creator.toBase58());
    expect(nft.holder.toBase58()).toEqual(holder.toBase58());
    expect(nft.collection.toBase58()).toEqual(NULL_PUBKEY_STRING);
    expect(nft.version).toEqual(1);
  });

  test("mints an NFT into a collection", async () => {
    const { creator, collection_keypair } = await createCollection({ program });

    const nft_metadata_url = strToArr("url2", 96);

    const nftKeypair = Keypair.generate();

    const sig1 = await program.methods
      .nftCreate({
        metadataUrl: nft_metadata_url,
        collectionIncluded: true, // collection_included
      })
      .accounts({
        nft: nftKeypair.publicKey,
        creator,
        holder: creator,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts([
        {
          pubkey: collection_keypair.publicKey, // collection ID
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: creator, // collection authority
          isSigner: false,
          isWritable: false,
        },
      ])
      .signers([nftKeypair])
      .rpc();

    console.log("Mint NFT", sig1);

    const nftResult = await program.account.nftAccount.fetch(
      nftKeypair.publicKey
    );
    logNft(nftResult);
  });
});
