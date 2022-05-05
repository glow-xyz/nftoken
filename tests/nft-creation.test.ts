import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createCollection } from "./utils/create-collection";
import { createNft } from "./utils/create-nft";
import { logNft, strToArr } from "./utils/test-utils";

describe("nftoken", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  test("mints an NFT", async () => {
    await createNft({ program });
  });

  test("creates a collection", async () => {
    await createCollection({ program });
  });

  test("mints an NFT into a collection", async () => {
    const { creator, collection_keypair } = await createCollection({ program });

    const nft_name = strToArr("nft1", 32);
    const nft_image_url = strToArr("url1", 64);
    const nft_metadata_url = strToArr("url2", 64);

    const nftKeypair = Keypair.generate();

    const holder = anchor.AnchorProvider.local().wallet.publicKey;

    const sig1 = await program.methods
      .nftCreate(
        nft_name,
        nft_image_url,
        nft_metadata_url,
        true // collection_included
      )
      .accounts({
        nft: nftKeypair.publicKey,
        holder,
        systemProgram: SystemProgram.programId,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
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
