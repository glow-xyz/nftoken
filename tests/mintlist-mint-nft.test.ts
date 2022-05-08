import * as anchor from "@project-serum/anchor";
import { BN, Program, web3 } from "@project-serum/anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createMintInfoArg } from "./mintlist-add-mint-infos.test";
import { createMintlist, getMintlistData } from "./utils/mintlist";

describe("mintlist_mint_nft", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  it("should mint a single NFT", async () => {
    const treasuryKeypair = web3.Keypair.generate();
    const goLiveDate = new BN(0);
    const price = new BN(web3.LAMPORTS_PER_SOL);
    const numTotalNfts = 1;

    const { mintlistAddress } = await createMintlist({
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

    const mintlistData = await getMintlistData(program, mintlistAddress);
    console.log(mintlistData);

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
      })
      .signers([nftKeypair])
      .rpc()
      .catch((e) => {
        console.error(e.logs);
        throw e;
      });

    console.log("Mintlist Mint NFT sig:", sig);

    const mintlistDataAfter = await getMintlistData(program, mintlistAddress);
    console.log(mintlistDataAfter);
  });
});
