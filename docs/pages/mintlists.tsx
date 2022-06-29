import { NftokenFetcher } from "../utils/NftokenFetcher";
import { Network } from "@glow-app/glow-client";
import useSWR, { SWRResponse } from "swr";
import { useGlowContext } from "@glow-app/glow-react";
import { Solana } from "@glow-app/solana-client";
import { NftokenTypes } from "../utils/NftokenTypes";
import { InteractiveWell } from "../components/InteractiveWell";
import { PageLayout } from "../components/PageLayout";
import { useNetworkContext } from "../components/NetworkContext";

export default function MintlistsPage() {
  const { user } = useGlowContext();
  const wallet = user?.address;

  const { network } = useNetworkContext();

  let { data: mintlists } = useMintlists({ wallet, network });
  mintlists ??= [];

  return (
    <PageLayout>
      <InteractiveWell title="Mintlists">
        {mintlists.map((mintlist) => (
          <pre key={mintlist.address}>{JSON.stringify(mintlist, null, 2)}</pre>
        ))}
      </InteractiveWell>
    </PageLayout>
  );
}

function useMintlists({
  wallet,
  network,
}: {
  wallet: Solana.Address | undefined;
  network: Network;
}): {
  data: NftokenTypes.MintlistInfo[] | undefined;
  error: any;
  mutate: SWRResponse<NftokenTypes.MintlistInfo[], never>["mutate"];
} {
  const swrKey = [wallet, network];
  const { data, error, mutate } = useSWR(swrKey, async () => {
    if (!wallet) {
      return [];
    }

    return await NftokenFetcher.getAllMintlists({ wallet, network });
  });
  return { data, error, mutate };
}
