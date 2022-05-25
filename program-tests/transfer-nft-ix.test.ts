import * as anchor from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import { createNft } from "./utils/create-nft";
import { DEFAULT_KEYPAIR, program } from "./utils/test-utils";

describe("transfer nft", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  test("creates and transfers an NFT (as creator)", async () => {
    const { nft_pubkey } = await createNft({});

    const recipient = Keypair.generate().publicKey;
    const signer = DEFAULT_KEYPAIR.publicKey;
    const signature = await program.methods
      .nftTransfer()
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
