import React from "react";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { ImageCard } from "../ImageCard";
import { useMintInfos } from "./mintlist-utils";

export function MintlistNftsGrid({
  mintInfos,
}: {
  mintInfos: NftokenTypes.MintInfo[];
}) {
  const { data: mintInfosHydrated } = useMintInfos(mintInfos);

  if (!mintInfos.length) {
    return <div>No NFTs have been uploaded to this mintlist yet.</div>;
  }

  return (
    <>
      <div className="grid">
        {mintInfosHydrated.map((mintInfo) => (
          <ImageCard
            key={mintInfo.metadata_url}
            image={mintInfo.metadata?.image}
            title={mintInfo.metadata?.name ?? "Unknown"}
            subtitle={
              mintInfo.minted ? (
                <div className="subtitle text-secondary">Minted</div>
              ) : (
                <div className="subtitle text-green">Available</div>
              )
            }
          />
        ))}
      </div>

      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          column-gap: 1rem;
          row-gap: 2rem;
        }
      `}</style>
    </>
  );
}
