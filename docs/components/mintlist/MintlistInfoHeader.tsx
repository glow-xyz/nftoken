import { ChevronLeftIcon } from "@heroicons/react/outline";
import { DateTime } from "luxon";
import React from "react";
import { LAMPORTS_PER_SOL } from "../../utils/constants";
import { ResponsiveBreakpoint } from "../../utils/style-constants";
import { LuxButton } from "../LuxButton";
import { NftCard } from "../NftCard";
import { ValueList } from "../ValueList";
import { getMintlistStatus, MintlistAndCollection } from "./mintlist-utils";

export const MintlistInfoHeader = ({
  mintlist,
  collection,
}: MintlistAndCollection) => {
  const status = getMintlistStatus(mintlist);
  return (
    <div>
      <div className="navigation">
        <LuxButton
          label="My Mintlists"
          icon={<ChevronLeftIcon />}
          href="/mintlists"
          iconPlacement="left"
          rounded
          variant="link"
          color="brand"
        />
      </div>

      <div className="badge">Mintlist</div>

      <h1>{mintlist.name}</h1>

      <div className="columns mb-4">
        <div className="collection">
          <NftCard
            image={collection.image}
            title={collection.name!}
            size={200}
          />
        </div>

        <ValueList
          attributes={[
            { label: "status", value: status },
            { label: "address", value: mintlist.address },
            { label: "authority", value: mintlist.authority },
            {
              label: "treasury_sol",
              value: mintlist.treasury_sol,
            },
            {
              label: "go_live_date",
              value: DateTime.fromISO(mintlist.go_live_date).toLocaleString({
                dateStyle: "medium",
                timeStyle: "short",
              }),
            },
            {
              label: "created_at",
              value: DateTime.fromISO(mintlist.created_at).toLocaleString({
                dateStyle: "medium",
                timeStyle: "short",
              }),
            },
            {
              label: "metadata_url",
              value: mintlist.metadata_url,
            },
            { label: "collection", value: mintlist.collection },
            {
              label: "price",
              value:
                parseInt(mintlist.price.lamports) / LAMPORTS_PER_SOL + " SOL",
            },
            {
              label: "minting_order",
              value: mintlist.minting_order,
            },
            {
              label: "nfts_uploaded",
              value: mintlist.mint_infos.length,
            },
            {
              label: "nfts_total",
              value: mintlist.num_nfts_total,
            },
            {
              label: "nfts_minted",
              value: mintlist.num_nfts_redeemed,
            },
          ]}
        />
      </div>

      <style jsx>{`
        .navigation {
          margin-bottom: 2rem;
        }

        .badge {
          font-size: var(--small-font-size);
          font-weight: var(--medium-font-weight);
          background-color: var(--secondary-bg-color);
          max-width: max-content;
          padding: 0.1rem 0.5rem;
          border-radius: 99rem;
          margin-left: -0.5rem;
          margin-bottom: 0.25rem;
          color: var(--secondary-color);
        }

        .columns {
          display: grid;
          grid-template-columns: 20rem 1fr;
          grid-column-gap: 3rem;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          h1,
          h2 {
            text-align: center;
            margin-bottom: 1.5rem;
          }

          .columns {
            grid-template-columns: 1fr;
            grid-row-gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};
