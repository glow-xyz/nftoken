import { Network } from "@glow-xyz/glow-client";
import { useGlowContext } from "@glow-xyz/glow-react";
import { Solana } from "@glow-xyz/solana-client";
import { PlusIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import { range } from "lodash";
import { DateTime } from "luxon";
import React from "react";
import useSWR from "swr";
import { NetworkSwitcher } from "../components/atoms/NetworkSwitcher";
import { ImageCard } from "../components/ImageCard";
import { LuxButton } from "../components/LuxButton";
import { LuxLink } from "../components/LuxLink";
import {
  getMintlistStatus,
  MintlistStatus,
} from "../components/mintlist/mintlist-utils";
import { MintlistStatusPill } from "../components/mintlist/MintlistStatusPill";
import { useNetworkContext } from "../components/NetworkContext";
import { PageLayout } from "../components/PageLayout";
import { Shimmer } from "../components/Shimmer";
import { SquareImage } from "../components/SquareImage";
import { getImageUrl } from "../utils/cdn";
import { NftokenFetcher } from "../utils/NftokenFetcher";
import { NftokenTypes } from "../utils/NftokenTypes";
import { ResponsiveBreakpoint } from "../utils/style-constants";

export default function MintlistsPage() {
  const { user } = useGlowContext();
  const wallet = user?.address;

  const { network } = useNetworkContext();

  const { data: nfts } = useNfts({ wallet, network });

  return (
    <PageLayout secondaryNav={"mintlists"}>
      <h1>My NFTs</h1>

      <div className="flex-center spread">
        <div className={"mb-2 text-secondary"}>
          Find All NFTs in Your Wallet
        </div>

        <NetworkSwitcher />
      </div>

      {!nfts && <NftLoadingGrid />}
      {nfts && <NftGrid nfts={nfts} />}
      {nfts && nfts.length === 0 && <div>You don't have any NFTs.</div>}
    </PageLayout>
  );
}

const NftLoadingGrid = () => {
  return (
    <div className={"nft-grid"}>
      {range(12).map((idx) => (
        <div key={idx}>
          <Shimmer
            height={0}
            width={"100%"}
            style={{ paddingBottom: "100%" }}
          />
        </div>
      ))}

      <style jsx>{`
        .nft-grid {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: 1fr 1fr 1fr;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          .nft-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }

        @media (max-width: ${ResponsiveBreakpoint.small}) {
          .nft-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

const NftGrid = ({ nfts }: { nfts: NftokenTypes.NftInfo[] }) => {
  return (
    <div className={"nft-grid"}>
      {nfts.map((nft) => (
        <NftCell key={nft.address} nft={nft} />
      ))}

      <style jsx>{`
        .nft-grid {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: 1fr 1fr 1fr;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          .nft-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }

        @media (max-width: ${ResponsiveBreakpoint.small}) {
          .nft-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

const NftCell = ({ nft }: { nft: NftokenTypes.NftInfo }) => {
  const { network } = useNetworkContext();
  return (
    <LuxLink
      key={nft.address}
      className={"nft-cell rounded"}
      href={`/nft/${nft.address}`}
      query={{ network }}
    >
      {nft.image ? (
        <img
          className={"nft-image rounded"}
          src={getImageUrl({ url: nft.image, width: 400, height: 400 })}
          alt={nft.name ?? undefined}
        />
      ) : (
        <div
          className="bg-secondary rounded"
          style={{ paddingBottom: "100%", width: "100%" }}
        />
      )}

      <div className={"font-weight-medium mt-1"}>{nft.name ?? "Unknown"}</div>

      <style jsx>{`
        :global(a.nft-cell) {
          color: inherit;
          display: grid;
          grid-template-rows: max-content 1fr;
          margin: -0.5rem;
          padding: 0.5rem;
        }

        :global(a.nft-cell:hover) {
          background-color: var(--hover-bg-color);
        }

        .nft-image {
          max-width: 100%;
        }
      `}</style>
    </LuxLink>
  );
};

function useNfts({
  wallet,
  network,
}: {
  wallet: Solana.Address | undefined;
  network: Network;
}): {
  data: NftokenTypes.NftInfo[] | undefined;
  error: any;
} {
  const swrKey = [wallet, network, "nfts"];
  const { data, error } = useSWR(swrKey, async () => {
    if (!wallet) {
      return [];
    }

    return await NftokenFetcher.getNftsForWallet({ wallet, network });
  });
  return { data, error };
}
