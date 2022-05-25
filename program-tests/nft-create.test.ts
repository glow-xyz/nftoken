import * as anchor from "@project-serum/anchor";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { createCollection } from "./utils/create-collection";
import { createNft } from "./utils/create-nft";
import { KeypairWallet } from "./utils/KeypairWallet";
import {
  DEFAULT_KEYPAIR,
  METADATA_LENGTH,
  NftokenIdl,
  NULL_PUBKEY_STRING,
  program,
  PROGRAM_ID,
  strToArr,
} from "./utils/test-utils";

describe("ix_nft_create", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  test("mints an NFT", async () => {
    const creator = DEFAULT_KEYPAIR.publicKey;
    const { nft_pubkey } = await createNft({});
    const nft = await program.account.nftAccount.fetch(nft_pubkey);

    expect(nft.creator.toBase58()).toEqual(creator.toBase58());
    expect(nft.holder.toBase58()).toEqual(creator.toBase58());
    expect(nft.collection.toBase58()).toEqual(NULL_PUBKEY_STRING);
    expect(nft.version).toEqual(1);
  });

  test("mints an NFT to a different holder", async () => {
    const creator = DEFAULT_KEYPAIR.publicKey;
    const holder = Keypair.generate().publicKey;
    const { nft_pubkey } = await createNft({ holder });
    const nft = await program.account.nftAccount.fetch(nft_pubkey);

    expect(nft.creator.toBase58()).toEqual(creator.toBase58());
    expect(nft.holder.toBase58()).toEqual(holder.toBase58());
    expect(nft.collection.toBase58()).toEqual(NULL_PUBKEY_STRING);
    expect(nft.version).toEqual(1);
  });

  test("mints an NFT into a collection", async () => {
    const { creator, collection_keypair } = await createCollection({});

    const nft_metadata_url = strToArr("url2", 96);

    const nftKeypair = Keypair.generate();

    await program.methods
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

    const nft = await program.account.nftAccount.fetch(nftKeypair.publicKey);
    expect(nft.collection.toBase58()).toEqual(
      collection_keypair.publicKey.toBase58()
    );
  });

  test("mints an NFT into a collection we don't have auth for", async () => {
    const creator_keypair = Keypair.generate();

    // We create a newClient since Program implicitly signs with the DEFAULT_KEYPAIR and web3.js
    // will error if that signature isn't necessary.
    const newClient = new Program(
      NftokenIdl,
      PROGRAM_ID,
      new AnchorProvider(
        program.provider.connection,
        new KeypairWallet(creator_keypair),
        {}
      )
    );

    const airdropSig = await newClient.provider.connection.requestAirdrop(
      creator_keypair.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await newClient.provider.connection.confirmTransaction(airdropSig);

    const { creator, collection_keypair } = await createCollection({
      creator_keypair,
      client: newClient,
    });

    const nft_metadata_url = strToArr("url2", METADATA_LENGTH);

    const nftKeypair = Keypair.generate();

    await expect(async () => {
      await program.methods
        .nftCreate({
          metadataUrl: nft_metadata_url,
          collectionIncluded: true, // collection_included
        })
        .accounts({
          nft: nftKeypair.publicKey,
          creator: DEFAULT_KEYPAIR.publicKey,
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
            pubkey: creator_keypair.publicKey, // collection authority
            isSigner: false,
            isWritable: false,
          },
        ])
        .signers([nftKeypair])
        .rpc();
    }).rejects.toThrow();

    await program.methods
      .nftCreate({
        metadataUrl: nft_metadata_url,
        collectionIncluded: true, // collection_included
      })
      .accounts({
        nft: nftKeypair.publicKey,
        creator: DEFAULT_KEYPAIR.publicKey,
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
          pubkey: creator_keypair.publicKey, // collection authority
          isSigner: true,
          isWritable: false,
        },
      ])
      .signers([nftKeypair, creator_keypair])
      .rpc();
  });
});
