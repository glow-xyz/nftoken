import { PageLayout } from "../../components/PageLayout";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { useNetworkContext } from "../../components/NetworkContext";
import { useRouter } from "next/router";
import { Solana } from "@glow-app/solana-client";
import { Network } from "@glow-app/glow-client";
import useSWR, { SWRResponse } from "swr";
import { NftokenFetcher } from "../../utils/NftokenFetcher";
import React from "react";
import { SolanaAddress } from "../../components/SolanaAddress";
import { ExternalLink } from "../../components/ExternalLink";
import { ChevronLeftIcon, ExternalLinkIcon } from "@heroicons/react/outline";
import { DateTime } from "luxon";
import { ResponsiveBreakpoint } from "../../utils/style-constants";
import { useGlowContext } from "@glow-app/glow-react";
import { LuxButton } from "../../components/LuxButton";

type ATTRIBUTE_KEY = keyof NftokenTypes.MintlistInfo;
type ATTRIBUTE_TYPE = "address" | "link" | "unix_timestamp" | "amount";
const KEYS: { key: ATTRIBUTE_KEY; type?: ATTRIBUTE_TYPE }[] = [
  { key: "address", type: "address" },
  { key: "authority", type: "address" },
  { key: "treasury_sol", type: "address" },
  { key: "go_live_date", type: "unix_timestamp" },
  { key: "created_at", type: "unix_timestamp" },
  { key: "metadata_url", type: "link" },
  { key: "collection", type: "address" },
  { key: "price", type: "amount" },
  { key: "minting_order" },
  // We will handle the ones below manually
  // { key: "num_nfts_total" },
  // { key: "num_nfts_redeemed" },
];

export default function MintlistPage() {
  const { query } = useRouter();
  const mintlistAddress = query.mintlistAddress as Solana.Address;

  const { user } = useGlowContext();

  const { network } = useNetworkContext();

  const { data } = useMintlist({ address: mintlistAddress, network });

  return (
    <>
      <PageLayout>
        {data && (
          <>
            {user && (
              <div className="navigation">
                <LuxButton
                  label="Back to Mintlists"
                  icon={<ChevronLeftIcon />}
                  href="/mintlists"
                  iconPlacement="left"
                  rounded
                  variant="link"
                  color="brand"
                />
              </div>
            )}
            <h1>{data.mintlist.name}</h1>
            <div className="columns">
              <div className="collection">
                {data.collection && (
                  <>
                    <h2>Collection</h2>
                    {data.collection.image ? (
                      <figure>
                        <img
                          alt={data.collection.name}
                          src={data.collection.image}
                        />
                        <figcaption>{data.collection.name}</figcaption>
                      </figure>
                    ) : (
                      <h3>{data.collection.name}</h3>
                    )}
                  </>
                )}
              </div>

              <div>
                <h2>On-Chain Data</h2>
                <div className="table">
                  {KEYS.map(({ key, type }) => {
                    return (
                      <React.Fragment key={key}>
                        <div className="key">{key}</div>
                        {type === "address" ? (
                          <div className="solana-address flex-center flex-wrap">
                            <SolanaAddress
                              address={data.mintlist[key]?.toString()}
                            />
                          </div>
                        ) : type === "link" ? (
                          <div className="link">
                            <ExternalLink href={data.mintlist[key]!.toString()}>
                              <span>{data.mintlist[key]!.toString()}</span>{" "}
                              <ExternalLinkIcon />
                            </ExternalLink>
                          </div>
                        ) : type === "amount" ? (
                          <div>
                            {
                              (data.mintlist[key] as { lamports: string })
                                .lamports
                            }
                          </div>
                        ) : type === "unix_timestamp" ? (
                          <div>
                            {DateTime.fromISO(
                              data.mintlist[key]! as string
                            ).toLocaleString({
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                        ) : (
                          <div>
                            {typeof data.mintlist[key] === "string"
                              ? data.mintlist[key]?.toString()
                              : JSON.stringify(data.mintlist[key])}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                  <div className="key">nfts_uploaded</div>
                  <div>{data.mintlist.mint_infos.length}</div>
                  <div className="key">nfts_total</div>
                  <div>{data.mintlist.num_nfts_total}</div>
                  <div className="key">nfts_minted</div>
                  <div>{data.mintlist.num_nfts_redeemed}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </PageLayout>
      <style jsx>{`
        .navigation {
          margin-bottom: 2rem;
        }

        .columns {
          display: grid;
          grid-template-columns: 20rem 1fr;
          grid-column-gap: 3rem;
        }

        .table {
          padding: 0.75rem;
          border-radius: var(--border-radius);
          background-color: var(--secondary-bg-color);
          font-family: var(--mono-font);
          font-weight: var(--medium-font-weight);
          overflow-wrap: anywhere;

          display: grid;
          grid-template-columns: max-content 1fr;
          grid-column-gap: 2rem;
        }

        .table .key {
          font-weight: var(--normal-font-weight);
          color: var(--secondary-color);
          max-width: 8.5rem; /* This width cuts "authority_can_update" in a nice way */
        }

        img {
          display: block;
          width: 100%;
          box-shadow: var(--shadow);
          border-radius: calc(var(--border-radius) * 2);
        }

        figcaption {
          margin-top: 1rem;
          text-align: center;
          font-weight: bold;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          img {
            max-width: 24rem;
            margin: 0 auto;
          }

          h1,
          h2 {
            text-align: center;
            margin-bottom: 1.5rem;
          }

          .columns {
            grid-template-columns: 1fr;
            grid-row-gap: 1.5rem;
          }

          .collection {
            // Push the collection section to the bottom.
            order: 1;
          }
        }
      `}</style>
    </>
  );
}

type MintlistAndCollection = {
  mintlist: NftokenTypes.MintlistInfo;
  collection: NftokenTypes.CollectionInfo | null;
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
  mutate: SWRResponse<MintlistAndCollection | null, never>["mutate"];
} {
  const swrKey = [address, network];
  const { data, error, mutate } = useSWR(swrKey, async () => {
    const mintlist = await NftokenFetcher.getMintlist({ address, network });

    if (!mintlist) {
      return null;
    }

    const collection = await NftokenFetcher.getCollection({
      address: mintlist.collection,
      network,
    });

    return {
      mintlist,
      collection,
    };
  });

  return { data, error, mutate };
}
