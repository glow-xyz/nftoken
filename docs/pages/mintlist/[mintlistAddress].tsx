import React, { useState } from "react";
import {
  GKeypair,
  GPublicKey,
  GTransaction,
  Solana,
  SolanaClient,
} from "@glow-app/solana-client";
import { Network } from "@glow-app/glow-client";
import { useRouter } from "next/router";
import { PlusIcon } from "@heroicons/react/outline";
import useSWR from "swr";
import classNames from "classnames";
import { DateTime } from "luxon";
import { PageLayout } from "../../components/PageLayout";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { useNetworkContext } from "../../components/NetworkContext";
import { NftokenFetcher } from "../../utils/NftokenFetcher";
import { SolanaAddress } from "../../components/SolanaAddress";
import { ExternalLink } from "../../components/ExternalLink";
import { ChevronLeftIcon, ExternalLinkIcon } from "@heroicons/react/outline";
import { ResponsiveBreakpoint } from "../../utils/style-constants";
import { GlowSignInButton, useGlowContext } from "@glow-app/glow-react";
import { LuxButton, LuxSubmitButton } from "../../components/LuxButton";
import { InteractiveWell } from "../../components/InteractiveWell";
import { FieldArray, Form, Formik } from "formik";
import { LuxInputField } from "../../components/LuxInput";
import { ImageDropZone } from "../../components/forms/ImageDropZone";
import { uploadJsonToS3 } from "../../utils/upload-file";
import { NETWORK_TO_RPC } from "../../utils/rpc-types";
import {
  NFTOKEN_MINTLIST_ADD_MINT_INFOS_V1,
  NFTOKEN_MINTLIST_MINT_NFT_V1,
} from "../../utils/nft-borsh";
import {
  LAMPORTS_PER_SOL,
  NFTOKEN_ADDRESS,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_SLOT_HASHES_PUBKEY,
} from "../../utils/constants";

const MAX_NFTS_PER_BATCH = 10;

type ATTRIBUTE_KEY = keyof NftokenTypes.MintlistInfo;
type ATTRIBUTE_TYPE = "address" | "link" | "unix_timestamp" | "amount";
const KEYS: { key: ATTRIBUTE_KEY; type?: ATTRIBUTE_TYPE }[] = [
  { key: "address", type: "address" },
  { key: "authority", type: "address" },
  { key: "treasury_sol", type: "address" },
  { key: "go_live_date", type: "unix_timestamp" },
  { key: "created_at", type: "unix_timestamp" },
  { key: "metadata_url", type: "link" },
  { key: "collection", type: "address" },
  { key: "price", type: "amount" },
  { key: "minting_order" },
  // We will handle the ones below manually
  // { key: "num_nfts_total" },
  // { key: "num_nfts_redeemed" },
];

export default function MintlistPage() {
  const { query } = useRouter();
  const mintlistAddress = query.mintlistAddress as Solana.Address;

  const { user, glowDetected, signOut } = useGlowContext();

  const networkContext = useNetworkContext();
  const network = (query.network || networkContext.network) as Network;

  const { data } = useMintlist({ address: mintlistAddress, network });

  const isAuthority = user && data?.mintlist.authority === user.address;

  const showUploader =
    data && data.mintlist.mint_infos.length < data.mintlist.num_nfts_total;

  return (
    <>
      <PageLayout>
        {data && (
          <>
            {user && (
              <div className="navigation">
                <LuxButton
                  label="Back to Mintlists"
                  icon={<ChevronLeftIcon />}
                  href="/mintlists"
                  iconPlacement="left"
                  rounded
                  variant="link"
                  color="brand"
                />
              </div>
            )}
            <h1>{data.mintlist.name}</h1>

            {/* Minting Section */}
            {data.mintlist.mint_infos.length ===
              data.mintlist.num_nfts_total && (
              <div className="mb-4">
                {!glowDetected && (
                  <p>
                    You’ll need to install{" "}
                    <a href="https://glow.app/download" target="_blank">
                      Glow
                    </a>{" "}
                    in order to mint an NFT.
                  </p>
                )}
                {glowDetected &&
                  (user ? (
                    <MintButton mintlist={data.mintlist} network={network} />
                  ) : (
                    <GlowSignInButton variant="purple" />
                  ))}
              </div>
            )}

            <div className="columns mb-4">
              <div className="collection">
                {data.collection && (
                  <>
                    <h2>Collection</h2>
                    {data.collection.image ? (
                      <figure>
                        <img
                          alt={data.collection.name}
                          src={data.collection.image}
                        />
                        <figcaption>{data.collection.name}</figcaption>
                      </figure>
                    ) : (
                      <h3>{data.collection.name}</h3>
                    )}
                  </>
                )}
              </div>

              <div>
                <h2>On-Chain Data</h2>
                <div className="table">
                  {KEYS.map(({ key, type }) => {
                    return (
                      <React.Fragment key={key}>
                        <div className="key">{key}</div>
                        {type === "address" ? (
                          <div className="solana-address flex-center flex-wrap">
                            <SolanaAddress
                              address={data.mintlist[key]?.toString()}
                            />
                          </div>
                        ) : type === "link" ? (
                          <div className="link">
                            <ExternalLink href={data.mintlist[key]!.toString()}>
                              <span>{data.mintlist[key]!.toString()}</span>{" "}
                              <ExternalLinkIcon />
                            </ExternalLink>
                          </div>
                        ) : type === "amount" ? (
                          <div>
                            {parseInt(
                              (data.mintlist[key] as { lamports: string })
                                .lamports
                            ) /
                              LAMPORTS_PER_SOL +
                              " SOL"}
                          </div>
                        ) : type === "unix_timestamp" ? (
                          <div>
                            {DateTime.fromISO(
                              data.mintlist[key]! as string
                            ).toLocaleString({
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                        ) : (
                          <div>
                            {typeof data.mintlist[key] === "string"
                              ? data.mintlist[key]?.toString()
                              : JSON.stringify(data.mintlist[key])}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                  <div className="key">nfts_uploaded</div>
                  <div>{data.mintlist.mint_infos.length}</div>
                  <div className="key">nfts_total</div>
                  <div>{data.mintlist.num_nfts_total}</div>
                  <div className="key">nfts_minted</div>
                  <div>{data.mintlist.num_nfts_redeemed}</div>
                </div>
              </div>
            </div>

            <div>
              <h2>NFTs</h2>
              {isAuthority && showUploader && (
                <div className="mb-4">
                  <div className="mb-2">
                    NOTE: You can upload up to {MAX_NFTS_PER_BATCH} NFTs at
                    once.
                  </div>
                  <NftsUploader
                    mintlist={data.mintlist}
                    network={network}
                    onSignOut={signOut}
                  />
                </div>
              )}

              <NftsGrid mintInfos={data.mintlist.mint_infos} />
            </div>
          </>
        )}
      </PageLayout>
      <style jsx>{`
        .navigation {
          margin-bottom: 2rem;
        }

        .columns {
          display: grid;
          grid-template-columns: 20rem 1fr;
          grid-column-gap: 3rem;
        }

        .table {
          padding: 0.75rem;
          border-radius: var(--border-radius);
          background-color: var(--secondary-bg-color);
          font-family: var(--mono-font);
          font-weight: var(--medium-font-weight);
          overflow-wrap: anywhere;

          display: grid;
          grid-template-columns: max-content 1fr;
          grid-column-gap: 2rem;
        }

        .table .key {
          font-weight: var(--normal-font-weight);
          color: var(--secondary-color);
          max-width: 8.5rem; /* This width cuts "authority_can_update" in a nice way */
        }

        img {
          display: block;
          width: 100%;
          box-shadow: var(--shadow);
          border-radius: calc(var(--border-radius) * 2);
        }

        figcaption {
          margin-top: 1rem;
          text-align: center;
          font-weight: bold;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          img {
            max-width: 24rem;
            margin: 0 auto;
          }

          h1,
          h2 {
            text-align: center;
            margin-bottom: 1.5rem;
          }

          .columns {
            grid-template-columns: 1fr;
            grid-row-gap: 1.5rem;
          }

          .collection {
            // Push the collection section to the bottom.
            order: 1;
          }
        }
      `}</style>
    </>
  );
}

type MintlistAndCollection = {
  mintlist: NftokenTypes.MintlistInfo;
  collection: NftokenTypes.CollectionInfo | null;
};

function useMintlist({
  address,
  network,
}: {
  address: Solana.Address;
  network: Network;
}): {
  data?: MintlistAndCollection | null;
  error: any;
} {
  const swrKey = [address, network];
  const { data, error } = useSWR(swrKey, async () => {
    const mintlist = await NftokenFetcher.getMintlist({ address, network });

    if (!mintlist) {
      return null;
    }

    const collection = await NftokenFetcher.getCollection({
      address: mintlist.collection,
      network,
    });

    return {
      mintlist,
      collection,
    };
  });

  return { data, error };
}

function MintButton({
  mintlist,
  network,
}: {
  mintlist: NftokenTypes.Mintlist;
  network: Network;
}) {
  const [minting, setMinting] = useState(false);

  return (
    <LuxButton
      label="Mint NFT"
      disabled={minting}
      onClick={async () => {
        setMinting(true);

        const { address: wallet } = await window.glow!.connect();

        const recentBlockhash = await SolanaClient.getRecentBlockhash({
          rpcUrl: NETWORK_TO_RPC[network],
        });

        const nftKeypair = GKeypair.generate();

        const tx = GTransaction.create({
          feePayer: wallet,
          recentBlockhash,
          instructions: [
            {
              accounts: [
                // signer
                {
                  address: wallet,
                  signer: true,
                  writable: true,
                },
                // nft
                { address: nftKeypair.address, signer: true, writable: true },
                // mintlist
                { address: mintlist.address, writable: true },
                // treasury_sol
                {
                  address: mintlist.treasury_sol,
                  writable: true,
                },
                // System Program
                {
                  address: GPublicKey.default.toBase58(),
                },
                // Clock Sysvar
                {
                  address: SYSVAR_CLOCK_PUBKEY,
                },
                // SlotHashes
                {
                  address: SYSVAR_SLOT_HASHES_PUBKEY,
                },
              ],
              program: NFTOKEN_ADDRESS,
              data_base64: NFTOKEN_MINTLIST_MINT_NFT_V1.toBuffer({
                ix: null,
              }).toString("base64"),
            },
          ],
          signers: [nftKeypair],
        });

        try {
          await window.glow!.signAndSendTransaction({
            transactionBase64: GTransaction.toBuffer({
              gtransaction: tx,
            }).toString("base64"),
            network: network,
          });
        } catch (err) {
          console.error(err);
        }

        setMinting(false);
      }}
    />
  );
}

type NftConfig = { name: string; image: string };

type FormData = {
  nfts: NftConfig[];
};

function NftsUploader({
  mintlist,
  network,
  onSignOut,
}: {
  mintlist: NftokenTypes.MintlistInfo;
  network: Network;
  onSignOut: () => void;
}) {
  const availableToUpload =
    mintlist.num_nfts_total - mintlist.mint_infos.length;

  const initialValues: FormData = {
    nfts: [{ name: "", image: "" }],
  };

  return (
    <>
      <InteractiveWell title="Upload NFTs">
        <Formik
          initialValues={initialValues}
          onSubmit={async ({ nfts }, { resetForm }) => {
            const { address: wallet } = await window.glow!.connect();

            const mintInfoArgs: NftokenTypes.MintInfoArg[] = await Promise.all(
              nfts.map(async ({ name, image }) => {
                const { file_url } = await uploadJsonToS3({
                  json: { name, image },
                });

                return { metadata_url: file_url };
              })
            );

            const recentBlockhash = await SolanaClient.getRecentBlockhash({
              rpcUrl: NETWORK_TO_RPC[network],
            });

            const tx = GTransaction.create({
              feePayer: wallet,
              recentBlockhash,
              instructions: [
                {
                  accounts: [
                    // mintlist
                    {
                      address: mintlist.address,
                      signer: false,
                      writable: true,
                    },
                    // authority
                    { address: wallet, signer: true, writable: true },
                  ],
                  program: NFTOKEN_ADDRESS,
                  data_base64: NFTOKEN_MINTLIST_ADD_MINT_INFOS_V1.toBuffer({
                    current_nft_count: mintlist.mint_infos.length,
                    ix: null,
                    mint_infos: mintInfoArgs,
                  }).toString("base64"),
                },
              ],
            });

            try {
              await window.glow!.signAndSendTransaction({
                transactionBase64: GTransaction.toBuffer({
                  gtransaction: tx,
                }).toString("base64"),
                network: network,
              });
              resetForm({ values: initialValues });
            } catch (err) {
              console.error(err);
            }
          }}
        >
          {({ values, isValid }) => (
            <Form>
              <div className="grid">
                <FieldArray name="nfts">
                  {({ insert }) => (
                    <>
                      {values.nfts.map((_, index) => (
                        <div key={index}>
                          <div className="mb-4">
                            <LuxInputField
                              placeholder="Name"
                              name={`nfts.${index}.name`}
                              required
                            />
                          </div>

                          <ImageDropZone
                            label="NFT Image"
                            fieldName={`nfts.${index}.image`}
                          />
                        </div>
                      ))}
                      {values.nfts.length <= MAX_NFTS_PER_BATCH &&
                        values.nfts.length < availableToUpload && (
                          <button
                            type="button"
                            className="add-nft-button animated"
                            onClick={() =>
                              insert(values.nfts.length, {
                                name: "",
                                image: "",
                              })
                            }
                          >
                            <PlusIcon
                              style={{
                                width: "2rem",
                                height: "2rem",
                              }}
                            />
                          </button>
                        )}
                    </>
                  )}
                </FieldArray>
              </div>
              <div className="mt-4 flex-center spread">
                <LuxSubmitButton
                  label={`Upload ${values.nfts.length} NFT${
                    values.nfts.length !== 1 ? "s" : ""
                  }`}
                  rounded
                  color="brand"
                  disabled={!(isValid && values.nfts.every((nft) => nft.image))}
                />
                <LuxButton
                  label="Disconnect Wallet"
                  onClick={onSignOut}
                  color="secondary"
                  size="small"
                  variant="link"
                />
              </div>
            </Form>
          )}
        </Formik>
      </InteractiveWell>
      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          column-gap: 1rem;
          row-gap: 2rem;
        }

        .add-nft-button {
          border: 1px solid var(--primary-border-color);
          border-radius: var(--border-radius);
          background-color: var(--faint-gray);
        }
        .add-nft-button:hover {
          background-color: var(--pale-gray);
        }
      `}</style>
    </>
  );
}

function NftsGrid({ mintInfos }: { mintInfos: NftokenTypes.MintInfo[] }) {
  const { data: metadataMap } = useMintInfosMetadata(mintInfos);

  if (!mintInfos.length) {
    return <div>No NFTs have been uploaded to this mintlist yet.</div>;
  }

  const mintInfosWithMetadata = mintInfos
    .filter(({ metadata_url }) => metadataMap.get(metadata_url))
    .map((mintInfo) => ({
      ...mintInfo,
      metadata: metadataMap.get(mintInfo.metadata_url)!,
    }));

  return (
    <>
      <div className="grid">
        {mintInfosWithMetadata.map((mintInfo) => (
          <figure className="nft-card" key={mintInfo.metadata_url}>
            <img
              className="nft-image"
              alt={mintInfo.metadata.name}
              src={mintInfo.metadata.image}
            />
            <figcaption>
              <div className="title">{mintInfo.metadata.name}</div>
              <div
                className={classNames([
                  "subtitle",
                  mintInfo.minted ? "status-minted" : "status-available",
                ])}
              >
                {mintInfo.minted ? "Minted" : "Available"}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          column-gap: 1rem;
          row-gap: 2rem;
        }

        .nft-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .nft-image {
          width: 100%;
          box-shadow: var(--shadow);
          border-radius: calc(var(--border-radius) * 2);
        }

        .title {
          font-weight: bold;
        }

        .subtitle {
          font-size: 0.8rem;
        }

        .status-available {
          color: var(--success-color);
        }

        .status-minted {
          color: var(--secondary-color);
        }
      `}</style>
    </>
  );
}

function useMintInfosMetadata(mintInfos: NftokenTypes.MintInfo[]): {
  data: Map<string, NftokenTypes.Metadata | null>;
  error: unknown;
} {
  const metadataUrls = mintInfos.map((mintInfo) => mintInfo.metadata_url);

  const swrKey = ["mintInfos", ...metadataUrls];

  const { data, error } = useSWR(swrKey, async () => {
    return await NftokenFetcher.getMetadataMap({
      urls: metadataUrls,
    });
  });

  return { data: data ?? new Map(), error };
}
