import { AnchorProvider, Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Buffer } from "buffer";
import { TokenVote as TokenVoteTypes } from "../target/types/token_vote";
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { TokenInstructions } from "@project-serum/serum";

const strToBuffer = (str: string, length: number): Buffer => {
  const buff = Buffer.alloc(length);
  buff.write(str, 0);
  return buff;
};

describe("nftoken", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenVote as Program<TokenVoteTypes>;

  test("creates a new poll", async () => {
    // #region ctor
    // Initialize the program's state struct.
    const question = strToBuffer(
      `wen retreat? ${Math.random().toFixed(5)}`,
      32
    );
    const option1 = strToBuffer("A", 16);
    const option2 = strToBuffer("B", 16);

    const [pollConfigPubkey, pollConfigBump] =
      await PublicKey.findProgramAddress([question], program.programId);

    const controller = anchor.AnchorProvider.local().wallet.publicKey;

    const mint = await createMint(provider);
    const token = await createTokenAccount({
      provider: provider,
      mint: mint,
      owner: controller,
    });
    await mintTo({ provider: provider, mint: mint, token: token, amount: 1 });
    // TODO: mint to the token account

    const sig1 = await program.methods
      .createPoll(Array.from(question), [
        Array.from(option1),
        Array.from(option2),
      ])
      .accounts({
        pollConfig: pollConfigPubkey,
        controller,
        mint,
        token,
        systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc();

    console.log("Create Poll", sig1);
    // #endregion ctor

    // Fetch the state struct from the network.
    // #region accessor
    const configResult = await program.account.pollConfig.fetch(
      pollConfigPubkey
    );
    console.log("config", configResult);

    const [voteAccountPubkey] = await PublicKey.findProgramAddress(
      [pollConfigPubkey.toBuffer(), token.toBuffer()],
      program.programId
    );

    const voteSig1 = await program.methods
      .voteOnPoll(0)
      .accounts({
        voteAccount: voteAccountPubkey,
        pollConfig: pollConfigPubkey,
        voter: controller,
        token,
        systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc();
    console.log("Vote 1", voteSig1);
  });
});

async function createMint(provider: AnchorProvider, authority?: PublicKey) {
  if (authority === undefined) {
    authority = provider.wallet.publicKey;
  }
  const mint = anchor.web3.Keypair.generate();
  const instructions = await createMintInstructions(
    provider,
    authority,
    mint.publicKey
  );

  const tx = new anchor.web3.Transaction();
  tx.add(...instructions);

  await provider.sendAndConfirm(tx, [mint]);

  return mint.publicKey;
}

async function createMintInstructions(
  provider: AnchorProvider,
  authority: PublicKey,
  mint: PublicKey
) {
  return [
    anchor.web3.SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: mint,
      space: 82,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(82),
      programId: TOKEN_PROGRAM_ID,
    }),
    TokenInstructions.initializeMint({
      mint,
      decimals: 0,
      mintAuthority: authority,
    }),
  ];
}

async function createTokenAccount({
  provider,
  mint,
  owner,
}: {
  provider: AnchorProvider;
  mint: PublicKey;
  owner: PublicKey;
}) {
  const vault = anchor.web3.Keypair.generate();
  const tx = new anchor.web3.Transaction();
  tx.add(
    ...(await createTokenAccountInstrs(provider, vault.publicKey, mint, owner))
  );
  await provider.sendAndConfirm(tx, [vault]);
  return vault.publicKey;
}

async function createTokenAccountInstrs(
  provider: AnchorProvider,
  newAccountPubkey: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  lamports?: number
) {
  if (lamports === undefined) {
    lamports = await provider.connection.getMinimumBalanceForRentExemption(165);
  }
  return [
    anchor.web3.SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey,
      space: 165,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    TokenInstructions.initializeAccount({
      account: newAccountPubkey,
      mint,
      owner,
    }),
  ];
}

async function mintTo({
  provider,
  mint,
  token,
  amount,
}: {
  provider: AnchorProvider;
  mint: PublicKey;
  token: PublicKey;
  amount: number;
}) {
  const tx = new anchor.web3.Transaction();
  tx.add(
    ...(await createMintToIxs(provider.wallet.publicKey, mint, token, amount))
  );
  await provider.sendAndConfirm(tx, []);
}

async function createMintToIxs(
  mintAuthority: PublicKey,
  mint: PublicKey,
  token: PublicKey,
  amount: number
) {
  return [
    TokenInstructions.mintTo({
      mint,
      destination: token,
      amount,
      mintAuthority,
    }),
  ];
}
