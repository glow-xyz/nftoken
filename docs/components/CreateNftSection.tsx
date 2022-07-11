import { useGlowContext } from "@glow-xyz/glow-react";
import { constructCreateNftTx } from "@glow-xyz/nftoken-js";
import TickFilledIcon from "@luma-team/lux-icons/glow/TickFilled.svg";
import confetti from "canvas-confetti";
import classNames from "classnames";
import { Form, Formik, useFormikContext } from "formik";
import { useState, useEffect, useRef } from "react";
import { uploadJsonToS3 } from "../utils/upload-file";
import { SimpleDropZone } from "./forms/SimpleDropZone";
import { InteractiveWell } from "./InteractiveWell";
import { LuxButton, LuxSubmitButton } from "./LuxButton";
import { LuxInputField } from "./LuxInput";
import { useNetworkContext } from "./NetworkContext";
import RepeatIcon from "@luma-team/lux-icons/feather/repeat.svg";
import { getImageUrl } from "../utils/cdn";

type FormData = {
  name: string;
  image: string | null;
};

const RANDOM_IMAGES = [
  "https://cdn.lu.ma/misc/q5/91ba5e56-babb-432a-a410-c57304ba6c3c",
  "https://cdn.lu.ma/misc/x9/60422311-9905-4210-bc69-4c3f58a2fe54",
  "https://cdn.lu.ma/misc/d8/70a9baa3-96a8-4cc3-970f-e9641278e323",
  "https://cdn.lu.ma/misc/er/12cb4c0c-7384-4065-9896-0a814726c62d",
  "https://cdn.lu.ma/misc/l1/04fe984f-e126-4881-8024-aa356a8b4e14",
  "https://cdn.lu.ma/misc/oy/c6a32dde-d21f-41c6-a544-ae7e2215f499",
  "https://cdn.lu.ma/misc/1x/c254117d-a97e-4290-a519-58293cbeb508",
  "https://cdn.lu.ma/misc/rm/31d3dca5-a17e-4a4c-b166-f963acfba9fb",
  "https://cdn.lu.ma/misc/sm/942145b9-6bbf-4176-a68e-f3f42ec99d85",
  "https://cdn.lu.ma/misc/jz/7f54e0f2-6254-41fd-8cb3-9183ddea5db9",
  "https://cdn.lu.ma/misc/rj/48e8cb75-0ea7-4e45-a7a2-e415a10093ae",
  "https://cdn.lu.ma/misc/um/6b8e292b-00a0-459b-b086-eec4a47c40cb",
  "https://cdn.lu.ma/misc/du/d1da3fba-12ee-42c2-8622-99605a68d4bd",
  "https://cdn.lu.ma/misc/mh/865ae152-e2f5-4928-b00b-70e57eaa2d2b",
];

export const CreateNftSection = () => {
  const { user, glowDetected } = useGlowContext();
  const [success, setSuccess] = useState(false);

  const initialValues: FormData = { name: "", image: null };

  useEffect(() => {
    if (!success) {
      return;
    }

    const end = Date.now() + 3 * 1000;

    const shootConfetti = () => {
      confetti({
        particleCount: 40,
        spread: 180,
        startVelocity: 100,
        gravity: 3,
        colors: [
          "var(--red)",
          "var(--green)",
          "var(--barney)",
          "var(--purple)",
          "var(--yellow)",
          "var(--orange)",
        ],
        angle: 270,
        origin: { y: -1, x: 0.5 },
        disableForReducedMotion: true,
      });

      if (Date.now() < end) {
        requestAnimationFrame(shootConfetti);
      }
    };

    shootConfetti();

    setTimeout(() => {
      setSuccess(false);
    }, 7_500);
  }, [success, setSuccess]);

  const { network } = useNetworkContext();

  return (
    <div className="create-nft-section">
      <InteractiveWell title="Create an NFT" minimal={success} className="my-3">
        <div className={classNames({ invisible: success })}>
          <Formik
            initialValues={initialValues}
            onSubmit={async ({ name, image }, { resetForm }) => {
              const { address: wallet } = await window.glow!.connect();

              const { file_url: metadata_url } = await uploadJsonToS3({
                json: { name, image },
              });

              const { transactionBase64 } = await constructCreateNftTx({
                metadata_url,
                network,
                creator: wallet,
              });

              await window.glow!.signAndSendTransaction({
                transactionBase64,
                network: network,
              });

              resetForm({ values: { name: "", image: null } });
              setSuccess(true);
            }}
          >
            <Form>
              <div className="mb-4">
                <LuxInputField label="NFT Name" name="name" required />
              </div>

              <NftImageUpload />

              <div className="mt-4">
                <LuxSubmitButton label="Create NFT" rounded color="brand" />
              </div>
            </Form>
          </Formik>
        </div>

        <div
          className={classNames("success", {
            visible: success && glowDetected && user,
          })}
        >
          <div className="success-icon text-success">
            <TickFilledIcon />
          </div>
          <p className="mt-1 mb-0 font-weight-medium text-success text-center text-lg">
            <span>Your NFT has been minted!</span>
          </p>
        </div>
      </InteractiveWell>

      <style jsx>{`
        .invisible {
          opacity: 0;
          pointer-events: none;
        }

        .success {
          position: absolute;
          inset: 0;
          top: calc(50% - 2rem);
          opacity: 0;
          pointer-events: none;
          transition: var(--transition);
        }

        .success.visible {
          opacity: 1;
        }

        .success-icon {
          margin: 0 auto;
          max-width: max-content;
        }

        .success-icon :global(svg) {
          height: 1.25rem;
          width: 1.25rem;
        }
      `}</style>
    </div>
  );
};

const NftImageUpload = () => {
  const { setFieldValue } = useFormikContext();

  const randomIndex = useRef<number | null>(null);

  return (
    <div>
      <SimpleDropZone<FormData> label="NFT Image" fieldName="image" />
      <LuxButton
        label="Random Image"
        variant="link"
        size="small"
        color="secondary"
        icon={<RepeatIcon />}
        className="mt-2"
        onClick={() => {
          if (randomIndex.current === null) {
            randomIndex.current = Math.floor(
              Math.random() * RANDOM_IMAGES.length
            );
          } else {
            randomIndex.current++;

            if (randomIndex.current >= RANDOM_IMAGES.length) {
              randomIndex.current = 0;
            }
          }

          const url = getImageUrl({
            url: RANDOM_IMAGES[randomIndex.current],
            width: 1000,
            height: 1000,
          });

          setFieldValue("image", url);
        }}
      />
    </div>
  );
};
