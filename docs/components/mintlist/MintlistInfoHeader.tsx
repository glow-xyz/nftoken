import { DateTime } from "luxon";
import React from "react";
import { LAMPORTS_PER_SOL } from "../../utils/constants";
import { pluralize } from "../../utils/string";
import { ResponsiveBreakpoint } from "../../utils/style-constants";
import { ImageCard } from "../ImageCard";
import { ValueList } from "../ValueList";
import {
  getMintlistStatus,
  MintlistAndCollection,
  MintlistStatus,
} from "./mintlist-utils";
import { MintlistStatusPill, Pill } from "./MintlistStatusPill";

export const MintlistInfoHeader = ({
  mintlist,
  collection,
}: MintlistAndCollection) => {
  const status = getMintlistStatus(mintlist);
  const feeString =
    parseInt(mintlist.price.lamports) / LAMPORTS_PER_SOL + " SOL";

  return (
    <div>
      <div className="flex-center gap-2 mb-3">
        <Pill label={"Mintlist"} color={"gray"} />
        <MintlistStatusPill status={status} />
      </div>

      <div className="columns mb-4">
        <div className="collection">
          <ImageCard image={collection.image} title={null} size={300} />

          <h1 className={"mb-0"}>{mintlist.name}</h1>
        </div>

        <div>
          {status === MintlistStatus.PreSale && (
            <div className="flex-column gap-3">
              <div>
                This Mintlist has {mintlist.num_nfts_total}{" "}
                {pluralize("NFT", mintlist.num_nfts_total)} available with a
                minting fee of {feeString}.
              </div>

              <div>
                Once the Mintlist is live, you'll be able to mint NFTs right
                from this page.
              </div>

              <ValueList
                attributes={[
                  { label: "Address", value: mintlist.address },
                  { label: "Creator", value: mintlist.authority },
                  { label: "Minting Order", value: mintlist.minting_order },
                ]}
              />
            </div>
          )}

          {status === MintlistStatus.ForSale && (
            <div className="flex-column gap-3">
              <div>
                This Mintlist has {mintlist.num_nfts_total}{" "}
                {pluralize("NFT", mintlist.num_nfts_total)} available with a
                minting fee of {feeString}.
              </div>

              <div>
                {mintlist.num_nfts_redeemed}{" "}
                {pluralize("NFT", mintlist.num_nfts_redeemed)} have already been
                sold.
              </div>

              <ValueList
                attributes={[
                  { label: "Address", value: mintlist.address },
                  { label: "Creator", value: mintlist.authority },
                  { label: "Minting Order", value: mintlist.minting_order },
                ]}
              />
            </div>
          )}

          {status === MintlistStatus.Pending && (
            <ValueList
              attributes={[
                { label: "Address", value: mintlist.address },
                { label: "Authority", value: mintlist.authority },
                {
                  label: "Treasury",
                  value: mintlist.treasury_sol,
                },
                {
                  label: "Go Live",
                  value: mintlist.go_live_date,
                },
                {
                  label: "price",
                  value:
                    parseInt(mintlist.price.lamports) / LAMPORTS_PER_SOL +
                    " SOL",
                },
                {
                  label: "minting_order",
                  value: mintlist.minting_order,
                },
                {
                  label: "Configured",
                  value: `${mintlist.mint_infos.length} of ${mintlist.num_nfts_total}`,
                },
              ]}
            />
          )}

          {status === MintlistStatus.SaleEnded && (
            <div className={"flex-column gap-3"}>
              <div>The Mintlist has sold out. Congratulations!</div>

              <div>You can close the Mintlist account to reclaim rent.</div>

              <ValueList
                attributes={[
                  { label: "Address", value: mintlist.address },
                  { label: "Authority", value: mintlist.authority },
                  {
                    label: "Treasury",
                    value: mintlist.treasury_sol,
                  },
                  {
                    label: "price",
                    value:
                      parseInt(mintlist.price.lamports) / LAMPORTS_PER_SOL +
                      " SOL",
                  },
                ]}
              />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
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
