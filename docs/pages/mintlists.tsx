import { NftokenFetcher } from "../utils/NftokenFetcher";
import { Network } from "@glow-app/glow-client";
import useSWR from "swr";
import { useGlowContext } from "@glow-app/glow-react";
import { Solana } from "@glow-app/solana-client";
import { NftokenTypes } from "../utils/NftokenTypes";
import { InteractiveWell } from "../components/InteractiveWell";
import { PageLayout } from "../components/PageLayout";
import { useNetworkContext } from "../components/NetworkContext";
import { DateTime } from "luxon";
import React from "react";

export default function MintlistsPage() {
  const { user } = useGlowContext();
  const wallet = user?.address;

  const { network } = useNetworkContext();

  const { data } = useMintlists({ wallet, network });
  const mintlists = data ?? [];

  return (
    <>
      <PageLayout>
        <h1>Mintlists</h1>
        <p>
          Below you can find the overview of all the mintlists you created.
          Click on the mintlist name to go to its details page where you can
          manage it.
        </p>
        <InteractiveWell title="Your Mintlists">
          <div className="table">
            <div className="th">Mintlist Name</div>
            <div className="th">NFTs Uploaded</div>
            <div className="th">NFTs Minted</div>
            <div className="th">Go Live Date</div>
            {mintlists.map((mintlist) => (
              <React.Fragment key={mintlist.address}>
                <div>
                  <a href={`/mintlist/${mintlist.address}`}>{mintlist.name}</a>
                </div>
                <div>
                  {mintlist.mint_infos.length}/{mintlist.num_nfts_total}
                </div>
                <div>{mintlist.num_nfts_redeemed}</div>
                <div>
                  {DateTime.fromISO(mintlist.go_live_date).toLocaleString({
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </React.Fragment>
            ))}
          </div>
        </InteractiveWell>
      </PageLayout>
      <style jsx>{`
        .table {
          display: grid;
          flex-direction: column;
          column-gap: 3rem;
          row-gap: 0.5rem;
          grid-template-columns: repeat(4, 1fr);
        }

        .th {
          font-weight: bold;
        }
      `}</style>
    </>
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
} {
  const swrKey = [wallet, network];
  const { data, error } = useSWR(swrKey, async () => {
    if (!wallet) {
      return [];
    }

    return await NftokenFetcher.getAllMintlists({ wallet, network });
  });
  return { data, error };
}
