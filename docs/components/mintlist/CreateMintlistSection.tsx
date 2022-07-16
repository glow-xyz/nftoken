import { constructCreateMintlistTx } from "@glow-xyz/nftoken-js";
import { Form, Formik, useFormikContext } from "formik";
import { DateTime } from "luxon";
import { useRouter } from "next/router";
import React from "react";
import { uploadJsonToS3 } from "../../utils/upload-file";
import { DateTimePicker, roundedTime } from "../atoms/DateTimePicker";
import { SimpleDropZone } from "../forms/SimpleDropZone";
import { InteractiveWell } from "../nft/InteractiveWell";
import { LuxSubmitButton } from "../atoms/LuxButton";
import { LuxInputField } from "../atoms/LuxInput";
import { LuxInputLabel } from "../atoms/LuxInputLabel";
import { useNetworkContext } from "../atoms/NetworkContext";

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
    goLiveDate: roundedTime({
      intervalMin: 60,
      startTime: DateTime.now().plus({ days: 1 }).toISO(),
    }),
    numNftsTotal: 1,
  };

  return (
    <InteractiveWell title="Create a Mintlist" className="my-3">
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

          const { address: wallet } = await window.glow!.connect();

          const { transactionBase64, mintlist_address } =
            await constructCreateMintlistTx({
              wallet,
              network,
              goLiveDate: goLiveDateTime,
              priceSol,
              numNftsTotal,
              mintlistMetadataUrl: metadata_url,
              collectionMetadataUrl: metadata_url,
            });

          await window.glow!.signAndSendTransaction({
            transactionBase64,
            network,
          });

          await push(`/mintlist/${mintlist_address}`);
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
