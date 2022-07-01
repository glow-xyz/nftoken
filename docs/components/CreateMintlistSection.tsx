import React from "react";
import { useGlowContext } from "@glow-app/glow-react";
import {
  GKeypair,
  GPublicKey,
  GTransaction,
  SolanaClient,
} from "@glow-app/solana-client";
import { Form, Formik, useFormikContext } from "formik";
import { DateTime } from "luxon";
import {
  LAMPORTS_PER_SOL,
  NFTOKEN_ADDRESS,
  SYSVAR_CLOCK_PUBKEY,
} from "../utils/constants";
import {
  NFTOKEN_MINTLIST_CREATE_IX,
  SYSTEM_CREATE_ACCOUNT_IX,
} from "../utils/nft-borsh";
import { LuxInputField } from "./LuxInput";
import { LuxButton, LuxSubmitButton } from "./LuxButton";
import { uploadJsonToS3 } from "../utils/upload-file";
import { DateTimePicker } from "./DateTimePicker";
import { LuxInputLabel } from "./LuxInputLabel";
import { ImageDropZone } from "./forms/ImageDropZone";
import { getMintlistAccountSize } from "../utils/mintlist";
import BN from "bn.js";
import { NETWORK_TO_RPC } from "../utils/rpc-types";
import { InteractiveWell } from "./InteractiveWell";
import { useNetworkContext } from "./NetworkContext";
import { useRouter } from "next/router";

type FormData = {
  mintlistName: string;
  collectionName: string;
  collectionImage: string;
  priceSol: number;
  goLiveDate: string;
  numNftsTotal: number;
};

export const CreateMintlistSection = () => {
  const { push } = useRouter();

  const { signOut } = useGlowContext();
  const { network } = useNetworkContext();

  const initialValues: FormData = {
    mintlistName: "",
    collectionName: "",
    collectionImage: "",
    priceSol: 1,
    goLiveDate: DateTime.now().toISO(),
    numNftsTotal: 1,
  };

  return (
    <InteractiveWell title="Live Demo" className="my-3">
      <Formik
        initialValues={initialValues}
        validateOnMount
        onSubmit={async ({
          mintlistName,
          collectionName,
          collectionImage,
          priceSol,
          numNftsTotal,
          goLiveDate,
        }) => {
          const goLiveDateTime = DateTime.fromISO(goLiveDate);

          const { file_url: mintlistMetadataUrl } = await uploadJsonToS3({
            json: { name: mintlistName },
          });

          const { file_url: collectionMetadataUrl } = await uploadJsonToS3({
            json: { name: collectionName, image: collectionImage },
          });

          const { address: wallet } = await window.glow!.connect();

          const mintlistKeypair = GKeypair.generate();
          const collectionKeypair = GKeypair.generate();

          const mintlistAccountSize = getMintlistAccountSize(numNftsTotal);

          const rpcUrl = NETWORK_TO_RPC[network];

          const { lamports: mintlistAccountLamports } =
            await SolanaClient.getMinimumBalanceForRentExemption({
              dataLength: mintlistAccountSize.toNumber(),
              rpcUrl,
            });

          const recentBlockhash = await SolanaClient.getRecentBlockhash({
            rpcUrl,
          });

          const tx = createMintlistCreateTx({
            wallet,
            recentBlockhash,
            mintlistKeypair,
            mintlistAccountLamports,
            mintlistAccountSize,
            collectionKeypair,
            goLiveDate: goLiveDateTime,
            priceSol,
            numNftsTotal,
            mintlistMetadataUrl,
            collectionMetadataUrl,
          });

          try {
            await window.glow!.signAndSendTransaction({
              transactionBase64: GTransaction.toBuffer({
                gtransaction: tx,
              }).toString("base64"),
              network,
            });

            push(`/mintlist/${mintlistKeypair.address}`);
          } catch (err) {
            console.error(err);
          }
        }}
      >
        <Form>
          <div className="mb-4">
            <LuxInputField
              label="Mintlist Name"
              name="mintlistName"
              placeholder="Mintlist #1"
              required
            />
          </div>
          <div className="mb-4">
            <LuxInputField
              label="Collection Name"
              name="collectionName"
              placeholder="Fancy Turtles"
              required
            />
          </div>
          <ImageDropZone<FormData>
            label="Collection Avatar"
            fieldName="collectionImage"
          />
          <div className="mb-4">
            <LuxInputField
              label="Price (SOL)"
              name="priceSol"
              type="number"
              required
            />
          </div>
          <div className="mb-4">
            <LuxInputField
              label="Total Number of NFTs"
              name="numNftsTotal"
              type="number"
              inputProps={{ min: 1, step: 1 }}
              required
            />
          </div>
          <div className="mb-4">
            <DatePickerField label="Go Live Date" fieldName="goLiveDate" />
          </div>

          <div className="mt-4 flex-center spread">
            <SubmitButton />
            <LuxButton
              label="Disconnect Wallet"
              onClick={signOut}
              color="secondary"
              size="small"
              variant="link"
            />
          </div>
        </Form>
      </Formik>

      <style jsx>{`
        .overlay {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .overlay p {
          background-color: var(--primary-bg-color);
          padding: 0.3rem 1rem;
          border-radius: var(--border-radius);
          color: var(--primary-color);
        }

        .form-section {
          transition: var(--transition); /* So blur transitions smoothly. */
        }

        .form-section.blurred {
          filter: blur(6px) brightness(120%) grayscale(20%);
        }

        .form-section.invisible {
          opacity: 0;
          pointer-events: none;
        }
      `}</style>
    </InteractiveWell>
  );
};

function createMintlistCreateTx({
  wallet,
  recentBlockhash,
  mintlistKeypair,
  mintlistAccountLamports,
  mintlistAccountSize,
  collectionKeypair,
  goLiveDate,
  priceSol,
  numNftsTotal,
  mintlistMetadataUrl,
  collectionMetadataUrl,
}: {
  wallet: string;
  recentBlockhash: string;
  mintlistKeypair: GKeypair;
  mintlistAccountLamports: string;
  mintlistAccountSize: BN;
  collectionKeypair: GKeypair;
  goLiveDate: DateTime;
  priceSol: number;
  numNftsTotal: number;
  mintlistMetadataUrl: string;
  collectionMetadataUrl: string;
}) {
  return GTransaction.create({
    feePayer: wallet,
    recentBlockhash,
    instructions: [
      // Due to the 10kb limit on the size of accounts that can be initialized via CPI,
      // the `mintlist` account must be initialized through a separate SystemProgram.createAccount instruction.
      {
        accounts: [
          // payer
          {
            address: wallet,
            signer: true,
            writable: true,
          },
          // mintlist
          {
            address: mintlistKeypair.publicKey.toBase58(),
            signer: true,
            writable: true,
          },
        ],
        // SystemProgram
        program: GPublicKey.default.toBase58(),
        data_base64: SYSTEM_CREATE_ACCOUNT_IX.toBuffer({
          ix_discriminator: null,
          amount: { lamports: mintlistAccountLamports },
          space: mintlistAccountSize,
          program_owner: NFTOKEN_ADDRESS,
        }).toString("base64"),
      },
      // mintlist_create
      {
        accounts: [
          // Authority
          { address: wallet, signer: true, writable: true },
          // Mintlist
          {
            address: mintlistKeypair.address,
            signer: true,
            writable: true,
          },
          // Collection
          {
            address: collectionKeypair.address,
            signer: true,
            writable: true,
          },
          // Treasury
          {
            address: wallet,
            signer: false,
            writable: false,
          },
          // System Program
          {
            address: GPublicKey.default.toString(),
            signer: false,
            writable: false,
          },
          // Clock
          {
            address: SYSVAR_CLOCK_PUBKEY,
            signer: false,
            writable: false,
          },
        ],
        program: NFTOKEN_ADDRESS,
        data_base64: NFTOKEN_MINTLIST_CREATE_IX.toBuffer({
          ix: null,
          go_live_date: goLiveDate,
          price: {
            lamports: String(priceSol * LAMPORTS_PER_SOL),
          },
          minting_order: "sequential",
          num_nfts_total: numNftsTotal,
          metadata_url: mintlistMetadataUrl,
          collection_metadata_url: collectionMetadataUrl,
        }).toString("base64"),
      },
    ],
    signers: [mintlistKeypair, collectionKeypair],
  });
}

const DatePickerField = ({
  label,
  fieldName,
}: {
  label: string;
  fieldName: keyof FormData;
}) => {
  const { values, setFieldValue } = useFormikContext<FormData>();

  const value = values[fieldName];

  return (
    <>
      <LuxInputLabel text={label} />
      <DateTimePicker
        date={value as string}
        minDate={DateTime.now().toISO()}
        setDate={(date) => {
          setFieldValue(fieldName, date);
        }}
        timezone={undefined}
      />
    </>
  );
};

const SubmitButton = () => {
  const { values, isValid } = useFormikContext<FormData>();

  return (
    <LuxSubmitButton
      label="Create Mintlist"
      rounded
      color="brand"
      disabled={!isValid || !values.collectionImage}
    />
  );
};
