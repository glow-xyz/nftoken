import { Network } from "@glow-app/glow-client";
import { GTransaction, SolanaClient } from "@glow-app/solana-client";
import { FieldArray, Form, Formik } from "formik";
import chunk from "lodash/chunk";
import pLimit from "p-limit";
import React, { useRef } from "react";
import FileIcon from "../../icons/feather/FileIcon.svg";
import { NFTOKEN_ADDRESS } from "../../utils/constants";
import { NFTOKEN_MINTLIST_ADD_MINT_INFOS_V1 } from "../../utils/nft-borsh";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { NETWORK_TO_RPC } from "../../utils/rpc-types";
import { toastLoading, toastSuccess } from "../../utils/toast";
import { uploadJsonToS3 } from "../../utils/upload-file";
import { CsvDropZone } from "../forms/CsvDropZone";
import { ImageDropZone } from "../forms/ImageDropZone";
import { InteractiveWell } from "../InteractiveWell";
import { LuxButton, LuxSubmitButton } from "../LuxButton";
import { LuxInputField } from "../LuxInput";
import { LuxLink } from "../LuxLink";

const OFFCHAIN_METADATA_UPLOAD_TOAST_ID = "uploading-nfts-metadata";
type MintInfosFormData = {
  nfts: Partial<NftokenTypes.Metadata>[];
};

export function MintInfosUploader({
  mintlist,
  network,
  onSignOut,
}: {
  mintlist: NftokenTypes.MintlistInfo;
  network: Network;
  onSignOut: () => void;
}) {
  const uploadedMetadataCountRef = useRef(0);

  const mintInfosContainerRef = useRef<HTMLDivElement>(null);

  const availableToUpload =
    mintlist.num_nfts_total - mintlist.mint_infos.length;

  const initialValues: MintInfosFormData = {
    nfts: [{ name: "", image: "" }],
  };

  return (
    <>
      <InteractiveWell title="Upload NFTs">
        <Formik
          initialValues={initialValues}
          onSubmit={async ({ nfts }, { resetForm }) => {
            const { address: wallet } = await window.glow!.connect();

            uploadedMetadataCountRef.current = 0;

            const limit = pLimit(10);
            const mintInfoArgs = await Promise.all(
              nfts.map((metadata) =>
                limit(async () => {
                  const { file_url } = await uploadJsonToS3({
                    json: metadata,
                  });
                  uploadedMetadataCountRef.current += 1;

                  toastLoading(
                    <>
                      Uploading off-chain metadata&nbsp;
                      <span className="mono">
                        {uploadedMetadataCountRef.current}/{nfts.length}
                      </span>
                    </>,
                    OFFCHAIN_METADATA_UPLOAD_TOAST_ID
                  );

                  return { metadata_url: file_url };
                })
              )
            );

            uploadedMetadataCountRef.current = 0;
            toastSuccess(
              `Uploading off-chain metadata. Done`,
              "uploading-nfts-metadata"
            );

            const recentBlockhash = await SolanaClient.getRecentBlockhash({
              rpcUrl: NETWORK_TO_RPC[network],
            });

            const transactionsBase64 = chunk(
              mintInfoArgs,
              MINT_INFOS_PER_TX
            ).map((mintInfoArgsBatch, batchIndex) => {
              const currentNftCount =
                mintlist.mint_infos.length + batchIndex * MINT_INFOS_PER_TX;

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
                      current_nft_count: currentNftCount,
                      ix: null,
                      mint_infos: mintInfoArgsBatch,
                    }).toString("base64"),
                  },
                ],
              });

              return GTransaction.toBuffer({
                gtransaction: tx,
              }).toString("base64");
            });

            try {
              // @ts-ignore
              await window.glow!.signAndSendAllTransactions({
                transactionsBase64,
                replaceBlockhash: true,
                network: network,
              });

              resetForm({ values: initialValues });
            } catch (err) {
              console.error(err);
            }
          }}
        >
          {({ values }) => (
            <Form>
              <div className="mb-4">
                <CsvDropZone fieldName="nfts" />
                <LuxLink href="/nfts-metadata-template.csv" download>
                  <div className="download-link mt-2">
                    <FileIcon />
                    Download CSV Template
                  </div>
                </LuxLink>
              </div>

              <div className="mb-4 text-center">or upload NFTs manually</div>

              <div ref={mintInfosContainerRef} className="mint-infos">
                <FieldArray name="nfts">
                  {({ insert }) => (
                    <>
                      {values.nfts.map((_, index) => (
                        <div className="mint-info" key={index}>
                          <ImageDropZone
                            label="NFT Image"
                            fieldName={`nfts.${index}.image`}
                          />
                          <LuxInputField
                            label="Name"
                            placeholder={`Item #${String(index).padStart(
                              4,
                              "0"
                            )}`}
                            name={`nfts.${index}.name`}
                          />
                        </div>
                      ))}
                      {values.nfts.length < availableToUpload && (
                        <LuxButton
                          label="Add Row"
                          type="button"
                          className="add-nft-button animated"
                          onClick={() => {
                            insert(values.nfts.length, {
                              name: "",
                              image: "",
                            });

                            // Give it time to render.
                            queueMicrotask(() => {
                              if (!mintInfosContainerRef.current) {
                                return;
                              }

                              mintInfosContainerRef.current.scrollTop =
                                mintInfosContainerRef.current.scrollHeight;
                            });
                          }}
                        />
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
        .mint-infos {
          max-height: 24rem;
          overflow: scroll;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .mint-info {
          width: 100%;
          display: flex;
          gap: 1rem;
        }

        .download-link {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.2rem;
        }

        .mono {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </>
  );
}
