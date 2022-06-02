import * as anchor from "@project-serum/anchor";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { createCollection } from "./utils/create-collection";
import { createNft } from "./utils/create-nft";
import { KeypairWallet } from "./utils/KeypairWallet";
import {
  DEFAULT_KEYPAIR,
  NftokenIdl,
  NULL_PUBKEY_STRING,
  program,
  PROGRAM_ID,
} from "./utils/test-utils";

describe("ix_nft_create", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  test("mints an NFT", async () => {
    const authority = DEFAULT_KEYPAIR.publicKey;
    const { nft_pubkey } = await createNft({});
    const nft = await program.account.nftAccount.fetch(nft_pubkey);

    expect(nft.authority.toBase58()).toEqual(authority.toBase58());
    expect(nft.holder.toBase58()).toEqual(authority.toBase58());
    expect(nft.collection.toBase58()).toEqual(NULL_PUBKEY_STRING);
    expect(nft.version).toEqual(1);
  });

  test("mints an NFT to a different holder", async () => {
    const authority = DEFAULT_KEYPAIR.publicKey;
    const holder = Keypair.generate().publicKey;
    const { nft_pubkey } = await createNft({ holder });
    const nft = await program.account.nftAccount.fetch(nft_pubkey);

    expect(nft.authority.toBase58()).toEqual(authority.toBase58());
    expect(nft.holder.toBase58()).toEqual(holder.toBase58());
    expect(nft.collection.toBase58()).toEqual(NULL_PUBKEY_STRING);
    expect(nft.version).toEqual(1);
  });

  test("mints an NFT into a collection", async () => {
    const { authority, collection_keypair } = await createCollection({});

    const nft_metadata_url = "url2";

    const nftKeypair = Keypair.generate();

    await program.methods
      .nftCreateV1({
        metadataUrl: nft_metadata_url,
        collectionIncluded: true, // collection_included
      })
      .accounts({
        nft: nftKeypair.publicKey,
        authority,
        holder: authority,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts([
        {
          pubkey: collection_keypair.publicKey, // collection ID
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: authority, // collection authority
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
    const authority_keypair = Keypair.generate();

    // We create a newClient since Program implicitly signs with the DEFAULT_KEYPAIR and web3.js
    // will error if that signature isn't necessary.
    const newClient = new Program(
      NftokenIdl,
      PROGRAM_ID,
      new AnchorProvider(
        program.provider.connection,
        new KeypairWallet(authority_keypair),
        {}
      )
    );

    const airdropSig = await newClient.provider.connection.requestAirdrop(
      authority_keypair.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await newClient.provider.connection.confirmTransaction(airdropSig);

    const { authority, collection_keypair } = await createCollection({
      authority_keypair,
      client: newClient,
    });

    const nft_metadata_url = "url2";

    const nftKeypair = Keypair.generate();

    await expect(async () => {
      await program.methods
        .nftCreateV1({
          metadataUrl: nft_metadata_url,
          collectionIncluded: true, // collection_included
        })
        .accounts({
          nft: nftKeypair.publicKey,
          authority: DEFAULT_KEYPAIR.publicKey,
          holder: authority,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts([
          {
            pubkey: collection_keypair.publicKey, // collection ID
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: authority_keypair.publicKey, // collection authority
            isSigner: false,
            isWritable: false,
          },
        ])
        .signers([nftKeypair])
        .rpc();
    }).rejects.toThrow();

    await program.methods
      .nftCreateV1({
        metadataUrl: nft_metadata_url,
        collectionIncluded: true, // collection_included
      })
      .accounts({
        nft: nftKeypair.publicKey,
        authority: DEFAULT_KEYPAIR.publicKey,
        holder: authority,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts([
        {
          pubkey: collection_keypair.publicKey, // collection ID
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: authority_keypair.publicKey, // collection authority
          isSigner: true,
          isWritable: false,
        },
      ])
      .signers([nftKeypair, authority_keypair])
      .rpc();
  });
});
