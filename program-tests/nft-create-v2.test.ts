import * as anchor from "@project-serum/anchor";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { createCollection } from "./utils/create-collection";
import { createNftV2 } from "./utils/create-nft";
import { KeypairWallet } from "./utils/KeypairWallet";
import {
  airdropSol,
  DEFAULT_KEYPAIR,
  NftokenIdl,
  NULL_PUBKEY_STRING,
  program,
  PROGRAM_ID,
} from "./utils/test-utils";

describe("ix_nft_create_v2", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  test("mints an NFT", async () => {
    const authority = DEFAULT_KEYPAIR.publicKey;
    const { nft_pubkey } = await createNftV2({});
    const nft = await program.account.nftAccount.fetch(nft_pubkey);

    expect(nft.authority.toBase58()).toEqual(authority.toBase58());
    expect(nft.holder.toBase58()).toEqual(authority.toBase58());
    expect(nft.collection.toBase58()).toEqual(NULL_PUBKEY_STRING);
    expect(nft.version).toEqual(1);
  });

  test("mints an NFT to a different holder", async () => {
    const authority = DEFAULT_KEYPAIR.publicKey;
    const holder = Keypair.generate().publicKey;
    const { nft_pubkey } = await createNftV2({ holder });
    const nft = await program.account.nftAccount.fetch(nft_pubkey);

    expect(nft.authority.toBase58()).toEqual(authority.toBase58());
    expect(nft.holder.toBase58()).toEqual(holder.toBase58());
    expect(nft.collection.toBase58()).toEqual(NULL_PUBKEY_STRING);
    expect(nft.version).toEqual(1);
  });

  test("mints an NFT with a different payer", async () => {
    const authority = DEFAULT_KEYPAIR.publicKey;
    const holderKeypair = Keypair.generate();
    const holder = holderKeypair.publicKey;

    await airdropSol({ keypair: holderKeypair });

    const { nft_pubkey } = await createNftV2({
      holder,
      payer: holder,
      extraSigners: [holderKeypair],
    });
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
      .nftCreateV2({
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

    await airdropSol({ keypair: authority_keypair });

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

    const { authority, collection_keypair } = await createCollection({
      authority_keypair,
      client: newClient,
    });

    const nft_metadata_url = "url2";

    const nftKeypair = Keypair.generate();

    await expect(async () => {
      await program.methods
        .nftCreateV2({
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
      .nftCreateV2({
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
