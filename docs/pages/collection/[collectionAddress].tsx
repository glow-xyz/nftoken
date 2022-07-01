import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { Network } from "@glow-app/glow-client";
import { Solana } from "@glow-app/solana-client";
import useSWR, { SWRResponse } from "swr";
import { NftokenFetcher } from "../../utils/NftokenFetcher";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { SocialHead } from "../../components/SocialHead";
import { PageLayout } from "../../components/PageLayout";
import { ValueList } from "../../components/ValueList";
import { ResponsiveBreakpoint } from "../../utils/style-constants";
import { SquareImage } from "../../components/SquareImage";

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

const useCollectionNfts = ({
  collectionAddress,
  network,
}: {
  collectionAddress: Solana.Address;
  network: Network;
}): {
  // We can be confident that data will be nonnull even if the request fails,
  // if we defined fallbackData in the config.
  data: NftokenTypes.NftInfo[];
  error: any;
  mutate: SWRResponse<NftokenTypes.NftInfo[], never>["mutate"];
} => {
  const swrKey = [collectionAddress, network, "getNftsInCollection"];
  const { data, error, mutate } = useSWR(swrKey, async () => {
    return await NftokenFetcher.getNftsInCollection({
      collection: collectionAddress,
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
      <PageLayout>
        <SocialHead subtitle="Collection Not Found" />
        <h1 className="text-xl font-weight-medium">
          We couldn’t find a collection with this address.
        </h1>
      </PageLayout>
    );
  }

  const attributes: { [key: string]: any } = {};
  for (const key of KEYS) {
    attributes[key] = collection[key];
  }

  const traits: { [key: string]: any } = {};
  if (collection.traits) {
    for (const entry of collection.traits) {
      traits[entry.trait_type] = entry.value;
    }
  }

  return (
    <PageLayout>
      <SocialHead subtitle={collection.name} />
      <div>
        <div className="collection-badge">Collection</div>
        <h1>{collection.name}</h1>
      </div>
      <div className="columns">
        <div>
          <h2 className="text-secondary">On-Chain Metadata</h2>
          <ValueList
            attributes={{
              address: collection.address,
              authority: collection.authority,
              authority_can_update: collection.authority_can_update,
              description: collection.description,
              minted_at: collection.minted_at,
            }}
          />
        </div>
        <div className="traits-column">
          <h2 className="text-secondary">Off-Chain Metadata</h2>
          <ValueList
            attributes={{
              image: collection.image,
              metadata_url: collection.metadata_url,
              ...traits,
            }}
          />
        </div>
      </div>

      {nftsInCollection && (
        <div className="nft-container mt-5">
          {nftsInCollection.map((nft) => (
            <Link href={`/nft/${nft.address}`} key={nft.address}>
              <a className="nft">
                {nft.image && (
                  <div className="image">
                    <SquareImage src={nft.image} size={400} alt={nft.name} />
                  </div>
                )}
                <div className="name">{nft.name}</div>
              </a>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .collection-badge {
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
          grid-template-columns: 1fr 1fr;
          grid-column-gap: 1rem;
        }

        .nft-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-column-gap: 1rem;
          grid-row-gap: 1.5rem;
        }

        .nft {
          display: block;
          transition: var(--transition);
        }

        .nft:hover {
          opacity: 0.95;
        }

        .nft .image {
          border-radius: var(--border-radius);
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .nft .name {
          color: var(--primary-color);
          margin-top: 0.5rem;
          font-size: var(--large-font-size);
          font-weight: var(--medium-font-weight);
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          .collection-badge {
            margin-left: 0;
          }

          .columns {
            grid-template-columns: 1fr;
          }

          .nft-container {
            grid-template-columns: repeat(2, 1fr);
          }

          .traits-column {
            margin-top: 1.5rem;
          }
        }

        @media (max-width: ${ResponsiveBreakpoint.small}) {
          .nft-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </PageLayout>
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
