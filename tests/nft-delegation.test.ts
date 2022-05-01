import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createCollection } from "./utils/create-collection";
import { createNft } from "./utils/create-nft";
import { logNft, strToArr } from "./utils/test-utils";

const NULL_PUBKEY_STRING = "11111111111111111111111111111111";

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
      .delegateNft(true)
      .accounts({
        nftAccount: nft_pubkey,
        signer,
      })
      .remainingAccounts([
        {
          pubkey: delegate_keypair.publicKey,
          isSigner: false,
          isWritable: false,
        },
      ])
      .signers([])
      .rpc();
    console.log("Delegate NFT signature", delegate_sig);

    const delegated = await program.account.nftAccount.fetch(nft_pubkey);
    logNft(delegated);

    expect(delegated.delegate!.toBase58()).toBe(
      delegate_keypair.publicKey.toBase58()
    );

    const undelegate_sig = await program.methods
      .delegateNft(false)
      .accounts({
        nftAccount: nft_pubkey,
        signer,
      })
      .signers([])
      .rpc();
    console.log("Undelegate NFT signature", undelegate_sig);

    const undelegated = await program.account.nftAccount.fetch(nft_pubkey);
    expect(undelegated.delegate.toBase58()).toEqual(NULL_PUBKEY_STRING);
  });
});
