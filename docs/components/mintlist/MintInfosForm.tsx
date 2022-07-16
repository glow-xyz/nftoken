import { Network } from "@glow-xyz/glow-client";
import { NFTOKEN_MINTLIST_ADD_MINT_INFOS_V1 } from "@glow-xyz/nftoken-js";
import { GTransaction, SolanaClient } from "@glow-xyz/solana-client";
import TrashIcon from "@luma-team/lux-icons/feather/trash-2.svg";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import chunk from "lodash/chunk";
import pLimit from "p-limit";
import React, { useRef, useState } from "react";
import FileIcon from "../../icons/feather/FileIcon.svg";
import { NFTOKEN_ADDRESS } from "../../utils/constants";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { NETWORK_TO_RPC } from "../../utils/rpc-types";
import { toastLoading, toastSuccess } from "../../utils/toast";
import { uploadJsonToS3 } from "../../utils/upload-file";
import { ButtonSwitcher } from "../atoms/ButtonSwitcher";
import { CsvDropZone } from "../forms/CsvDropZone";
import { SimpleDropZone } from "../forms/SimpleDropZone";
import { InteractiveWell } from "../nft/InteractiveWell";
import { LuxButton, LuxSubmitButton } from "../atoms/LuxButton";
import { LuxInputField } from "../atoms/LuxInput";
import { MINT_INFOS_PER_TX } from "./mintlist-utils";

const OFFCHAIN_METADATA_UPLOAD_TOAST_ID = "uploading-nfts-metadata";
type MintInfosFormData = {
  mint_infos: Partial<NftokenTypes.Metadata>[];
};

export function MintInfosUploader({
  mintlist,
  network,
}: {
  mintlist: NftokenTypes.MintlistInfo;
  network: Network;
}) {
  const [mode, setMode] = useState<"csv" | "rows">("rows");
  const uploadedMetadataCountRef = useRef(0);

  const availableToUpload =
    mintlist.num_nfts_total - mintlist.mint_infos.length;

  const initialValues: MintInfosFormData = {
    mint_infos: [{ name: "", image: "" }],
  };

  return (
    <>
      <InteractiveWell title="Upload NFTs">
        <Formik
          initialValues={initialValues}
          onSubmit={async ({ mint_infos }, { resetForm }) => {
            const { address: wallet } = await window.glow!.connect();

            uploadedMetadataCountRef.current = 0;

            const limit = pLimit(10);
            const mintInfoArgs = await Promise.all(
              mint_infos.map((metadata) =>
                limit(async () => {
                  const { file_url } = await uploadJsonToS3({
                    json: metadata,
                  });
                  uploadedMetadataCountRef.current += 1;

                  toastLoading(
                    <>
                      Uploading off-chain metadata&nbsp;
                      <span className="mono-number">
                        {uploadedMetadataCountRef.current}/{mint_infos.length}
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
              <div className="flex">
                <ButtonSwitcher
                  options={[
                    { label: "Enter NFTs", value: "rows" },
                    { label: "Upload CSV", value: "csv" },
                  ]}
                  setSelectedOption={({ value }) => setMode(value)}
                  selectedOptionValue={mode}
                />
              </div>

              <div className="my-3">
                {mode === "rows" && (
                  <MintInfoRows availableToUpload={availableToUpload} />
                )}

                {mode === "csv" && (
                  <DropCsvSection onDrop={() => setMode("rows")} />
                )}
              </div>

              <div className="mt-4 flex-center spread">
                <LuxSubmitButton
                  label={`Upload ${values.mint_infos.length} NFT${
                    values.mint_infos.length !== 1 ? "s" : ""
                  }`}
                  rounded
                  color="brand"
                />
              </div>
            </Form>
          )}
        </Formik>
      </InteractiveWell>
    </>
  );
}

const DropCsvSection = ({ onDrop }: { onDrop: () => void }) => {
  const { setValues } = useFormikContext<MintInfosFormData>();
  return (
    <div className={"flex-column gap-2"}>
      <CsvDropZone
        onDrop={(rows) => {
          const newMintInfos = rows.map((row) => ({
            name: row.name,
            image: row.image,
          }));
          setValues((values) => {
            return {
              ...values,
              mint_infos: [...values.mint_infos, ...newMintInfos].filter(
                (row) => row.name || row.image
              ),
            };
          });
          onDrop();
        }}
      />

      <LuxButton
        label={"Download CSV Template"}
        variant={"link"}
        href="/nfts-metadata-template.csv"
        className={"mt-2"}
        download
        icon={<FileIcon />}
      />
    </div>
  );
};

const MintInfoRows = ({ availableToUpload }: { availableToUpload: number }) => {
  const { values } = useFormikContext<MintInfosFormData>();
  return (
    <div>
      <FieldArray name="mint_infos">
        {({ insert, remove }) => (
          <div>
            <div className={"flex-column gap-3"}>
              {values.mint_infos.map((_, index) => (
                <div className="mint-info flex-center gap-3" key={index}>
                  <SimpleDropZone
                    fieldName={`mint_infos.${index}.image`}
                    size={60}
                  />

                  <LuxInputField
                    placeholder={`NFT Name #${String(index).padStart(3, "0")}`}
                    name={`mint_infos.${index}.name`}
                  />

                  <div>
                    <LuxButton
                      label={"Remove"}
                      onClick={() => remove(index)}
                      icon={<TrashIcon />}
                      iconPlacement={"icon-only"}
                      variant={"link"}
                    />
                  </div>
                </div>
              ))}
            </div>

            {values.mint_infos.length < availableToUpload && (
              <LuxButton
                label="Add Mint Info"
                size={"small"}
                type="button"
                variant="outline"
                color="secondary"
                className="mt-4 animated"
                onClick={() => {
                  insert(values.mint_infos.length, {
                    name: "",
                    image: "",
                  });
                }}
              />
            )}
          </div>
        )}
      </FieldArray>
    </div>
  );
};
