import { Network } from "@glow-app/glow-client";
import { Solana } from "@glow-app/solana-client";
import classNames from "classnames";
import React from "react";
import { useCollectionNfts } from "../../hooks/useCollectionNfts";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { LuxLink } from "../LuxLink";
import { NftCard } from "../NftCard";
import { useMintInfosMetadata } from "./mintlist-utils";

export function MintlistNftsGrid({
  mintInfos,
  collection,
  network,
}: {
  mintInfos: NftokenTypes.MintInfo[];
  collection: Solana.Address;
  network: Network;
}) {
  const { data: metadataMap } = useMintInfosMetadata(mintInfos);

  const { data: mintedNfts } = useCollectionNfts({
    collectionAddress: collection,
    network,
  });

  const nftsData: Map<string, NftokenTypes.NftInfo> = (mintedNfts ?? []).reduce(
    (result, nft) => {
      result.set(nft.metadata_url, nft);

      return result;
    },
    new Map()
  );

  if (!mintInfos.length) {
    return <div>No NFTs have been uploaded to this mintlist yet.</div>;
  }

  const mintInfosWithMetadata = mintInfos
    .filter(({ metadata_url }) => metadataMap.get(metadata_url))
    .map((mintInfo) => ({
      ...mintInfo,
      metadata: metadataMap.get(mintInfo.metadata_url)!,
    }));

  return (
    <>
      <div className="grid">
        {mintInfosWithMetadata.map((mintInfo) => {
          const nft = nftsData.get(mintInfo.metadata_url);

          return nft ? (
            <LuxLink
              href={`/nft/${nft.address}`}
              query={network !== Network.Mainnet ? { network } : undefined}
              key={mintInfo.metadata_url}
            >
              <NftCard
                image={mintInfo.metadata.image}
                title={mintInfo.metadata.name}
                subtitle={
                  <div className={classNames(["subtitle", "status-minted"])}>
                    Minted
                  </div>
                }
              />
            </LuxLink>
          ) : (
            <NftCard
              key={mintInfo.metadata_url}
              image={mintInfo.metadata.image}
              title={mintInfo.metadata.name}
              subtitle={
                <div className={classNames(["subtitle", "status-available"])}>
                  Available
                </div>
              }
            />
          );
        })}
      </div>

      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          column-gap: 1rem;
          row-gap: 2rem;
        }

        .subtitle {
          font-size: 0.8rem;
        }

        .status-available {
          color: var(--success-color);
        }

        .status-minted {
          color: var(--secondary-color);
        }
      `}</style>
    </>
  );
}
