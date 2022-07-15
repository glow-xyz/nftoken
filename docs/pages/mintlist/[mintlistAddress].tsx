import { Network } from "@glow-xyz/glow-client";
import { NftokenFetcher } from "@glow-xyz/nftoken-js";
import { Solana } from "@glow-xyz/solana-client";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { LuxSpinner } from "../../components/LuxSpinner";
import {
  getMintlistStatus,
  MintlistAndCollection,
  MintlistStatus
} from "../../components/mintlist/mintlist-utils";
import { MintlistForSale } from "../../components/mintlist/MintlistForSale";
import { MintlistInfoHeader } from "../../components/mintlist/MintlistInfoHeader";
import { MintlistPending } from "../../components/mintlist/MintlistPending";
import { MintlistSaleEnded } from "../../components/mintlist/MintlistSaleEnded";
import { useNetworkContext } from "../../components/NetworkContext";
import { SocialHead } from "../../components/SocialHead";
import { MintlistPresale } from "../../components/mintlist/MintlistPresale";

// TODO: add server side rendering
export default function MintlistPage() {
  const { query } = useRouter();
  const mintlistAddress = query.mintlistAddress as Solana.Address;

  const networkContext = useNetworkContext();
  const network = (query.network || networkContext.network) as Network;

  const { data } = useMintlist({ address: mintlistAddress, network });

  if (!data) {
    return (
      <div>
        <div className="p-5 flex-center-center">
          <LuxSpinner />
        </div>
      </div>
    );
  }

  const { mintlist, collection } = data;
  const status = getMintlistStatus(mintlist);

  return (
    <div>
      <SocialHead subtitle={data.mintlist.name} />
      <MintlistInfoHeader mintlist={mintlist} collection={collection} />

      {status === MintlistStatus.Pending && (
        <MintlistPending mintlist={mintlist} collection={collection} />
      )}
      {status === MintlistStatus.PreSale && (
        <MintlistPresale mintlist={mintlist} />
      )}

      {status === MintlistStatus.ForSale && (
        <MintlistForSale mintlist={mintlist} />
      )}

      {status === MintlistStatus.SaleEnded && (
        <MintlistSaleEnded mintlist={mintlist} />
      )}
    </div>
  );
}

function useMintlist({
  address,
  network,
}: {
  address: Solana.Address;
  network: Network;
}): {
  data?: MintlistAndCollection | null;
  error: any;
} {
  const swrKey = [address, network];
  const { data, error } = useSWR(swrKey, async () => {
    const mintlist = await NftokenFetcher.getMintlist({ address, network });

    if (!mintlist) {
      return null;
    }

    const collection = await NftokenFetcher.getCollection({
      address: mintlist.collection,
      network,
    });

    if (!collection) {
      return null;
    }

    return {
      mintlist,
      collection,
    };
  });

  return { data, error };
}
