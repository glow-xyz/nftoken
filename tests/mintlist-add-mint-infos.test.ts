import * as anchor from "@project-serum/anchor";
import { Program, web3, BN } from "@project-serum/anchor";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createMintlist } from "./utils/create-mintlist";
import { generateAlphaNumericString, strToArr } from "./utils/test-utils";

describe("mintlist_add_mint_infos", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  it("should populate mintlist with mintInfo's", async () => {
    const treasuryKeypair = web3.Keypair.generate();
    const goLiveDate = new BN(Math.floor(Date.now() / 1000));
    const price = new BN(web3.LAMPORTS_PER_SOL);
    const numMints = 10000;

    const { mintlistAddress } = await createMintlist({
      treasury: treasuryKeypair.publicKey,
      goLiveDate,
      price,
      numMints,
      program,
    });

    // TODO

    // const name = strToArr("Pesky Animals", 32);
    // const image_url = strToArr(generateAlphaNumericString(16), 64);
    // const metadata_url = strToArr(generateAlphaNumericString(16), 64);
    //
    // await program.methods.mintlistAddMintInfos([{ name }]);
  });
});
