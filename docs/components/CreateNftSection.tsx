import { useGlowContext } from "@glow-xyz/glow-react";
import { constructCreateNftTx } from "@glow-xyz/nftoken-js";
import { BadgeCheckIcon } from "@heroicons/react/outline";
import confetti from "canvas-confetti";
import classNames from "classnames";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { uploadJsonToS3 } from "../utils/upload-file";
import { SimpleDropZone } from "./forms/SimpleDropZone";
import { InteractiveWell } from "./InteractiveWell";
import { LuxSubmitButton } from "./LuxButton";
import { LuxInputField } from "./LuxInput";
import { useNetworkContext } from "./NetworkContext";

type FormData = {
  name: string;
  image: string | null;
};

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

              <SimpleDropZone<FormData> label="NFT Image" fieldName="image" />

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
            <BadgeCheckIcon />
          </div>
          <p className="font-weight-medium text-success mb-0 text-center text-lg">
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
          height: 1.5rem;
          width: 1.5rem;
        }
      `}</style>
    </div>
  );
};
