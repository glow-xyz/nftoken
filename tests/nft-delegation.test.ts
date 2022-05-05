import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createNft } from "./utils/create-nft";
import { logNft, NULL_PUBKEY_STRING } from "./utils/test-utils";

describe("delegate", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  test("delegates and undelegates an NFT", async () => {
    const { nft_pubkey } = await createNft({ program });

    const delegate_keypair = Keypair.generate();
    const signer = anchor.AnchorProvider.local().wallet.publicKey;

    const delegate_sig = await program.methods
      .nftSetDelegate()
      .accounts({
        nft: nft_pubkey,
        holder: signer,
        delegate: delegate_keypair.publicKey
      })
      .signers([])
      .rpc();
    console.log("Delegate NFT signature", delegate_sig);

    const delegated = await program.account.nftAccount.fetch(nft_pubkey);
    logNft(delegated);

    expect(delegated.delegate!.toBase58()).toBe(
      delegate_keypair.publicKey.toBase58()
    );

    const undelegate_sig = await program.methods
      .nftUnsetDelegate()
      .accounts({
        nft: nft_pubkey,
        signer,
      })
      .signers([])
      .rpc();
    console.log("Undelegate NFT signature", undelegate_sig);

    const undelegated = await program.account.nftAccount.fetch(nft_pubkey);
    expect(undelegated.delegate.toBase58()).toEqual(NULL_PUBKEY_STRING);
  });
});
