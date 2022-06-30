import { Network } from "@glow-app/glow-client";
import { Solana, SolanaClient } from "@glow-app/solana-client";
import axios from "axios";
import bs58 from "bs58";
import sortBy from "lodash/sortBy";
import uniq from "lodash/uniq";
import pLimit from "p-limit";
import { NFTOKEN_ADDRESS } from "./constants";
import {
  NFTOKEN_COLLECTION_ACCOUNT,
  NFTOKEN_MINTLIST_ACCOUNT,
  NFTOKEN_NFT_ACCOUNT,
} from "./nft-borsh";
import { NftokenTypes } from "./NftokenTypes";
import { NETWORK_TO_RPC } from "./rpc-types";

export namespace NftokenFetcher {
  export const getAllNfts = async ({
    network,
  }: {
    network: Network;
  }): Promise<NftokenTypes.NftInfo[]> => {
    const accounts = await SolanaClient.getProgramAccounts({
      program: NFTOKEN_ADDRESS,
      rpcUrl: NETWORK_TO_RPC[network],
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode(Buffer.from("21b45b35ec0f3f61", "hex")),
          },
        },
      ],
    });

    const nftoken_accounts: Array<
      NftokenTypes.Nft & { address: Solana.Address; network: Network }
    > = [];

    for (const account of accounts) {
      const parsed = NFTOKEN_NFT_ACCOUNT.parse({ buffer: account.buffer });

      if (!parsed) {
        continue;
      }

      nftoken_accounts.push({
        address: account.pubkey,
        holder: parsed.holder,
        authority: parsed.authority,
        authority_can_update: parsed.authority_can_update,
        network,
        metadata_url: parsed.metadata_url,
        collection: parsed.collection,
        delegate: parsed.delegate,
      });
    }

    const metadataMap = await getMetadataMap({
      urls: nftoken_accounts.map((acc) => acc.metadata_url),
    });

    const nfts = nftoken_accounts.map((acc) => ({
      api_id: acc.address,
      standard: "nftoken" as const,
      ...acc,
      ...(metadataMap.get(acc.metadata_url!) || {}),
    }));

    return sortBy(nfts, "address").reverse();
  };

  export const getNftsForWallet = async ({
    wallet,
    network,
  }: {
    wallet: Solana.Address;
    network: Network;
  }): Promise<NftokenTypes.NftInfo[]> => {
    const accounts = await SolanaClient.getProgramAccounts({
      program: NFTOKEN_ADDRESS,
      rpcUrl: NETWORK_TO_RPC[network],
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode(Buffer.from("21b45b35ec0f3f61", "hex")),
          },
        },
        {
          memcmp: {
            // Account discriminator + version number
            offset: 8 + 1,
            bytes: wallet,
          },
        },
      ],
    });

    const parsed_accounts = accounts.flatMap((account) => {
      const parsed = NFTOKEN_NFT_ACCOUNT.parse({ buffer: account.buffer });
      if (!parsed) {
        return [];
      }
      return {
        address: account.pubkey,
        ...parsed,
      };
    });
    const metadata_urls = parsed_accounts.map((a) => a.metadata_url);
    const metadataMap = await getMetadataMap({ urls: metadata_urls });

    return sortBy(
      parsed_accounts.map((account) => ({
        ...account,
        ...metadataMap.get(account.metadata_url),
      })),
      "address"
    );
  };

  export const getNftsInCollection = async ({
    network,
    collection,
  }: {
    network: Network;
    collection: Solana.Address;
  }): Promise<NftokenTypes.NftInfo[]> => {
    const accounts = await SolanaClient.getProgramAccounts({
      program: NFTOKEN_ADDRESS,
      rpcUrl: NETWORK_TO_RPC[network],
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode(Buffer.from("21b45b35ec0f3f61", "hex")),
          },
        },
        {
          memcmp: {
            offset:
              8 + // discriminator
              1 + // version
              32 + // holder
              32 + // authority
              1, // authority_can_update
            bytes: collection,
          },
        },
      ],
    });

    const parsed_accounts = accounts.flatMap((account) => {
      const parsed = NFTOKEN_NFT_ACCOUNT.parse({ buffer: account.buffer });
      if (!parsed) {
        return [];
      }
      return {
        address: account.pubkey,
        ...parsed,
      };
    });

    const metadata_urls = parsed_accounts.map((a) => a.metadata_url);
    const metadataMap = await getMetadataMap({ urls: metadata_urls });

    return sortBy(
      parsed_accounts.map((account) => ({
        ...account,
        ...metadataMap.get(account.metadata_url),
      })),
      "address"
    );
  };

  export const getNft = async ({
    address,
    network = Network.Mainnet,
  }: {
    address: NftokenTypes.Nft["address"];
    network?: Network | null;
  }): Promise<NftokenTypes.NftInfo | null> => {
    const account = await SolanaClient.getBorshAccountInfo({
      address,
      rpcUrl:
        NETWORK_TO_RPC[network as Network] ?? NETWORK_TO_RPC[Network.Mainnet],
      format: NFTOKEN_NFT_ACCOUNT,
    });

    if (!account) {
      return null;
    }

    // Assert owner is the Nftoken program
    if (account.owner !== NFTOKEN_ADDRESS) {
      throw new Error("Invalid nftoken account owner.");
    }

    const nft = account.data;
    const metadataMap = await getMetadataMap({
      urls: [nft.metadata_url],
    });

    return {
      address,
      ...nft,
      ...metadataMap.get(nft.metadata_url),
    };
  };

  export const getCollection = async ({
    address,
    network,
  }: {
    address: NftokenTypes.Collection["address"];
    network: Network;
  }): Promise<NftokenTypes.CollectionInfo | null> => {
    const account = await SolanaClient.getBorshAccountInfo({
      address,
      rpcUrl: NETWORK_TO_RPC[network],
      format: NFTOKEN_COLLECTION_ACCOUNT,
    });

    if (!account) {
      return null;
    }

    const metadata = await getMetadata({ url: account.data.metadata_url });

    return {
      address,
      network,
      ...account.data,
      ...metadata,
    };
  };

  export const getAllCollections = async ({
    network,
  }: {
    network: Network;
  }): Promise<NftokenTypes.CollectionInfo[]> => {
    const accounts = await SolanaClient.getProgramAccounts({
      program: NFTOKEN_ADDRESS,
      rpcUrl: NETWORK_TO_RPC[network],
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode(Buffer.from("4502f0037612d9f2", "hex")),
          },
        },
      ],
    });

    const collectionAccounts: NftokenTypes.Collection[] = accounts.flatMap(
      (account) => {
        const parsed = NFTOKEN_COLLECTION_ACCOUNT.parse({
          buffer: account.buffer,
        });
        if (!parsed) {
          return [];
        }

        return {
          address: account.pubkey,
          network,
          authority: parsed.authority,
          authority_can_update: parsed.authority_can_update,
          metadata_url: parsed.metadata_url,
        };
      }
    );

    const urls = collectionAccounts.map((c) => c.metadata_url);
    const metadataMap = await getMetadataMap({
      urls,
    });

    return collectionAccounts.map((c) => ({
      ...c,
      ...(metadataMap.get(c.metadata_url!) ?? {}),
    }));
  };

  /**
   * Get either all globally created mintlists, or if `wallet` is provided,
   * only the mintlists where the `authority` is the `wallet`.
   */
  export const getAllMintlists = async ({
    wallet,
    network,
  }: {
    wallet?: string;
    network: Network;
  }): Promise<NftokenTypes.MintlistInfo[]> => {
    const filters = [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(Buffer.from("86a4166f558e09f1", "hex")),
        },
      },
    ];

    if (wallet) {
      filters.push({
        memcmp: {
          // Account discriminator + version number
          offset: 8 + 1,
          bytes: wallet,
        },
      });
    }

    const accounts = await SolanaClient.getProgramAccounts({
      program: NFTOKEN_ADDRESS,
      rpcUrl: NETWORK_TO_RPC[network],
      filters,
    });

    const mintlists: NftokenTypes.Mintlist[] = accounts.flatMap((account) => {
      const parsed = NFTOKEN_MINTLIST_ACCOUNT.parse({ buffer: account.buffer });

      if (!parsed) {
        return [];
      }

      return {
        address: account.pubkey,
        ...parsed,
        minting_order: parsed.minting_order === 0 ? "sequential" : "random",
        go_live_date: parsed.go_live_date.toISO(),
        created_at: parsed.created_at.toISO(),
      };
    });

    const urls = mintlists.map((c) => c.metadata_url);
    const metadataMap = await getMetadataMap({
      urls,
    });
    const mintlistInfos = mintlists.map((m) => ({
      ...m,
      ...(metadataMap.get(m.metadata_url!) ?? {}),
    }));

    return sortBy(mintlistInfos, "address").reverse();
  };

  export const getMintlist = async ({
    address,
    network,
  }: {
    address: NftokenTypes.Mintlist["address"];
    network: Network;
  }): Promise<NftokenTypes.MintlistInfo | null> => {
    const account = await SolanaClient.getBorshAccountInfo({
      address,
      rpcUrl: NETWORK_TO_RPC[network],
      format: NFTOKEN_MINTLIST_ACCOUNT,
    });

    if (!account) {
      return null;
    }

    const metadata = await getMetadata({
      url: account.data.metadata_url,
    });

    return {
      address,
      ...account.data,
      minting_order: account.data.minting_order === 0 ? "sequential" : "random",
      go_live_date: account.data.go_live_date.toISO(),
      created_at: account.data.created_at.toISO(),
      ...(metadata ?? {}),
    };
  };

  export const getMetadata = async ({
    url,
  }: {
    url: string | null | undefined;
  }): Promise<NftokenTypes.Metadata | null> => {
    if (!url) {
      return null;
    }

    const metadataMap = await getMetadataMap({
      urls: [url],
    });
    return metadataMap.get(url) ?? null;
  };

  const getMetadataMap = async ({
    urls: _urls,
  }: {
    urls: Array<string | null | undefined>;
  }): Promise<Map<string, NftokenTypes.Metadata | null>> => {
    const urls = uniq(_urls.filter((url): url is string => Boolean(url)));

    const metadataMap = new Map<string, NftokenTypes.Metadata | null>();

    const limit = pLimit(5);
    const promises = urls.map((url) =>
      limit(async () => {
        try {
          const { data } = await axios.get(url, {
            timeout: 5_000,
          });
          const metadata = NftokenTypes.MetadataZ.partial().parse(data);
          metadataMap.set(url, {
            name: metadata.name ?? "",
            description: metadata.description ?? null,
            image: metadata.image ?? "",
            traits: metadata.traits ?? [],
            minted_at: metadata.minted_at ?? null,
            animation_url: metadata.animation_url ?? null,
            external_url: metadata.external_url ?? null,
          });
        } catch {
          metadataMap.set(url, null);
        }
      })
    );
    await Promise.all(promises);

    return metadataMap;
  };
}
