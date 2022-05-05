import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createCollection } from "./utils/create-collection";
import { createNft } from "./utils/create-nft";
import { logNft, strToArr } from "./utils/test-utils";

describe("transfer nft", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  test("creates and transfers an NFT (as creator)", async () => {
    const { nft_pubkey } = await createNft({ program });

    const recipient = Keypair.generate().publicKey;
    const signer = anchor.AnchorProvider.local().wallet.publicKey;
    const signature = await program.methods
      .transferNft()
      .accounts({
        nft: nft_pubkey,
        signer,
        recipient,
      })
      .signers([])
      .rpc();

    console.log("Transferred NFT", signature);

    const nftResult = await program.account.nftAccount.fetch(nft_pubkey);
    expect(nftResult.holder.toBase58()).toEqual(recipient.toBase58());
  });
});
