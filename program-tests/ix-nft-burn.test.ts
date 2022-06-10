import * as anchor from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import { createNft } from "./utils/create-nft";
import { DEFAULT_KEYPAIR, program } from "./utils/test-utils";

describe("ix_nft_burn", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  test("burns an NFT successfully", async () => {
    const { nft_pubkey } = await createNft({});

    const holder = DEFAULT_KEYPAIR.publicKey;
    await program.methods
      .nftBurnV1()
      .accounts({
        nft: nft_pubkey,
        holder,
      })
      .signers([])
      .rpc();

    await expect(async () => {
      await program.account.nftAccount.fetch(nft_pubkey);
    }).rejects.toThrow();
  });

  test("cannot burn someone else's NFT", async () => {
    const { nft_pubkey } = await createNft({});
    const holder = DEFAULT_KEYPAIR.publicKey;

    const recipient = Keypair.generate().publicKey;
    await program.methods
      .nftTransferV1()
      .accounts({
        nft: nft_pubkey,
        signer: holder,
        recipient,
      })
      .signers([])
      .rpc();

    await expect(async () => {
      await program.methods
        .nftBurnV1()
        .accounts({
          nft: nft_pubkey,
          holder,
        })
        .signers([])
        .rpc();
    }).rejects.toThrow();

    const nftResult = await program.account.nftAccount.fetch(nft_pubkey);
    expect(nftResult.holder.toBase58()).toEqual(recipient.toBase58());
  });
});
