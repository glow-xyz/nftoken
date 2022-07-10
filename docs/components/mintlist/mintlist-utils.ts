import { DateTime } from "luxon";
import useSWR from "swr";
import { NftokenFetcher } from "@glow-xyz/nftoken-js";
import { NftokenTypes } from "../../utils/NftokenTypes";

export const MINT_INFOS_PER_TX = 1;

export enum MintlistStatus {
  Pending = "pending",
  PreSale = "pre-sale",
  ForSale = "for-sale",
  SaleEnded = "sale-ended",
}

export const getMintlistStatus = (
  mintlist: NftokenTypes.MintlistInfo
): MintlistStatus => {
  if (mintlist.mint_infos.length < mintlist.num_nfts_total) {
    return MintlistStatus.Pending;
  }

  const now = DateTime.now();
  if (now < DateTime.fromISO(mintlist.go_live_date)) {
    return MintlistStatus.PreSale;
  }

  if (mintlist.num_nfts_redeemed < mintlist.num_nfts_total) {
    return MintlistStatus.ForSale;
  }

  return MintlistStatus.SaleEnded;
};

export type MintlistAndCollection = {
  mintlist: NftokenTypes.MintlistInfo;
  collection: NftokenTypes.CollectionInfo;
};

export function useMintInfos(mintInfos: NftokenTypes.MintInfo[]): {
  data: Array<
    NftokenTypes.MintInfo & {
      metadata: NftokenTypes.Metadata | null;
    }
  >;
  error: unknown;
} {
  const metadataUrls = mintInfos.map((mintInfo) => mintInfo.metadata_url);

  const swrKey = ["mintInfos", ...metadataUrls];

  const { data: metadataMap, error } = useSWR(swrKey, async () => {
    return await NftokenFetcher.getMetadataMap({
      urls: metadataUrls,
    });
  });

  return {
    data: mintInfos.map((mintInfo) => ({
      ...mintInfo,
      metadata: metadataMap
        ? metadataMap.get(mintInfo.metadata_url) ?? null
        : null,
    })),
    error,
  };
}
