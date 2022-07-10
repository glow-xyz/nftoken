import { Network } from "@glow-xyz/glow-client";
import { Solana } from "@glow-xyz/solana-client";
import { DateTime } from "luxon";
import { useRouter } from "next/router";
import React, { useState } from "react";
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
import { useNetworkContext } from "../../components/NetworkContext";
import { SocialHead } from "../../components/SocialHead";
import { usePolling } from "../../hooks/usePolling";
import { NftokenFetcher } from "../../utils/NftokenFetcher";
import { NftokenTypes } from "../../utils/NftokenTypes";

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

      {status === MintlistStatus.SaleEnded && <div>Sale Ended TODO</div>}
    </div>
  );
}

const MintlistPresale = ({
  mintlist,
}: {
  mintlist: NftokenTypes.MintlistInfo;
}) => {
  const startAt = DateTime.fromISO(mintlist.go_live_date);
  const [time, setTime] = useState<Duration>(() =>
    startAt.diffNow().shiftTo("hours", "minutes", "seconds")
  );

  usePolling(() => {
    setTime(startAt.diffNow().shiftTo("hours", "minutes", "seconds"));
  }, 250);

  return (
    <div className={"mt-5"}>
      <div className="flex-center-center mb-4 text-xl">
        Sale Starts at{" "}
        {startAt.toLocaleString({
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })}
      </div>

      <div className={"countdown flex-center-center gap-3"}>
        <div className={"text-center time"}>
          <div className={"unit"}>{time.hours}</div>
          <div className={"label"}>Hours</div>
        </div>

        <div className={"text-center time"}>
          <div className={"unit"}>{time.minutes}</div>
          <div className={"label"}>Minutes</div>
        </div>

        <div className={"text-center time"}>
          <div className={"unit"}>{Math.round(time.seconds ?? 0)}</div>
          <div className={"label"}>Seconds</div>
        </div>
      </div>

      <style jsx>{`
        .time {
          flex-basis: 80px;
        }

        .unit {
          font-size: var(--larger-font-size);
          font-weight: var(--medium-font-weight);
        }

        .label {
          color: var(--secondary-color);
        }
      `}</style>
    </div>
  );
};

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

