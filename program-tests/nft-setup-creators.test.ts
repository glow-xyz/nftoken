import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Buffer } from "buffer";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createNft } from "./utils/create-nft";

describe("nft_setup_creators", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  it("should create the creators account", async () => {
    const creator1 = Keypair.generate();
    const creator2 = Keypair.generate();

    const creators = [
      {
        address: creator1.publicKey,
        verified: false,
        basisPoints: 6_000,
      },
      {
        address: creator2.publicKey,
        verified: true,
        basisPoints: 4_000,
      },
    ];
    const primaryCreator = anchor.AnchorProvider.local().wallet.publicKey;

    const { nft_pubkey } = await createNft({ program });

    const [nft_creators_pubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("creators"), nft_pubkey.toBuffer()],
      program.programId
    );

    await program.methods
      .nftSetupCreators({
        royaltyBasisPoints: 500,
        creators,
      })
      .accounts({
        creator: primaryCreator,
        nft: nft_pubkey,
        systemProgram: SystemProgram.programId,
        nftCreators: nft_creators_pubkey,
      })
      .remainingAccounts([
        {
          pubkey: creator1.publicKey,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: creator2.publicKey,
          isSigner: true,
          isWritable: false,
        },
      ])
      .signers([creator2])
      .rpc()
      .catch((e) => {
        console.error(e);
        throw e;
      });
  });

  it("does not verify if creator is not signed", async () => {
    const creator1 = Keypair.generate();
    const creator2 = Keypair.generate();

    const creators = [
      {
        address: creator1.publicKey,
        verified: false,
        basisPoints: 6_000,
      },
      {
        address: creator2.publicKey,
        verified: true,
        basisPoints: 4_000,
      },
    ];
    const primaryCreator = anchor.AnchorProvider.local().wallet.publicKey;

    const { nft_pubkey } = await createNft({ program });

    const [nft_creators_pubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("creators"), nft_pubkey.toBuffer()],
      program.programId
    );

    await expect(async () => {
      await program.methods
        .nftSetupCreators({
          royaltyBasisPoints: 500,
          creators,
        })
        .accounts({
          creator: primaryCreator,
          nft: nft_pubkey,
          systemProgram: SystemProgram.programId,
          nftCreators: nft_creators_pubkey,
        })
        .remainingAccounts([
          {
            pubkey: creator1.publicKey,
            // This should throw an error
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: creator2.publicKey,
            isSigner: true,
            isWritable: false,
          },
        ])
        .signers([creator2])
        .rpc();
    }).rejects.toThrow();
  });

  it("basis points must add to 10k", async () => {
    const creator1 = Keypair.generate();
    const creator2 = Keypair.generate();

    const creators = [
      {
        address: creator1.publicKey,
        verified: false,
        basisPoints: 10_000,
      },
      {
        address: creator2.publicKey,
        verified: true,
        basisPoints: 4_000,
      },
    ];
    const primaryCreator = anchor.AnchorProvider.local().wallet.publicKey;

    const { nft_pubkey } = await createNft({ program });

    const [nft_creators_pubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("creators"), nft_pubkey.toBuffer()],
      program.programId
    );

    await expect(async () => {
      await program.methods
        .nftSetupCreators({
          royaltyBasisPoints: 500,
          creators,
        })
        .accounts({
          creator: primaryCreator,
          nft: nft_pubkey,
          systemProgram: SystemProgram.programId,
          nftCreators: nft_creators_pubkey,
        })
        .remainingAccounts([
          {
            pubkey: creator1.publicKey,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: creator2.publicKey,
            isSigner: true,
            isWritable: false,
          },
        ])
        .signers([creator2])
        .rpc();
    }).rejects.toThrow();
  });
});
