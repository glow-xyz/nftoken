import React from "react";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { ImageCard } from "../atoms/ImageCard";
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
    <div className="grid-container">
      {mintInfosHydrated.map((mintInfo) => (
        <ImageCard
          key={mintInfo.metadata_url}
          size={200}
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

      <style jsx>{`
        .grid-container {
          display: grid;
          /* Creates as many columns as possible that are at least 10rem wide. */
          grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
          grid-gap: 1rem;
        }
      `}</style>
    </div>
  );
}
