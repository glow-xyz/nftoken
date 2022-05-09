import * as anchor from "@project-serum/anchor";
import { BN, Program, web3 } from "@project-serum/anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";
import _ from "lodash";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createMintInfoArg } from "./mintlist-add-mint-infos.test";
import {
  createEmptyMintlist,
  createMintlistWithInfos,
  getMintlistData,
} from "./utils/mintlist";

describe("mintlist_mint_nft", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  it("should mint a single NFT", async () => {
    const treasuryKeypair = web3.Keypair.generate();
    const goLiveDate = new BN(0);
    const price = new BN(web3.LAMPORTS_PER_SOL);
    const numTotalNfts = 1;

    const { mintlistAddress } = await createEmptyMintlist({
      treasury: treasuryKeypair.publicKey,
      goLiveDate,
      price,
      numTotalNfts,
      program,
    });

    const mintInfos = [createMintInfoArg(0)];

    await program.methods
      .mintlistAddMintInfos(mintInfos)
      .accounts({
        mintlist: mintlistAddress,
        creator: provider.wallet.publicKey,
      })
      .rpc();

    const nftKeypair = Keypair.generate();
    const signer = anchor.AnchorProvider.local().wallet.publicKey;

    // Mint an NFT!
    const sig = await program.methods
      .mintlistMintNft()
      .accounts({
        mintlist: mintlistAddress,
        nft: nftKeypair.publicKey,
        signer,
        systemProgram: SystemProgram.programId,
        treasurySol: treasuryKeypair.publicKey,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        slothashes: anchor.web3.SYSVAR_SLOT_HASHES_PUBKEY,
      })
      .signers([nftKeypair])
      .rpc()
      .catch((e) => {
        console.error(e.logs);
        throw e;
      });

    console.log("Mintlist Mint NFT sig:", sig);

    await getMintlistData({
      program: program,
      mintlistPubkey: mintlistAddress,
    });

    // TODO: expect stuff has changed
  });

  it("should mint a random NFT", async () => {
    const treasuryKeypair = web3.Keypair.generate();
    const goLiveDate = new BN(0);
    const price = new BN(web3.LAMPORTS_PER_SOL);

    const { mintlistPubkey, mintlistData: initialMintlistData } =
      await createMintlistWithInfos({
        treasury: treasuryKeypair.publicKey,
        goLiveDate,
        price,
        program,
        mintingOrder: "random",
      });

    const signer = anchor.AnchorProvider.local().wallet.publicKey;

    for (const _idx of _.range(initialMintlistData.numTotalNfts)) {
      const nftKeypair = Keypair.generate();

      // Mint an NFT!
      const sig = await program.methods
        .mintlistMintNft()
        .accounts({
          mintlist: mintlistPubkey,
          nft: nftKeypair.publicKey,
          signer,
          systemProgram: SystemProgram.programId,
          treasurySol: treasuryKeypair.publicKey,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          slothashes: anchor.web3.SYSVAR_SLOT_HASHES_PUBKEY,
        })
        .signers([nftKeypair])
        .rpc()
        .catch((e) => {
          console.error(e.logs);
          throw e;
        });

      console.log(
        (await getMintlistData({ program, mintlistPubkey })).mintInfos
      );
    }

    // TODO: how do we test if this is _random_
    //       test that the first 10 NFTs out of 10k are not the first 10 sequentially
    //       this has odds of 1/(10k^10) so it won't make tests flaky
    const mintlistDataAfter = await getMintlistData({
      program: program,
      mintlistPubkey: mintlistPubkey,
    });
    console.log(
      "After Random Mints",
      JSON.stringify(mintlistDataAfter.mintInfos, null, 2)
    );

    // TODO: expect that the right stuff has changed
  });
});
