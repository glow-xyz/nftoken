import { Network } from "@glow-app/glow-client";
import { Solana } from "@glow-app/solana-client";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import useSWR, { SWRResponse } from "swr";
import { NftokenFetcher } from "../../utils/NftokenFetcher";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { SolanaAddress } from "../../components/SolanaAddress";
import React from "react";

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

  console.log(nft);

  return (
    <div className="wrapper">
      <div className="columns">
        <img src={nft.image} />
        <div>
          <h1>{nft.name}</h1>
          <div className="info">
            <div className="info-box">
              <p>Address</p>
              <SolanaAddress address={nft.address} />
            </div>
            <div className="info-box">
              <p>Holder</p>
              <SolanaAddress address={nft.holder} />
            </div>
            <div className="info-box">
              <p>Collection</p>
              <SolanaAddress address={nft.collection} />
            </div>
          </div>

          {nft.traits && (
            <div className="trait-table">
              {nft.traits.map(({ trait_type, value }, i) => (
                <React.Fragment key={trait_type}>
                  <p className="key">{trait_type}:</p>
                  <p>{value}</p>
                  {i !== nft.traits.length - 1 ? (
                    <div className="divider" />
                  ) : null}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .wrapper {
          margin-top: 1.5rem;
        }

        img {
          display: block;
          max-width: 20rem;
          box-shadow: var(--shadow-lg);
        }

        h1 {
          margin-bottom: 1.5rem;
        }

        .columns {
          display: grid;
          grid-template-columns: max-content 1fr;
          grid-column-gap: 3rem;
        }

        .info-box {
          display: inline-block;
          margin-right: 1rem;
          background-color: var(--secondary-bg-color);
          padding: 0.5rem 0.75rem;
          border-radius: var(--border-radius);
        }

        .info-box p {
          margin-bottom: 0;
          font-size: var(--tiny-font-size);
          color: var(--secondary-color);
          font-weight: var(--medium-font-weight);
        }

        .trait-table {
          margin-top: 1.5rem;
          display: grid;
          grid-template-columns: max-content 1fr;
          font-family: var(--mono-font);
          background-color: var(--secondary-bg-color);
          padding: 0.75rem;
          border-radius: var(--border-radius);
        }

        .trait-table p {
          margin-bottom: 0;
          word-break: break-all;
          font-size: var(--small-font-size);
          font-weight: var(--medium-font-weight);
        }

        .trait-table .key {
          padding-right: 1rem;
          color: var(--secondary-color);
          text-align: right;
          font-weight: var(--normal-font-weight);
        }

        .trait-table .divider {
          grid-column: span 2;
          border-top: 1px solid var(--secondary-border-color);
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
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
