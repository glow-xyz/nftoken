import {
  GKeypair,
  GlowBorsh,
  GPublicKey,
  GTransaction,
  SolanaClient,
} from "@glow-xyz/solana-client";
import BN from "bn.js";
import { Form, Formik, useFormikContext } from "formik";
import { DateTime } from "luxon";
import { useRouter } from "next/router";
import React from "react";
import {
  LAMPORTS_PER_SOL,
  NFTOKEN_ADDRESS,
  SYSVAR_CLOCK_PUBKEY,
} from "../utils/constants";
import { getMintlistAccountSize } from "../utils/mintlist";
import {
  NFTOKEN_MINTLIST_CREATE_IX,
  SYSTEM_CREATE_ACCOUNT_IX,
} from "../utils/nft-borsh";
import { NETWORK_TO_RPC } from "../utils/rpc-types";
import { uploadJsonToS3 } from "../utils/upload-file";
import { DateTimePicker } from "./DateTimePicker";
import { SimpleDropZone } from "./forms/SimpleDropZone";
import { InteractiveWell } from "./InteractiveWell";
import { LuxSubmitButton } from "./LuxButton";
import { LuxInputField } from "./LuxInput";
import { LuxInputLabel } from "./LuxInputLabel";
import { useNetworkContext } from "./NetworkContext";

type FormData = {
  name: string;
  image: string;
  priceSol: number;
  goLiveDate: string;
  numNftsTotal: number;
};

export const CreateMintlistSection = () => {
  const { push } = useRouter();

  const { network } = useNetworkContext();

  const initialValues: FormData = {
    name: "",
    image: "",
    priceSol: 1,
    goLiveDate: DateTime.now().toISO(),
    numNftsTotal: 1,
  };

  return (
    <InteractiveWell title="Live Demo" className="my-3">
      <Formik
        initialValues={initialValues}
        onSubmit={async ({
          name,
          image,
          priceSol,
          numNftsTotal,
          goLiveDate,
        }) => {
          const goLiveDateTime = DateTime.fromISO(goLiveDate);

          const { file_url: metadata_url } = await uploadJsonToS3({
            json: { name, image },
          });

          console.log([
            "ix",
            GlowBorsh.ixDiscriminator({ ix_name: "mintlist_create_v1" }).write(
              Buffer.alloc(100),
              0,
              null
            ),
          ]);

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
            mintlistMetadataUrl: metadata_url,
            collectionMetadataUrl: metadata_url,
          });

          await window.glow!.signAndSendTransaction({
            transactionBase64: GTransaction.toBuffer({
              gtransaction: tx,
            }).toString("base64"),
            network,
          });

          await push(`/mintlist/${mintlistKeypair.address}`);
        }}
      >
        <Form className={"flex-column gap-4"}>
          <SimpleDropZone<FormData>
            label="Image"
            fieldName="image"
            size={100}
          />
          <LuxInputField
            label="Name"
            name="name"
            placeholder="Fancy Turtles"
            required
          />

          <div className={"flex-center gap-2"}>
            <LuxInputField
              label="Mint Price in SOL"
              name="priceSol"
              type="number"
              required
            />
            <LuxInputField
              label="Total Number of NFTs"
              name="numNftsTotal"
              type="number"
              inputProps={{ min: 1, step: 1 }}
              required
            />
          </div>

          <DatePickerField label="Go Live Date" fieldName="goLiveDate" />

          <LuxSubmitButton label="Create Mintlist" />
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
  console.log({
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
  });
  console.log({
    ix: null,
    go_live_date: goLiveDate,
    price: {
      lamports: String(priceSol * LAMPORTS_PER_SOL),
    },
    minting_order: "sequential",
    num_nfts_total: numNftsTotal,
    metadata_url: mintlistMetadataUrl,
    collection_metadata_url: collectionMetadataUrl,
  });
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
    <div>
      <LuxInputLabel text={label} />
      <DateTimePicker
        date={value as string}
        minDate={DateTime.now().toISO()}
        setDate={(date) => {
          setFieldValue(fieldName, date);
        }}
        timezone={undefined}
      />
    </div>
  );
};
