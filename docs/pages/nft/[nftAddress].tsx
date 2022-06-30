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

const KEYS: (keyof NftokenTypes.NftInfo)[] = [
  "address",
  "collection",
  "holder",
  "delegate",
  "authority",
  "authority_can_update",
  "name",
  "description",
  "image",
  "minted_at",
  "metadata_url",
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
    return (
      <>
        <SocialHead subtitle="NFT Not Found" />
        <h1>We couldn’t find an NFToken with this address.</h1>
        <style jsx>{`
          h1 {
            font-size: 1.5rem;
          }
        `}</style>
      </>
    );
  }

  const attributes: { [key: string]: any } = {};
  for (const key of KEYS) {
    attributes[key] = nft[key];
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
          <img src={nft.image} />
          <div>
            <h1>{nft.name}</h1>

            <ValueList attributes={attributes} />

            <div className="mt-4">
              <h2>Traits</h2>
              {nft.traits && nft.traits.length > 0 ? (
                <ValueList attributes={traits} />
              ) : (
                <div className="traits-empty-state">No traits set.</div>
              )}
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
