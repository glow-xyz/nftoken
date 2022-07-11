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

type FormData = {
  name: string;
  image: string | null;
};

const RANDOM_IMAGES = [
  "https://images.unsplash.com/photo-1624628639856-100bf817fd35",
  "https://images.unsplash.com/photo-1615756257997-2bad02de466d",
  "https://images.unsplash.com/photo-1654002729150-89a0ca7f4be0",
  "https://images.unsplash.com/photo-1617791160536-598cf32026fb",
  "https://images.unsplash.com/photo-1538113300105-e51e4560b4aa",
  "https://images.unsplash.com/photo-1637666505754-7416ebd70cbf",
  "https://images.unsplash.com/photo-1611262588019-db6cc2032da3",
  "https://images.unsplash.com/photo-1630857453903-0386bfb0d990",
  "https://images.unsplash.com/photo-1599508704512-2f19efd1e35f",
  "https://images.unsplash.com/photo-1651925757999-4d6d94adbde4",
  "https://images.unsplash.com/photo-1651741304929-71bcb4d17c92",
  "https://images.unsplash.com/photo-1650983248860-8747c75e6836",
  "https://images.unsplash.com/photo-1654859869130-fd0a2aa5539b",
  "https://images.unsplash.com/photo-1653853033251-e1b76495f688",
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

  let randomIndex = useRef<number | null>(null);

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

          const url =
            RANDOM_IMAGES[randomIndex.current] +
            "?height=1000&width=1000&fit=crop";

          setFieldValue("image", url);
        }}
      />
    </div>
  );
};
