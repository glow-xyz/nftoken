import { Address, Network } from "@glow-xyz/glow-client";
import {
  GKeypair,
  GPublicKey,
  GTransaction,
  Solana,
  SolanaClient,
} from "@glow-xyz/solana-client";
import { DateTime } from "luxon";
import { getMintlistAccountSize } from "./mintlist";
import {
  NFTOKEN_MINTLIST_CLOSE_IX,
  NFTOKEN_MINTLIST_CREATE_IX,
  NFTOKEN_MINTLIST_MINT_NFT_V1,
  NFTOKEN_NFT_CREATE_IX,
  SYSTEM_CREATE_ACCOUNT_IX,
} from "./nftoken-formats";
import { NftokenTypes } from "./nftoken-types";

export const NFTOKEN_ADDRESS: Solana.Address =
  "nftokf9qcHSYkVSP3P2gUMmV6d4AwjMueXgUu43HyLL";

export const NETWORK_TO_RPC: Record<Network, string> = {
  [Network.Mainnet]: "https://api.mainnet-beta.solana.com",
  [Network.Devnet]: "https://api.devnet.solana.com",
  [Network.Localnet]: "http://localhost:9900",
};

export const constructCreateNftTx = async ({
  metadata_url,
  creator,
  holder,
  network,
}: {
  metadata_url: string;
  creator: Solana.Address;
  holder?: Solana.Address | null;
  network: Network;
}): Promise<{
  gtransaction: GTransaction.GTransaction;
  transactionBase64: string;
}> => {
  const nft_keypair = GKeypair.generate();
  const recentBlockhash = await SolanaClient.getRecentBlockhash({
    rpcUrl: NETWORK_TO_RPC[network],
  });

  const transaction = GTransaction.create({
    feePayer: creator,
    recentBlockhash,
    instructions: [
      {
        accounts: [
          { address: creator, signer: true, writable: true },
          { address: holder || creator, signer: false },
          { address: nft_keypair.address, signer: true, writable: true },
          { address: GPublicKey.nullString },
        ],
        program: NFTOKEN_ADDRESS,
        data_base64: NFTOKEN_NFT_CREATE_IX.toBuffer({
          ix: null,
          metadata_url,
          collection_included: false,
        }).toString("base64"),
      },
    ],
    signers: [nft_keypair],
  });

  return {
    gtransaction: transaction,
    transactionBase64: GTransaction.toBuffer({
      gtransaction: transaction,
    }).toString("base64"),
  };
};

export const constructCreateMintlistTx = async ({
  wallet,
  network,
  goLiveDate,
  priceSol,
  numNftsTotal,
  mintlistMetadataUrl,
  collectionMetadataUrl,
}: {
  wallet: string;
  network: Network;
  goLiveDate: DateTime;
  priceSol: number;
  numNftsTotal: number;
  mintlistMetadataUrl: string;
  collectionMetadataUrl: string;
}): Promise<{
  mintlist_address: Address;
  gtransaction: GTransaction.GTransaction;
  transactionBase64: string;
}> => {
  const mintlistKeypair = GKeypair.generate();
  const collectionKeypair = GKeypair.generate();

  const mintlistAccountSize = getMintlistAccountSize(numNftsTotal);

  const rpcUrl = NETWORK_TO_RPC[network];

  const { lamports: mintlistAccountLamports } =
    await SolanaClient.getMinimumBalanceForRentExemption({
      dataLength: mintlistAccountSize.toNumber(),
      rpcUrl,
    });

  const recentBlockhash = await SolanaClient.getRecentBlockhash({
    rpcUrl,
  });

  const tx = GTransaction.create({
    feePayer: wallet,
    recentBlockhash,
    instructions: [
      // Due to the 10kb limit on the size of accounts that can be initialized via CPI,
      // the `mintlist` account must be initialized through a separate SystemProgram.createAccount instruction.
      {
        accounts: [
          { address: wallet, signer: true, writable: true },
          { address: mintlistKeypair.address, signer: true, writable: true },
        ],
        // SystemProgram
        program: GPublicKey.default.toBase58(),
        data_base64: SYSTEM_CREATE_ACCOUNT_IX.toBuffer({
          ix_discriminator: null,
          amount: { lamports: mintlistAccountLamports },
          space: mintlistAccountSize,
          program_owner: NFTOKEN_ADDRESS,
        }).toString("base64"),
      },
      // mintlist_create
      {
        accounts: [
          // Authority
          { address: wallet, signer: true, writable: true },
          // Mintlist
          { address: mintlistKeypair.address, signer: true, writable: true },
          // Collection
          { address: collectionKeypair.address, signer: true, writable: true },
          // Treasury
          { address: wallet },
          // System Program
          { address: GPublicKey.nullString },
          // Clock
          { address: SYSVAR_CLOCK_PUBKEY },
        ],
        program: NFTOKEN_ADDRESS,
        data_base64: NFTOKEN_MINTLIST_CREATE_IX.toBuffer({
          ix: null,
          go_live_date: goLiveDate,
          price: {
            lamports: String(priceSol * LAMPORTS_PER_SOL),
          },
          minting_order: "sequential",
          num_nfts_total: numNftsTotal,
          metadata_url: mintlistMetadataUrl,
          collection_metadata_url: collectionMetadataUrl,
        }).toString("base64"),
      },
    ],
    signers: [mintlistKeypair, collectionKeypair],
  });

  return {
    gtransaction: tx,
    transactionBase64: GTransaction.toBuffer({ gtransaction: tx }).toString(
      "base64"
    ),
    mintlist_address: mintlistKeypair.address,
  };
};

export const constructCloseMintlistTx = async ({
  wallet,
  network,
  mintlist,
}: {
  wallet: Address;
  network: Network;
  mintlist: Address;
}): Promise<{
  gtransaction: GTransaction.GTransaction;
  transactionBase64: string;
}> => {
  const rpcUrl = NETWORK_TO_RPC[network];

  const recentBlockhash = await SolanaClient.getRecentBlockhash({
    rpcUrl,
  });

  const tx = GTransaction.create({
    feePayer: wallet,
    recentBlockhash,
    instructions: [
      // Due to the 10kb limit on the size of accounts that can be initialized via CPI,
      // the `mintlist` account must be initialized through a separate SystemProgram.createAccount instruction.
      {
        accounts: [
          { address: mintlist, writable: true },
          { address: wallet, signer: true, writable: true },
        ],
        // SystemProgram
        program: GPublicKey.default.toBase58(),
        data_base64: NFTOKEN_MINTLIST_CLOSE_IX.toBuffer({
          ix: null,
        }).toString("base64"),
      },
    ],
    signers: [],
  });

  return {
    gtransaction: tx,
    transactionBase64: GTransaction.toBuffer({ gtransaction: tx }).toString(
      "base64"
    ),
  };
};

export const constructMintNftTx = async ({
  wallet,
  network,
  mintlist,
}: {
  wallet: Address;
  network: Network;
  mintlist: NftokenTypes.Mintlist;
}) => {
  const recentBlockhash = await SolanaClient.getRecentBlockhash({
    rpcUrl: NETWORK_TO_RPC[network],
  });

  const nftKeypair = GKeypair.generate();

  const gtransaction = GTransaction.create({
    feePayer: wallet,
    recentBlockhash,
    instructions: [
      {
        accounts: [
          { address: wallet, signer: true, writable: true },
          { address: nftKeypair.address, signer: true, writable: true },
          { address: mintlist.address, writable: true },
          { address: mintlist.treasury_sol, writable: true },
          { address: GPublicKey.default.toBase58() }, // System Program
          { address: SYSVAR_CLOCK_PUBKEY },
          { address: SYSVAR_SLOT_HASHES_PUBKEY },
        ],
        program: NFTOKEN_ADDRESS,
        data_base64: NFTOKEN_MINTLIST_MINT_NFT_V1.toBuffer({
          ix: null,
        }).toString("base64"),
      },
    ],
    signers: [nftKeypair],
  });

  return {
    gtransaction,
    transactionBase64: GTransaction.toBuffer({ gtransaction }).toString(
      "base64"
    ),
  };
};

const LAMPORTS_PER_SOL = 1_000_000_000;
const SYSVAR_CLOCK_PUBKEY = "SysvarC1ock11111111111111111111111111111111";
const SYSVAR_SLOT_HASHES_PUBKEY = "SysvarS1otHashes111111111111111111111111111";
