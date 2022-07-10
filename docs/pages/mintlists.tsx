import { Network } from "@glow-xyz/glow-client";
import { useGlowContext } from "@glow-xyz/glow-react";
import { Solana } from "@glow-xyz/solana-client";
import { DateTime } from "luxon";
import React from "react";
import useSWR from "swr";
import { NetworkSwitcher } from "../components/atoms/NetworkSwitcher";
import { LuxLink } from "../components/LuxLink";
import { LuxSpinner } from "../components/LuxSpinner";
import {
  getMintlistStatus,
  MintlistStatus,
} from "../components/mintlist/mintlist-utils";
import { MintlistStatusPill } from "../components/mintlist/MintlistStatusPill";
import { useNetworkContext } from "../components/NetworkContext";
import { PageLayout } from "../components/PageLayout";
import { SquareImage } from "../components/SquareImage";
import { NftokenFetcher } from "../utils/NftokenFetcher";
import { NftokenTypes } from "../utils/NftokenTypes";

export default function MintlistsPage() {
  const { user } = useGlowContext();
  const wallet = user?.address;

  const { network } = useNetworkContext();

  const { data: mintlists } = useMintlists({ wallet, network });

  return (
    <PageLayout secondaryNav={"mintlists"}>
      <h1>My Mintlists</h1>

      <div className={"mb-3 flex-center spread"}>
        <div className="text-secondary">See mintlists you've created.</div>

        <NetworkSwitcher />
      </div>

      {!mintlists && (
        <div className="p-5 flex-center-center">
          <LuxSpinner />
        </div>
      )}

      {mintlists && mintlists.length > 0 && (
        <div className="flex-column gap-4 mt-2 mb-4">
          {mintlists.map((mintlist) => (
            <MintlistRow key={mintlist.address} mintlist={mintlist} />
          ))}
        </div>
      )}

      {mintlists && mintlists.length === 0 && (
        <div className={"py-3"}>No mintlists found.</div>
      )}
    </PageLayout>
  );
}

const MintlistRow = ({ mintlist }: { mintlist: NftokenTypes.MintlistInfo }) => {
  const status = getMintlistStatus(mintlist);
  return (
    <LuxLink
      className="mintlist-row rounded animated"
      href={`/mintlist/${mintlist.address}`}
    >
      <div className={"flex-center gap-3"}>
        <div style={{ width: 80 }}>
          <SquareImage src={mintlist.image} size={80} />
        </div>

        <div>
          <div className="font-weight-medium text-lg">{mintlist.name}</div>

          <div className={"flex-center gap-2"}>
            <MintlistStatusPill status={status} />

            <div className="text-secondary">
              {status === MintlistStatus.Pending && (
                <div>{mintlist.mint_infos.length} Mint Infos</div>
              )}

              {status === MintlistStatus.PreSale && (
                <div>
                  Sale Starts{" "}
                  {DateTime.fromISO(mintlist.go_live_date).toLocaleString({
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              )}

              {status === MintlistStatus.ForSale && (
                <div>{mintlist.num_nfts_redeemed} Mints</div>
              )}

              {status === MintlistStatus.SaleEnded && (
                <div>Congratulations!</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        a.mintlist-row {
          color: inherit;
        }

        .mintlist-row {
          padding: 0.5rem;
          margin: -0.5rem;
        }

        .mintlist-row:hover {
          background-color: var(--hover-bg-color);
        }
      `}</style>
    </LuxLink>
  );
};

function useMintlists({
  wallet,
  network,
}: {
  wallet: Solana.Address | undefined;
  network: Network;
}): {
  data: NftokenTypes.MintlistInfo[] | undefined;
  error: any;
} {
  const swrKey = [wallet, network, "mintlists"];
  const { data, error } = useSWR(swrKey, async () => {
    if (!wallet) {
      return [];
    }

    return await NftokenFetcher.getAllMintlists({ wallet, network });
  });

  return { data, error };
}
