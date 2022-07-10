import { Solana } from "@glow-xyz/solana-client";
import { Network } from "@glow-xyz/glow-client";
import { NftokenTypes } from "../utils/NftokenTypes";
import useSWR, { SWRResponse } from "swr";
import { NftokenFetcher } from "@glow-xyz/nftoken-js";

export const useCollectionNfts = ({
  collectionAddress,
  network,
}: {
  collectionAddress: Solana.Address;
  network: Network;
}): {
  // We can be confident that data will be nonnull even if the request fails,
  // if we defined fallbackData in the config.
  data?: NftokenTypes.NftInfo[];
  error: any;
  mutate: SWRResponse<NftokenTypes.NftInfo[], never>["mutate"];
} => {
  const swrKey = [collectionAddress, network, "getNftsInCollection"];
  const { data, error, mutate } = useSWR(swrKey, async () => {
    return await NftokenFetcher.getNftsInCollection({
      collection: collectionAddress,
      network,
    });
  });
  return { data, error, mutate };
};
