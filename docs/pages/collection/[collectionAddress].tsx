import { GetServerSideProps } from "next";
import { NftokenFetcher } from "../../utils/NftokenFetcher";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { Network } from "@glow-app/glow-client";

export default function CollectionPage({
  initialCollection,
}: {
  initialCollection: NftokenTypes.Collection;
}) {
  console.log(initialCollection);

  return null;
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
