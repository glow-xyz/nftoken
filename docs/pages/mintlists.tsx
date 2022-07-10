import { Network } from "@glow-xyz/glow-client";
import { useGlowContext } from "@glow-xyz/glow-react";
import { Solana } from "@glow-xyz/solana-client";
import { PlusIcon } from "@heroicons/react/solid";
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

        <div className={"mb-2"}>
          Below you can find the overview of all the mintlists you created.
          Click on the mintlist name to go to its details page where you can
          manage it.
        </div>

        <div className="mb-4">
          <NetworkSwitcher />

          {mintlists.length > 0 && (
            <>
              <div className="flex-column gap-4 mt-2">
                {mintlists.map((mintlist) => (
                  <MintlistRow key={mintlist.address} mintlist={mintlist} />
                ))}
              </div>

              <LuxButton
                size={"small"}
                icon={<PlusIcon />}
                label="Create New Mintlist"
                href="/docs/create-a-mintlist"
              />
            </>
          )}

          {mintlists.length === 0 && (
            <div>
              <div className="mt-3 mb-2">Create your first Mintlist here:</div>

              <LuxButton
                size={"small"}
                icon={<PlusIcon />}
                label="Create New Mintlist"
                href="/docs/create-a-mintlist"
              />
            </div>
          )}
        </div>
      </PageLayout>
    </>
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
