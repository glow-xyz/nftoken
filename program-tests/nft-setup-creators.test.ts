import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Buffer } from "buffer";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createNft, updateNft } from "./utils/create-nft";
import { DEFAULT_KEYPAIR, program } from "./utils/test-utils";

describe("nft_setup_creators", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

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
    const primaryCreator = DEFAULT_KEYPAIR.publicKey;

    const { nft_pubkey } = await createNft({});

    const [nft_creators_pubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("creators"), nft_pubkey.toBuffer()],
      program.programId
    );

    await program.methods
      .nftSetupCreatorsV1({
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

    const onchain = await fetchNftCreators({
      pubkey: nft_creators_pubkey,
      program,
    });
    expect(onchain.creators[0].address.toBase58()).toEqual(
      creator1.publicKey.toBase58()
    );
    expect(onchain.creators[0].basisPoints).toEqual(creators[0].basisPoints);
    expect(onchain.creators[0].verified).toEqual(creators[0].verified);
    expect(onchain.creators[1].address.toBase58()).toEqual(
      creator2.publicKey.toBase58()
    );
    expect(onchain.creators[1].basisPoints).toEqual(creators[1].basisPoints);
    expect(onchain.creators[1].verified).toEqual(creators[1].verified);
    console.log(onchain);
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
    const primaryCreator = DEFAULT_KEYPAIR.publicKey;

    const { nft_pubkey } = await createNft({});

    const [nft_creators_pubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("creators"), nft_pubkey.toBuffer()],
      program.programId
    );

    await expect(async () => {
      await program.methods
        .nftSetupCreatorsV1({
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
    const primaryCreator = DEFAULT_KEYPAIR.publicKey;

    const { nft_pubkey } = await createNft({});

    const [nft_creators_pubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("creators"), nft_pubkey.toBuffer()],
      program.programId
    );

    await expect(async () => {
      await program.methods
        .nftSetupCreatorsV1({
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

  it("cannot double set creator account", async () => {
    const creator1 = Keypair.generate();

    const creators = [
      {
        address: creator1.publicKey,
        verified: false,
        basisPoints: 10_000,
      },
    ];
    const primaryCreator = DEFAULT_KEYPAIR.publicKey;

    const { nft_pubkey } = await createNft({});

    const [nft_creators_pubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("creators"), nft_pubkey.toBuffer()],
      program.programId
    );

    await program.methods
      .nftSetupCreatorsV1({
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
      ])
      .rpc();

    await expect(async () => {
      await program.methods
        .nftSetupCreatorsV1({
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
        ])
        .rpc();
    }).rejects.toThrow();
  });

  it("cannot set the creator account if you aren't the NFT creator", async () => {
    const creator1 = Keypair.generate();

    const creators = [
      {
        address: creator1.publicKey,
        verified: false,
        basisPoints: 10_000,
      },
    ];

    const { nft_pubkey } = await createNft({});

    const [nft_creators_pubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("creators"), nft_pubkey.toBuffer()],
      program.programId
    );

    await expect(async () => {
      await program.methods
        .nftSetupCreatorsV1({
          royaltyBasisPoints: 500,
          creators,
        })
        .accounts({
          creator: creator1,
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
        ])
        .rpc();
    }).rejects.toThrow();
  });

  it("cannot set the creator account if you the NFT can't be updated", async () => {
    const creator1 = Keypair.generate();

    const creators = [
      {
        address: creator1.publicKey,
        verified: false,
        basisPoints: 10_000,
      },
    ];

    const primaryCreator = DEFAULT_KEYPAIR.publicKey;
    const { nft_pubkey } = await createNft({});

    await updateNft({
      nft_pubkey,
      creator: primaryCreator,
      metadataUrl: `newww! ${Math.random()}`,
      creatorCanUpdate: false,
    });

    const [nft_creators_pubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("creators"), nft_pubkey.toBuffer()],
      program.programId
    );

    await expect(async () => {
      await program.methods
        .nftSetupCreatorsV1({
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
        ])
        .rpc();
    }).rejects.toThrow();
  });

  it("has to use the correct PDA", async () => {
    const creator1 = Keypair.generate();

    const creators = [
      { address: creator1.publicKey, verified: false, basisPoints: 10_000 },
    ];

    const primaryCreator = DEFAULT_KEYPAIR.publicKey;
    const { nft_pubkey } = await createNft({});

    const [nft_creators_pubkey] = PublicKey.findProgramAddressSync(
      [Buffer.from("creators"), nft_pubkey.toBuffer()],
      program.programId
    );

    await expect(async () => {
      await program.methods
        .nftSetupCreatorsV1({
          royaltyBasisPoints: 500,
          creators,
        })
        .accounts({
          creator: primaryCreator,
          nft: Keypair.generate().publicKey,
          systemProgram: SystemProgram.programId,
          nftCreators: nft_creators_pubkey,
        })
        .remainingAccounts([
          {
            pubkey: creator1.publicKey,
            isSigner: false,
            isWritable: false,
          },
        ])
        .rpc();
    }).rejects.toThrow();

    await expect(async () => {
      await program.methods
        .nftSetupCreatorsV1({
          royaltyBasisPoints: 500,
          creators,
        })
        .accounts({
          creator: primaryCreator,
          nft: nft_pubkey,
          systemProgram: SystemProgram.programId,
          nftCreators: Keypair.generate().publicKey,
        })
        .remainingAccounts([
          {
            pubkey: creator1.publicKey,
            isSigner: false,
            isWritable: false,
          },
        ])
        .rpc();
    }).rejects.toThrow();
  });
});

const fetchNftCreators = async ({
  pubkey,
  program,
}: {
  pubkey: PublicKey;
  program: Program<NftokenTypes>;
}): Promise<{
  version: number;
  nft: PublicKey;
  royaltyBasisPoints: number;
  creators: Array<{
    address: PublicKey;
    basisPoints: number;
    verified: boolean;
  }>;
}> => {
  const creatorsAccount = await program.account.nftCreatorsAccount.fetch(
    pubkey
  );
  return creatorsAccount as any;
};
