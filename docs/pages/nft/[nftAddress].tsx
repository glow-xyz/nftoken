import React from "react";
import { Network } from "@glow-app/glow-client";
import { Solana } from "@glow-app/solana-client";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import useSWR, { SWRResponse } from "swr";
import { NftokenFetcher } from "../../utils/NftokenFetcher";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { SolanaAddress } from "../../components/SolanaAddress";
import { SocialHead } from "../../components/SocialHead";
import { ResponsiveBreakpoint } from "../../utils/style-constants";

const useNft = ({
  nftAddress,
  network,
}: {
  nftAddress: Solana.Address;
  network?: Network;
}): {
  // We can be confident that data will be nonnull even if the request fails,
  // if we defined fallbackData in the config.
  data: NftokenTypes.NftInfo | null;
  error: any;
  mutate: SWRResponse<NftokenTypes.NftInfo | null, never>["mutate"];
} => {
  const swrKey = [nftAddress, network];
  const { data, error, mutate } = useSWR(swrKey, async () => {
    return await NftokenFetcher.getNft({ address: nftAddress, network });
  });
  return { data: data!, error, mutate };
};

const KEYS = [
  { key: "address", type: "address" },
  { key: "collection", type: "address" },
  { key: "holder", type: "address" },
  { key: "delegate", type: "address" },
  { key: "authority", type: "address" },
  { key: "name" },
  { key: "description" },
  { key: "minted_at" },
  { key: "metadata_url", type: "link" },
  { key: "is_frozen" },
  { key: "authority_can_update" },
  { key: "image", type: "link" },
  { key: "version" },
];

export default function NftPage({
  initialNft,
}: {
  initialNft: NftokenTypes.NftInfo;
}) {
  const {
    query: { nftAddress, network },
  } = useRouter();

  const { data } = useNft({
    nftAddress: nftAddress as string,
    network: network as Network | undefined,
  });

  const nft = data ?? initialNft;

  if (nft === undefined) {
    return <div>Loading...</div>;
  }

  if (nft === null) {
    return <div>No NFT</div>;
  }

  return (
    <>
      <SocialHead subtitle={nft.name} />

      <div className="wrapper">
        <div className="columns">
          <img src={nft.image} />
          <div>
            <h1>{nft.name}</h1>

            <div className="table">
              {KEYS.map(({ key, type }, index) => (
                <React.Fragment key={key}>
                  <p className="key">{key}</p>
                  {type === "address" ? (
                    <SolanaAddress address={nft[key]} />
                  ) : type === "link" ? (
                    <a href={nft[key]} target="_blank">
                      {nft[key]}
                    </a>
                  ) : (
                    <p>
                      {typeof nft[key] === "string"
                        ? nft[key]
                        : JSON.stringify(nft[key])}
                    </p>
                  )}
                  {index !== KEYS.length - 1 && <div className="divider" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .wrapper {
          margin-top: 1.5rem;
        }

        img {
          display: block;
          width: 100%;
          box-shadow: var(--shadow);
          border-radius: calc(var(--border-radius) * 2);
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

          display: grid;
          grid-template-columns: max-content 1fr;
          grid-column-gap: 2rem;
        }

        .table p,
        .table a {
          margin-bottom: 0;
          overflow-wrap: anywhere;
        }

        .table .key {
          font-weight: var(--normal-font-weight);
          color: var(--secondary-color);
          max-width: 8.5rem; /* This width cuts "authority_can_update" in a nice way */
        }

        .table .divider {
          border-top: 1px solid var(--secondary-border-color);
          grid-column: span 2;
          margin: 0.5rem 0;
        }

        .table a {
          color: var(--primary-color);
        }

        .table a:hover {
          text-decoration: underline;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          img {
            max-width: 24rem;
            margin: 0 auto;
          }

          h1 {
            text-align: center;
            margin-bottom: 1.5rem;
          }

          .columns {
            grid-template-columns: 1fr;
            grid-row-gap: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { nftAddress, network } = context.query;

  try {
    const initialNft = await NftokenFetcher.getNft({
      network: network as Network | undefined,
      address: nftAddress as string,
    });

    return { props: { initialNft } };
  } catch (error: any) {
    return { props: { initialNft: null } };
  }
};
