import classNames from "classnames";
import React, { useState } from "react";
import { useNetworkContext } from "../atoms/NetworkContext";
import { MintInfosUploader } from "./MintInfosForm";
import { MintlistAndCollection } from "./mintlist-utils";
import { MintlistNftsGrid } from "./MintlistNftsGrid";

enum Tab {
  Nfts = "nfts",
  Configure = "configure",
}

const TAB_TO_INFO: Record<Tab, { name: string }> = {
  [Tab.Configure]: { name: "Set Up" },
  [Tab.Nfts]: { name: "Mint Infos" },
};

const TABS = [Tab.Configure, Tab.Nfts];

export const MintlistPending = ({ mintlist }: MintlistAndCollection) => {
  const { network } = useNetworkContext();
  const [tab, setTab] = useState<Tab>(Tab.Configure);

  return (
    <div>
      <div className="flex-center gap-3">
        {TABS.map((t) => {
          const { name } = TAB_TO_INFO[t];
          const selected = t === tab;
          return (
            <div
              className={classNames(
                "text-xl animated font-weight-bold cursor-pointer",
                {
                  "text-secondary": !selected,
                }
              )}
              onClick={() => setTab(t)}
            >
              {name}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        {tab === "configure" && (
          <MintInfosUploader mintlist={mintlist} network={network} />
        )}

        {tab === "nfts" && <MintlistNftsGrid mintInfos={mintlist.mint_infos} />}
      </div>
    </div>
  );
};
