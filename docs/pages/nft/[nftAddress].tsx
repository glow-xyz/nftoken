import React from "react";
import { Network } from "@glow-app/glow-client";
import { Solana } from "@glow-app/solana-client";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import useSWR, { SWRResponse } from "swr";
import { NftokenFetcher } from "../../utils/NftokenFetcher";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { PageLayout } from "../../components/PageLayout";
import { SocialHead } from "../../components/SocialHead";
import { ResponsiveBreakpoint } from "../../utils/style-constants";
import { ValueList } from "../../components/ValueList";
import { SquareImage } from "../../components/SquareImage";

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
    return (
      <PageLayout>
        <SocialHead subtitle="NFT Not Found" />
        <h1 className="text-xl font-weight-medium">
          We couldn’t find an NFT with this address.
        </h1>
      </PageLayout>
    );
  }

  const traits: { [key: string]: any } = {};
  if (nft.traits) {
    for (const entry of nft.traits) {
      traits[entry.trait_type] = entry.value;
    }
  }

  return (
    <PageLayout>
      <SocialHead subtitle={nft.name} />

      <div className="wrapper">
        <div className="columns">
          {nft.image && (
            <div className="image">
              <SquareImage src={nft.image} size={500} alt={nft.name} />
            </div>
          )}
          <div>
            <h1>{nft.name}</h1>

            <div>
              <h2 className="text-secondary">On-Chain Metadata</h2>
              <ValueList
                attributes={{
                  address: nft.address,
                  collection: nft.collection,
                  holder: nft.holder,
                  delegate: nft.delegate,
                  authority: nft.authority,
                  authority_can_update: nft.authority_can_update,
                  description: nft.description,
                  minted_at: nft.minted_at,
                }}
              />
            </div>

            <div className="mt-4">
              <h2 className="text-secondary">Off-Chain Metadata</h2>
              <ValueList
                attributes={{
                  image: nft.image,
                  metadata_url: nft.metadata_url,
                  ...traits,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .wrapper {
          margin-top: 1.5rem;
        }

        .image {
          display: block;
          width: 100%;
          box-shadow: var(--shadow);
          border-radius: calc(var(--border-radius) * 2);
          overflow: hidden;
          height: max-content;
          max-width: 500px;
          margin: 0 auto;
        }

        .columns {
          display: grid;
          grid-template-columns: 20rem 1fr;
          grid-column-gap: 3rem;
        }

        .traits-empty-state {
          color: var(--secondary-color);
          background-color: var(--secondary-bg-color);
          padding: 0.75rem;
          border-radius: var(--border-radius);
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
    </PageLayout>
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
