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
    <div
      className="flex flex-wrap gap-3"
      style={{ justifyContent: "space-between" }}
    >
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
    </div>
  );
}
