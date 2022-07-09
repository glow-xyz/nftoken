import { Network } from "@glow-xyz/glow-client";
import { useGlowContext } from "@glow-xyz/glow-react";
import { Solana } from "@glow-xyz/solana-client";
import { DateTime } from "luxon";
import React from "react";
import useSWR from "swr";
import { NetworkSwitcher } from "../components/atoms/NetworkSwitcher";
import { LuxButton } from "../components/LuxButton";
import { LuxLink } from "../components/LuxLink";
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

  const { data } = useMintlists({ wallet, network });
  const mintlists = data ?? [];

  return (
    <>
      <PageLayout>
        <h1>Mintlists</h1>

        <p>
          Below you can find the overview of all the mintlists you created.
          Click on the mintlist name to go to its details page where you can
          manage it.
        </p>

        <div className="mb-4">
          <NetworkSwitcher />

          <div className="flex-column gap-4 mt-2">
            {mintlists.map((mintlist) => (
              <MintlistRow key={mintlist.address} mintlist={mintlist} />
            ))}
          </div>
        </div>

        <LuxButton
          label="New Mintlist"
          href="/docs/create-a-mintlist"
        />
      </PageLayout>
    </>
  );
}

const MintlistRow = ({ mintlist }: { mintlist: NftokenTypes.MintlistInfo }) => {
  const status = getMintlistStatus(mintlist);
  return (
    <LuxLink className="mintlist-row rounded animated" href={`/mintlist/${mintlist.address}`}>
      <div className={"flex-center gap-3"}>
        <SquareImage src={mintlist.image} size={80} />

        <div>
          <div className="font-weight-medium text-lg">{mintlist.name}</div>

          <div>
            <MintlistStatusPill status={status} />
          </div>

          {status === MintlistStatus.Pending && (
            <div>{mintlist.mint_infos.length} Mint Infos Configured</div>
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

          {status === MintlistStatus.SaleEnded && <div>Congratulations!</div>}
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
  const swrKey = [wallet, network];
  const { data, error } = useSWR(swrKey, async () => {
    if (!wallet) {
      return [];
    }

    return await NftokenFetcher.getAllMintlists({ wallet, network });
  });
  return { data, error };
}
