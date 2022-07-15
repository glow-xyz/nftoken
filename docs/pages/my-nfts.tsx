import { Network } from "@glow-xyz/glow-client";
import { useGlowContext } from "@glow-xyz/glow-react";
import GlowIcon from "@luma-team/lux-icons/glow/GlowCoin.svg";
import { Solana } from "@glow-xyz/solana-client";
import range from "lodash/range";
import React from "react";
import useSWR from "swr";
import { LuxEmptyState } from "../components/atoms/LuxEmptyState";
import { NetworkSwitcher } from "../components/atoms/NetworkSwitcher";
import { LuxLink } from "../components/atoms/LuxLink";
import { useNetworkContext } from "../components/atoms/NetworkContext";
import { Shimmer } from "../components/atoms/Shimmer";
import { SocialHead } from "../components/all-pages/SocialHead";
import { getImageUrl } from "../utils/cdn";
import { NftokenFetcher } from "@glow-xyz/nftoken-js";
import { NftokenTypes } from "../utils/NftokenTypes";
import { ResponsiveBreakpoint } from "../utils/style-constants";

export default function MyNftsPage() {
  const { user } = useGlowContext();
  const wallet = user?.address;

  const { network } = useNetworkContext();

  const { data: nfts } = useNfts({ wallet, network });

  return (
    <div>
      <SocialHead subtitle={"My NFTs"} />

      <h1>My NFTs</h1>

      <div className="flex-center spread mb-3">
        <div className="text-secondary">Find All NFTs in Your Wallet</div>

        <NetworkSwitcher />
      </div>

      {!user && (
        <LuxEmptyState
          icon={<GlowIcon />}
          title={"Welcome"}
          desc={"Sign In with glow at the top right."}
        />
      )}
      {!nfts && <NftLoadingGrid />}
      {nfts && <NftGrid nfts={nfts} />}
      {user && nfts && nfts.length === 0 && (
        <LuxEmptyState
          icon={<GlowIcon />}
          title={"No NFTs... Yet"}
          desc={"You can create an NFT, try it out."}
        />
      )}
    </div>
  );
}

export const NftLoadingGrid = () => {
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

export const NftGrid = ({ nfts }: { nfts: NftokenTypes.NftInfo[] }) => {
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
