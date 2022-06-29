import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Network } from "@glow-app/glow-client";
import { Solana } from "@glow-app/solana-client";
import useSWR, { SWRResponse } from "swr";
import { NftokenFetcher } from "../../utils/NftokenFetcher";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { SocialHead } from "../../components/SocialHead";

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

export default function CollectionPage({
  initialCollection,
}: {
  initialCollection: NftokenTypes.Collection;
}) {
  const {
    query: { collectionAddress, network },
  } = useRouter();

  const { data } = useCollection({
    collectionAddress: collectionAddress as string,
    network: network ? (network as Network) : Network.Mainnet,
  });

  const collection = data ?? initialCollection;

  if (collection === undefined) {
    return <div>Loading...</div>;
  }

  if (collection === null) {
    return (
      <>
        <SocialHead subtitle="NFT Not Found" />
        <h1>We couldn’t find an NFToken with this address.</h1>
        <style jsx>{`
          h1 {
            font-size: 1.5rem;
            padding: 1rem;
          }
        `}</style>
      </>
    );
  }

  return JSON.stringify(collection);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { collectionAddress, network } = context.query;

  try {
    const initialCollection = await NftokenFetcher.getCollection({
      network: (network as Network) ?? Network.Mainnet,
      address: collectionAddress as string,
    });

    return { props: { initialCollection } };
  } catch (error: any) {
    return { props: { initialCollection: null } };
  }
};
