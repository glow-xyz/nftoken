import * as anchor from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import { createNftV2, updateNft } from "./utils/create-nft";
import { DEFAULT_KEYPAIR, program } from "./utils/test-utils";

describe("transfer nft", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  test("creates and transfers an NFT (as creator)", async () => {
    const { nft_pubkey } = await createNftV2({});

    const recipient = Keypair.generate().publicKey;
    const signer = DEFAULT_KEYPAIR.publicKey;
    await program.methods
      .nftTransferV1()
      .accounts({
        nft: nft_pubkey,
        signer,
        recipient,
      })
      .signers([])
      .rpc();

    const nftResult = await program.account.nftAccount.fetch(nft_pubkey);
    expect(nftResult.holder.toBase58()).toEqual(recipient.toBase58());

    // Once you don't have access, you can't transfer it back to yourself
    await expect(async () => {
      await program.methods
        .nftTransferV1()
        .accounts({
          nft: nft_pubkey,
          signer,
          recipient: signer,
        })
        .signers([])
        .rpc();
    }).rejects.toThrow();
  });

  test("cannot transfer frozen NFT", async () => {
    const { nft_pubkey } = await createNftV2({});
    const signer = DEFAULT_KEYPAIR.publicKey;

    // Freeze the NFT
    await updateNft({
      nft_pubkey,
      isFrozen: true,
      authority: signer,
      authorityCanUpdate: true,
      metadataUrl: "hi",
    });

    const recipient = Keypair.generate().publicKey;

    // If you try to transfer when frozen, it'll break.
    await expect(async () => {
      await program.methods
        .nftTransferV1()
        .accounts({
          nft: nft_pubkey,
          signer,
          recipient,
        })
        .signers([])
        .rpc();
    }).rejects.toThrow();

    const nftResult = await program.account.nftAccount.fetch(nft_pubkey);
    expect(nftResult.holder.toBase58()).toEqual(signer.toBase58());
  });
});
