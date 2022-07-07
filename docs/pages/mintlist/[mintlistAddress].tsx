import { Network } from "@glow-app/glow-client";
import {
  GKeypair,
  GPublicKey,
  GTransaction,
  Solana,
  SolanaClient
} from "@glow-app/solana-client";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { LuxButton } from "../../components/LuxButton";
import { LuxSpinner } from "../../components/LuxSpinner";
import {
  getMintlistStatus,
  MintlistAndCollection,
  MintlistStatus
} from "../../components/mintlist/mintlist-utils";
import { MintlistInfoHeader } from "../../components/mintlist/MintlistInfoHeader";
import { MintlistPending } from "../../components/mintlist/MintlistPending";
import { useNetworkContext } from "../../components/NetworkContext";
import { PageLayout } from "../../components/PageLayout";
import { SocialHead } from "../../components/SocialHead";
import { useBoolean } from "../../hooks/useBoolean";
import {
  NFTOKEN_ADDRESS,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_SLOT_HASHES_PUBKEY
} from "../../utils/constants";
import { NFTOKEN_MINTLIST_MINT_NFT_V1 } from "../../utils/nft-borsh";
import { NftokenFetcher } from "../../utils/NftokenFetcher";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { NETWORK_TO_RPC } from "../../utils/rpc-types";

// TODO: add server side rendering
export default function MintlistPage() {
  const { query } = useRouter();
  const mintlistAddress = query.mintlistAddress as Solana.Address;

  const networkContext = useNetworkContext();
  const network = (query.network || networkContext.network) as Network;

  const { data } = useMintlist({ address: mintlistAddress, network });

  if (!data) {
    return (
      <PageLayout>
        <div className="p-5 flex-center-center">
          <LuxSpinner />
        </div>
      </PageLayout>
    );
  }

  const { mintlist, collection } = data;
  const status = getMintlistStatus(mintlist);

  return (
    <PageLayout>
      <SocialHead subtitle={data.mintlist.name} />
      <MintlistInfoHeader mintlist={mintlist} collection={collection} />

      {status === MintlistStatus.Pending && (
        <MintlistPending mintlist={mintlist} collection={collection} />
      )}
      {status === MintlistStatus.PreSale && (
        <div>Presale TODO INSERT A COUNTERHERE</div>
      )}

      {status === MintlistStatus.ForSale && (
        <div>
          <MintlistMintNftButton mintlist={mintlist} />
        </div>
      )}

      {status === MintlistStatus.SaleEnded && <div>Sale Ended TODO</div>}
    </PageLayout>
  );
}

function useMintlist({
                       address,
                       network
                     }: {
  address: Solana.Address;
  network: Network;
}): {
  data?: MintlistAndCollection | null;
  error: any;
} {
  const swrKey = [address, network];
  const { data, error } = useSWR(swrKey, async () => {
    const mintlist = await NftokenFetcher.getMintlist({ address, network });

    if (!mintlist) {
      return null;
    }

    const collection = await NftokenFetcher.getCollection({
      address: mintlist.collection,
      network
    });

    if (!collection) {
      return null;
    }

    return {
      mintlist,
      collection
    };
  });

  return { data, error };
}

function MintlistMintNftButton({
                                 mintlist
                               }: {
  mintlist: NftokenTypes.Mintlist;
}) {
  const { network } = useNetworkContext();
  const minting = useBoolean();

  return (
    <LuxButton
      label="Mint NFT"
      disabled={minting.value}
      onClick={async () => {
        minting.setTrue();

        const { address: wallet } = await window.glow!.connect();

        const recentBlockhash = await SolanaClient.getRecentBlockhash({
          rpcUrl: NETWORK_TO_RPC[network]
        });

        const nftKeypair = GKeypair.generate();

        const tx = GTransaction.create({
          feePayer: wallet,
          recentBlockhash,
          instructions: [
            {
              accounts: [
                // signer
                {
                  address: wallet,
                  signer: true,
                  writable: true
                },
                // nft
                { address: nftKeypair.address, signer: true, writable: true },
                // mintlist
                { address: mintlist.address, writable: true },
                // treasury_sol
                {
                  address: mintlist.treasury_sol,
                  writable: true
                },
                // System Program
                {
                  address: GPublicKey.default.toBase58()
                },
                // Clock Sysvar
                {
                  address: SYSVAR_CLOCK_PUBKEY
                },
                // SlotHashes
                {
                  address: SYSVAR_SLOT_HASHES_PUBKEY
                }
              ],
              program: NFTOKEN_ADDRESS,
              data_base64: NFTOKEN_MINTLIST_MINT_NFT_V1.toBuffer({
                ix: null
              }).toString("base64")
            }
          ],
          signers: [nftKeypair]
        });

        try {
          await window.glow!.signAndSendTransaction({
            transactionBase64: GTransaction.toBuffer({
              gtransaction: tx
            }).toString("base64"),
            network: network
          });
        } catch (err) {
          console.error(err);
        }

        minting.setFalse();
      }}
    />
  );
}
