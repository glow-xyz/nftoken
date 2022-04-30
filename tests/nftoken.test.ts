import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Buffer } from "buffer";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";

const strToArr = (str: string, length: number): Array<number> => {
  const buff = Buffer.alloc(length);
  buff.write(str, 0);
  return Array.from(buff);
};

describe("nftoken", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  test("mints an NFT", async () => {
    const name = strToArr("nft1", 32);
    const image_url = strToArr("url1", 128);
    const metadata_url = strToArr("url2", 128);

    const nftKeypair = Keypair.generate();

    const holder = anchor.AnchorProvider.local().wallet.publicKey;

    const sig1 = await program.methods
      .mintNft(
        name,
        image_url,
        metadata_url,
        false // collection_included
      )
      .accounts({
        nftAccount: nftKeypair.publicKey,
        holder,
        systemProgram: SystemProgram.programId,
      })
      .signers([nftKeypair])
      .rpc();

    console.log("Mint NFT", sig1);

    const nftResult = await program.account.nftAccount.fetch(
      nftKeypair.publicKey
    );
    logNft(nftResult);
  });

  test("creates a collection", async () => {
    const name = strToArr("col1", 32);
    const image_url = strToArr("colimg1", 128);
    const metadata_url = strToArr("colmeta1", 128);

    const collectionKeypair = Keypair.generate();

    const creator = anchor.AnchorProvider.local().wallet.publicKey;

    const sig1 = await program.methods
      .createCollection(name, image_url, metadata_url)
      .accounts({
        collectionAccount: collectionKeypair.publicKey,
        creator,
        systemProgram: SystemProgram.programId,
      })
      .signers([collectionKeypair])
      .rpc();

    console.log("Create Collection", sig1);

    const collectionResult = await program.account.collectionAccount.fetch(
      collectionKeypair.publicKey
    );
    logCollection(collectionResult);
  });

  test.only("mints an NFT into a collection", async () => {
    const col_name = strToArr("col1", 32);
    const col_image_url = strToArr("colimg1", 128);
    const col_metadata_url = strToArr("colmeta1", 128);

    const collectionKeypair = Keypair.generate();

    const creator = anchor.AnchorProvider.local().wallet.publicKey;

    const colsig1 = await program.methods
      .createCollection(col_name, col_image_url, col_metadata_url)
      .accounts({
        collectionAccount: collectionKeypair.publicKey,
        creator: creator,
        systemProgram: SystemProgram.programId,
      })
      .signers([collectionKeypair])
      .rpc();
    console.log("Created Collection", colsig1);

    const collectionResult = await program.account.collectionAccount.fetch(
      collectionKeypair.publicKey
    );

    console.log("Collection Address:", collectionKeypair.publicKey.toBase58());
    logCollection(collectionResult);

    const nft_name = strToArr("nft1", 32);
    const nft_image_url = strToArr("url1", 128);
    const nft_metadata_url = strToArr("url2", 128);

    const nftKeypair = Keypair.generate();

    const holder = anchor.AnchorProvider.local().wallet.publicKey;

    const sig1 = await program.methods
      .mintNft(
        nft_name,
        nft_image_url,
        nft_metadata_url,
        true // collection_included
      )
      .accounts({
        nftAccount: nftKeypair.publicKey,
        holder,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts([
        {
          pubkey: collectionKeypair.publicKey, // collection ID
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

type NftAccount = {
  holder: PublicKey;
  delegate: PublicKey | null;
  update_authority: PublicKey | null;
  name: Array<number>;
  imageUrl: Array<number>;
  metadataUrl: Array<number>;
  collection: PublicKey | null;
};

type CollectionAccount = {
  update_authority: PublicKey | null;
  name: Array<number>;
  imageUrl: Array<number>;
  metadataUrl: Array<number>;
};

const arrayToStr = (arr: Array<number>): string => {
  const buffer = Buffer.from(arr);
  const str = buffer.toString("utf-8");
  return str.replace(/\0/g, "");
};

const logNft = (nft: NftAccount) => {
  console.log(
    "NFT:",
    JSON.stringify(
      {
        holder: nft.holder.toString(),
        update_authority: nft.update_authority?.toString() ?? null,
        delegate: nft.delegate?.toString(),
        name: arrayToStr(nft.name),
        imageUrl: arrayToStr(nft.imageUrl),
        metadataUrl: arrayToStr(nft.metadataUrl),
        collection: nft.collection?.toString() ?? null,
      },
      null,
      2
    )
  );
};

const logCollection = (coll: CollectionAccount) => {
  console.log(
    "Collection:",
    JSON.stringify(
      {
        name: arrayToStr(coll.name),
        imageUrl: arrayToStr(coll.imageUrl),
        metadataUrl: arrayToStr(coll.metadataUrl),
        update_authority: coll.update_authority?.toString(),
      },
      null,
      2
    )
  );
};
