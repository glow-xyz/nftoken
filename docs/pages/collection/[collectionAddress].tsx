import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Network } from "@glow-app/glow-client";
import { Solana } from "@glow-app/solana-client";
import useSWR, { SWRResponse } from "swr";
import { NftokenFetcher } from "../../utils/NftokenFetcher";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { SocialHead } from "../../components/SocialHead";
import { PageLayout } from "../../components/PageLayout";
import { NftAttributeList } from "../../components/NftAttributeList";
import { ResponsiveBreakpoint } from "../../utils/style-constants";

const useCollection = ({
  collectionAddress,
  network,
}: {
  collectionAddress: Solana.Address;
  network: Network;
}): {
  // We can be confident that data will be nonnull even if the request fails,
  // if we defined fallbackData in the config.
  data: NftokenTypes.Collection | null;
  error: any;
  mutate: SWRResponse<NftokenTypes.Collection | null, never>["mutate"];
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
  data: NftokenTypes.NftInfo[] | null;
  error: any;
  mutate: SWRResponse<NftokenTypes.NftInfo[] | null, never>["mutate"];
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

const KEYS: (keyof NftokenTypes.Collection)[] = [
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
  initialCollection: NftokenTypes.Collection;
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
      <>
        <SocialHead subtitle="NFT Not Found" />
        <h1>We couldn’t find a collection with this address.</h1>
        <style jsx>{`
          h1 {
            font-size: 1.5rem;
            padding: 1rem;
          }
        `}</style>
      </>
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
      <div className="columns">
        <div>
          <div className="collection-badge">Collection</div>
          <h1>{collection.name}</h1>
          <NftAttributeList attributes={attributes} />
        </div>
        <div className="traits-column">
          <h2>Traits</h2>
          {collection.traits && collection.traits.length > 0 ? (
            <NftAttributeList attributes={traits} />
          ) : (
            <div className="trait-empty-state">No traits set.</div>
          )}
        </div>
      </div>

      {nftsInCollection && (
        <div className="nft-container mt-5">
          {nftsInCollection.map((nft) => (
            <a href={`/nft/${nft.address}`} key={nft.address} className="nft">
              <img src={nft.image} alt={nft.name} className="nft" />
            </a>
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
          grid-template-columns: 1.5fr 1fr;
          grid-column-gap: 1rem;
        }

        .traits-column {
          margin-top: 2.35rem;
        }

        .nft-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          grid-gap: 1rem;
        }

        .nft {
          display: block;
          transition: var(--transition);
        }

        .nft:hover {
          opacity: 0.95;
        }

        .nft img {
          display: block;
          width: 100%;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          .collection-badge {
            margin-left: 0;
          }

          .columns {
            grid-template-columns: 1fr;
          }

          .traits-column {
            margin-top: 1.5rem;
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
