import React from "react";
import { Network } from "@glow-app/glow-client";
import { GlowSignInButton, useGlowContext } from "@glow-app/glow-react";
import {
  GKeypair,
  GPublicKey,
  GTransaction,
  SolanaClient,
} from "@glow-app/solana-client";
import { BadgeCheckIcon } from "@heroicons/react/outline";
import classNames from "classnames";
import { Form, Formik, useFormikContext } from "formik";
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import confetti from "canvas-confetti";
import { getImageUrl } from "../utils/cdn";
import { ACCEPT_IMAGE_PROP, DropZone } from "../components/LuxDropZone";
import { NFTOKEN_ADDRESS } from "../utils/constants";
import { NFTOKEN_NFT_CREATE_IX } from "../utils/nft-borsh";
import { uploadImageToS3, uploadJsonToS3 } from "../utils/upload-file";
import { LuxInputField } from "../components/LuxInput";
import { LuxButton, LuxSubmitButton } from "../components/LuxButton";
import { LuxMenu } from "./LuxMenu";

type FormData = {
  name: string;
  image: string | null;
};

export const CreateNftSection = () => {
  const { user, glowDetected, signOut } = useGlowContext();
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

  return (
    <Container>
      <>
        <div
          className={classNames("form-section", {
            blurred: !glowDetected || !user,
            invisible: success,
          })}
        >
          <NetworkSwitcher />
          <Formik
            initialValues={initialValues}
            onSubmit={async ({ name, image }, { resetForm }) => {
              const { address: wallet } = await window.glow!.connect();

              const nft_keypair = GKeypair.generate();
              const { file_url: metadata_url } = await uploadJsonToS3({
                json: { name, image },
              });
              const recentBlockhash = await SolanaClient.getRecentBlockhash({
                rpcUrl: "https://api.mainnet-beta.solana.com",
              });

              const transaction = GTransaction.create({
                feePayer: wallet,
                recentBlockhash,
                instructions: [
                  {
                    accounts: [
                      // NFT Creator
                      { address: wallet, signer: true, writable: true },
                      // Holder
                      { address: wallet, writable: false, signer: false },
                      {
                        address: nft_keypair.address,
                        signer: true,
                        writable: true,
                      },
                      {
                        address: GPublicKey.default.toString(),
                        writable: false,
                        signer: false,
                      },
                    ],
                    program: NFTOKEN_ADDRESS,
                    data_base64: NFTOKEN_NFT_CREATE_IX.toBuffer({
                      ix: null,
                      metadata_url,
                      collection_included: false,
                    }).toString("base64"),
                  },
                ],
              });

              const signedTx = GTransaction.sign({
                secretKey: nft_keypair.secretKey,
                gtransaction: transaction,
              });

              await window.glow!.signAndSendTransaction({
                transactionBase64: GTransaction.toBuffer({
                  gtransaction: signedTx,
                }).toString("base64"),
                network: Network.Mainnet,
              });

              resetForm({ values: { name: "", image: null } });
              setSuccess(true);
            }}
          >
            <Form>
              <div className="mb-4">
                <LuxInputField label="Name" name="name" required />
              </div>

              <ImageDropZone />

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
        </div>

        {!glowDetected && (
          <div className="overlay text-center">
            <p>
              You’ll need to install{" "}
              <a href="https://glow.app/download" target="_blank">
                Glow
              </a>{" "}
              in order to mint an NFT.
            </p>
          </div>
        )}

        {glowDetected && !user && (
          <div className="overlay">
            <GlowSignInButton variant="purple" />
          </div>
        )}

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
      </>

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
    </Container>
  );
};

const SubmitButton = () => {
  const { values } = useFormikContext();
  const data = values as FormData;

  return (
    <LuxSubmitButton
      label="Create NFT"
      rounded
      color="brand"
      disabled={!(data.name && data.image)}
    />
  );
};

const ImageDropZone = () => {
  const { values, setFieldValue } = useFormikContext();
  const data = values as FormData;

  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT_IMAGE_PROP,
    multiple: false,
    onDrop: async (files) => {
      const [file] = files;

      setUploading(true);

      try {
        const { file_url } = await uploadImageToS3({ file });
        setFieldValue("image", file_url);
      } finally {
        setUploading(false);
      }
    },
    noKeyboard: true,
  });

  return (
    <div className={classNames("container", { "with-image": data.image })}>
      <DropZone
        label="NFT Image"
        isDragActive={isDragActive}
        isLoading={uploading}
        rootProps={getRootProps()}
        inputProps={getInputProps()}
      />

      {data.image && (
        <img
          src={getImageUrl({ url: data.image, width: 1000, height: 1000 })}
        />
      )}

      <style jsx>{`
        .container.with-image {
          display: grid;
          grid-template-columns: 1fr 8rem;
          grid-column-gap: 1rem;
        }

        /* Make sure height doesn't jump when image is added on the right. */
        .container :global(.dropzone-wrapper) {
          height: 8rem;
        }

        img {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

const NetworkSwitcher = () => {
  const [open, setOpen] = useState(false);
  return (
    <LuxMenu
      trigger={<LuxButton label="Mainnet" />}
      open={open}
      setOpen={setOpen}
      placement="top-start"
      rows={[
        {
          key: "mainnet",
          name: "Mainnet",
          onClick: () => {
            console.log("mainnet!");
          },
        },
        {
          key: "devnet",
          name: "Devnet",
          onClick: () => {
            console.log("devnet!");
          },
        },
      ]}
    />
  );
};

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="px-3 pb-3 my-3 rounded">
      <div className="badge text-xs font-weight-bold">Live Minting Demo</div>
      <div>{children}</div>

      <style jsx>{`
        section {
          border: 1px solid var(--divider-color);
          background-color: var(--secondary-bg-color);
          position: relative;
          padding-top: 2.25rem;
          overflow: hidden;
          width: 100%;
        }

        .badge {
          position: absolute;
          top: 0;
          left: 0;
          background-color: var(--gray-90);
          color: var(--white);
          line-height: 1;
          padding: 0.3rem 0.6rem 0.35rem 0.6rem;
          border-bottom-right-radius: calc(var(--border-radius) / 2);
        }
      `}</style>
    </section>
  );
};
