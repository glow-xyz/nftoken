import { Address, Network } from "@glow-xyz/glow-client";
import {
  GKeypair,
  GPublicKey,
  GTransaction,
  SolanaClient,
} from "@glow-xyz/solana-client";
import React from "react";
import { useBoolean } from "../../hooks/useBoolean";
import {
  LAMPORTS_PER_SOL,
  NFTOKEN_ADDRESS,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_SLOT_HASHES_PUBKEY,
} from "../../utils/constants";
import { NFTOKEN_MINTLIST_MINT_NFT_V1 } from "@glow-xyz/nftoken-js";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { NETWORK_TO_RPC } from "../../utils/rpc-types";
import { LuxButton } from "../LuxButton";
import { useNetworkContext } from "../NetworkContext";

export const MintlistForSale = ({
  mintlist,
}: {
  mintlist: NftokenTypes.Mintlist;
}) => {
  const { network } = useNetworkContext();
  const minting = useBoolean();
  const feeString =
    parseInt(mintlist.price.lamports) / LAMPORTS_PER_SOL + " SOL";

  return (
    <div className="mt-5">
      <div className="text-xl flex-column flex-center-center gap-3 mb-3 font-weight-medium">
        <div>This Mintlist is now For Sale.</div>

        <div>You can mint an NFT for {feeString}</div>
      </div>

      <div className="flex-center-center">
        <LuxButton
          label="Mint NFT"
          disabled={minting.value}
          onClick={async () => {
            minting.setTrue();

            const { address: wallet } = await window.glow!.connect();
            const tx = await createMintNftTx({ wallet, network, mintlist });

            try {
              await window.glow!.signAndSendTransaction({
                transactionBase64: GTransaction.toBuffer({
                  gtransaction: tx,
                }).toString("base64"),
                network: network,
              });
            } catch (err) {
              console.error(err);
            }

            minting.setFalse();
          }}
        />
      </div>
    </div>
  );
};

const createMintNftTx = async ({
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

  const tx = GTransaction.create({
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
  return tx;
};
