import { Network } from "@glow-xyz/glow-client";
import { Solana } from "@glow-xyz/solana-client";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";
import useSWR, { SWRResponse } from "swr";
import { SocialHead } from "../../components/SocialHead";
import { SquareImage } from "../../components/SquareImage";
import { ValueList } from "../../components/ValueList";
import { NftokenFetcher } from "../../utils/NftokenFetcher";
import { NftokenTypes } from "../../utils/NftokenTypes";
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
      <div>
        <SocialHead subtitle="NFT Not Found" />
        <h1 className="text-xl font-weight-medium">
          We couldn't find an NFT with this address.
        </h1>
      </div>
    );
  }

  return (
    <div>
      <SocialHead subtitle={nft.name} />

      <div className="wrapper">
        <div className="columns">
          <div className="image">
            <SquareImage src={nft.image} size={500} />
          </div>

          <div>
            <h1>{nft.name ?? "Unknown"}</h1>

            <div>
              <h2 className="text-secondary">On-Chain Metadata</h2>
              <ValueList
                attributes={[
                  { label: "address", value: nft.address },
                  { label: "collection", value: nft.collection },
                  { label: "holder", value: nft.holder },
                  { label: "delegate", value: nft.delegate },
                  { label: "authority", value: nft.authority },
                  {
                    label: "authority_can_update",
                    value: nft.authority_can_update,
                  },
                  { label: "metadata_url", value: nft.metadata_url },
                ]}
              />
            </div>

            <div className="mt-4">
              <h2 className="text-secondary">Off-Chain Metadata</h2>
              <ValueList
                attributes={[
                  { label: "image", value: nft.image },
                  { label: "description", value: nft.description },
                  ...(nft.traits
                    ? nft.traits.map((trait) => ({
                        label: trait.trait_type,
                        value: trait.value,
                      }))
                    : []),
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
