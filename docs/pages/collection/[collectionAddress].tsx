import { Network } from "@glow-xyz/glow-client";
import { Solana } from "@glow-xyz/solana-client";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";
import useSWR, { SWRResponse } from "swr";
import { ImageCard } from "../../components/ImageCard";
import { LuxLink } from "../../components/LuxLink";
import { Pill } from "../../components/mintlist/MintlistStatusPill";
import { SocialHead } from "../../components/SocialHead";
import { SquareImage } from "../../components/SquareImage";
import { ValueList } from "../../components/ValueList";
import { useCollectionNfts } from "../../hooks/useCollectionNfts";
import { NftokenFetcher } from "../../utils/NftokenFetcher";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { ResponsiveBreakpoint } from "../../utils/style-constants";
import { NftGrid } from "../my-nfts";

const useCollection = ({
  collectionAddress,
  network,
}: {
  collectionAddress: Solana.Address;
  network: Network;
}): {
  // We can be confident that data will be nonnull even if the request fails,
  // if we defined fallbackData in the config.
  data: NftokenTypes.CollectionInfo | null;
  error: any;
  mutate: SWRResponse<NftokenTypes.CollectionInfo | null, never>["mutate"];
} => {
  const swrKey = [collectionAddress, network];
  const { data, error, mutate } = useSWR(swrKey, async () => {
    return await NftokenFetcher.getCollection({
      address: collectionAddress,
      network,
    });
  });
  return { data: data!, error, mutate };
};

const KEYS: (keyof NftokenTypes.CollectionInfo)[] = [
  "address",
  "authority",
  "authority_can_update",
  "description",
  "image",
  "minted_at",
  "metadata_url",
];

export default function CollectionPage({
  initialCollection,
  initialNftsInCollection,
}: {
  initialCollection: NftokenTypes.CollectionInfo;
  initialNftsInCollection: NftokenTypes.NftInfo[];
}) {
  const {
    query: { collectionAddress, network },
  } = useRouter();

  const { data: collectionData } = useCollection({
    collectionAddress: collectionAddress as string,
    network: network ? (network as Network) : Network.Mainnet,
  });

  const { data: collectionNftsData } = useCollectionNfts({
    collectionAddress: collectionAddress as string,
    network: network ? (network as Network) : Network.Mainnet,
  });

  const collection = collectionData ?? initialCollection;
  const nftsInCollection = collectionNftsData ?? initialNftsInCollection;

  if (collection === undefined) {
    return <div>Loading...</div>;
  }

  if (collection === null) {
    return (
      <div>
        <SocialHead subtitle="Collection Not Found" />
        <h1 className="text-xl font-weight-medium">
          We couldn’t find a collection with this address.
        </h1>
      </div>
    );
  }

  const attributes: { [key: string]: any } = {};
  for (const key of KEYS) {
    attributes[key] = collection[key];
  }

  return (
    <div>
      <SocialHead subtitle={collection.name} />

      <div className="columns">
        <div className={"flex-column gap-2"}>
          <div>
            <Pill label={"Collection"} color={"gray"} />
          </div>

          <div className="image">
            <SquareImage src={collection.image} size={500} />
          </div>

          <h1>{collection.name}</h1>
        </div>

        <div>
          <div>
            <h2 className="text-secondary">On-Chain Metadata</h2>
            <ValueList
              attributes={[
                { label: "address", value: collection.address },
                { label: "authority", value: collection.authority },
                {
                  label: "authority_can_update",
                  value: collection.authority_can_update,
                },
                { label: "metadata_url", value: collection.metadata_url },
              ]}
            />
          </div>
          <div className="traits-column">
            <h2 className="text-secondary">Off-Chain Metadata</h2>
            <ValueList
              attributes={[
                { label: "image", value: collection.image },
                { label: "description", value: collection.description },
                ...(collection.traits
                  ? collection.traits.map((trait) => ({
                      label: trait.trait_type,
                      value: trait.value,
                    }))
                  : []),
              ]}
            />
          </div>
        </div>
      </div>

      {nftsInCollection && (
        <div className="nft-container mt-5">
          <NftGrid nfts={nftsInCollection} />
        </div>
      )}

      <style jsx>{`
        .columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-column-gap: 1rem;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          .columns {
            grid-template-columns: 1fr;
          }

          .traits-column {
            margin-top: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { collectionAddress, network } = context.query;

  try {
    const initialCollection = await NftokenFetcher.getCollection({
      network: (network as Network) ?? Network.Mainnet,
      address: collectionAddress as string,
    });

    const initialNftsInCollection = await NftokenFetcher.getNftsInCollection({
      network: (network as Network) ?? Network.Mainnet,
      collection: collectionAddress as string,
    });

    return { props: { initialCollection, initialNftsInCollection } };
  } catch (error: any) {
    return {
      props: { initialCollection: null, initialNftsInCollection: null },
    };
  }
};
