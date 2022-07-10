import { ChevronLeftIcon } from "@heroicons/react/outline";
import { DateTime } from "luxon";
import React from "react";
import { LAMPORTS_PER_SOL } from "../../utils/constants";
import { ResponsiveBreakpoint } from "../../utils/style-constants";
import { LuxButton } from "../LuxButton";
import { ImageCard } from "../ImageCard";
import { ValueList } from "../ValueList";
import { getMintlistStatus, MintlistAndCollection } from "./mintlist-utils";
import { MintlistStatusPill, Pill } from "./MintlistStatusPill";

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

      <div className="flex-center gap-2 mb-2">
        <Pill label={"Mintlist"} color={"gray"} />
        <MintlistStatusPill status={status} />
      </div>

      <h1>{mintlist.name}</h1>

      <div className="columns mb-4">
        <div className="collection">
          <ImageCard image={collection.image} title={null} size={300} />
        </div>

        <div>
          <ValueList
            attributes={[
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
                label: "price",
                value:
                  parseInt(mintlist.price.lamports) / LAMPORTS_PER_SOL + " SOL",
              },
              {
                label: "minting_order",
                value: mintlist.minting_order,
              },
              {
                label: "nfts_total",
                value: mintlist.num_nfts_total,
              },
            ]}
          />
        </div>
      </div>

      <style jsx>{`
        .navigation {
          margin-bottom: 2rem;
        }

        .columns {
          display: grid;
          grid-template-columns: 20rem 1fr;
          grid-column-gap: 3rem;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          .columns {
            grid-template-columns: 1fr;
            grid-row-gap: 1.5rem;
          }

          .collection {
            max-width: 380px;
          }
        }
      `}</style>
    </div>
  );
};
