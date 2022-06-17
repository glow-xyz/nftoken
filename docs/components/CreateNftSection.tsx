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
import { Field, Form, Formik, useFormikContext } from "formik";
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import confetti from "canvas-confetti";
import { getImageUrl } from "../utils/cdn";
import { ACCEPT_IMAGE_PROP, DropZone } from "../components/LuxDropZone";
import { NFTOKEN_ADDRESS } from "../utils/constants";
import { NFTOKEN_NFT_CREATE_IX } from "../utils/nft-borsh";
import { uploadImageToS3, uploadJsonToS3 } from "../utils/upload-file";

type FormData = {
  name: string;
  image: string | null;
};

export const CreateNftSection = () => {
  const { user, canSignIn, signOut } = useGlowContext();
  const [success, setSuccess] = useState(false);

  const initialValues: FormData = { name: "", image: null };

  useEffect(() => {
    if (!success) {
      return;
    }

    const end = Date.now() + 3 * 1000;

    const shootConfetti = () => {
      const settings = {
        particleCount: 5,
        spread: 1000,
        startVelocity: 45,
        gravity: 2,
        colors: ["#f87171", "#fb923c", "#fbbf24", "#38bdf8", "#a78bfa"],
        angle: 270,
        disableForReducedMotion: true,
      };

      confetti({
        particleCount: 10,
        spread: 180,
        startVelocity: 100,
        gravity: 2,
        colors: ["#f87171", "#fb923c", "#fbbf24", "#38bdf8", "#a78bfa"],
        angle: 270,
        origin: { y: -1, x: 0.5 },
        disableForReducedMotion: true,
      });

      if (Date.now() < end) {
        requestAnimationFrame(shootConfetti);
      }
    };

    shootConfetti();
  }, [success]);

  return (
    <Container>
      <div>
        <div
          className={classNames("form-section", {
            blurred: !canSignIn || !user,
          })}
        >
          {success ? (
            <div className="success">
              <div className="success-icon text-success">
                <BadgeCheckIcon />
              </div>
              <p className="font-weight-medium text-success mb-0 text-center">
                <span>Your NFT has been minted!</span>
              </p>
            </div>
          ) : (
            <Formik
              initialValues={initialValues}
              onSubmit={async ({ name, image }, { resetForm }) => {
                // const { address: wallet } = await window.glow!.connect();

                // const nft_keypair = GKeypair.generate();
                // const { file_url: metadata_url } = await uploadJsonToS3({
                //   json: { name, image },
                // });
                // const recentBlockhash = await SolanaClient.getRecentBlockhash({
                //   rpcUrl: "https://api.mainnet-beta.solana.com",
                // });

                // const transaction = GTransaction.create({
                //   feePayer: wallet,
                //   recentBlockhash,
                //   instructions: [
                //     {
                //       accounts: [
                //         // NFT Creator
                //         { address: wallet, signer: true, writable: true },
                //         // Holder
                //         { address: wallet, writable: false, signer: false },
                //         {
                //           address: nft_keypair.address,
                //           signer: true,
                //           writable: true,
                //         },
                //         {
                //           address: GPublicKey.default.toString(),
                //           writable: false,
                //           signer: false,
                //         },
                //       ],
                //       program: NFTOKEN_ADDRESS,
                //       data_base64: NFTOKEN_NFT_CREATE_IX.toBuffer({
                //         ix: null,
                //         metadata_url,
                //         collection_included: false,
                //       }).toString("base64"),
                //     },
                //   ],
                // });

                // const signedTx = GTransaction.sign({
                //   secretKey: nft_keypair.secretKey,
                //   gtransaction: transaction,
                // });

                // await window.glow!.signAndSendTransaction({
                //   transactionBase64: GTransaction.toBuffer({
                //     gtransaction: signedTx,
                //   }).toString("base64"),
                //   network: Network.Mainnet,
                // });

                resetForm({ values: { name: "", image: null } });
                setSuccess(true);
              }}
            >
              <Form>
                <div className="mb-4">
                  <label htmlFor="name" className="luma-input-label medium">
                    Name
                  </label>
                  <Field name="name" id="name" className="luma-input" />
                </div>

                <ImageDropZone />

                <div className="mt-4 flex-end spread">
                  <button
                    type="submit"
                    className="luma-button round brand solid flex-center "
                  >
                    Create NFT
                  </button>
                  <button
                    type="button"
                    onClick={signOut}
                    className="ml-2 luma-button round text-secondary flex-center small"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              </Form>
            </Formik>
          )}
        </div>

        {!canSignIn && (
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

        {canSignIn && !user && (
          <div className="overlay">
            <GlowSignInButton variant="purple" />
          </div>
        )}
      </div>

      <style jsx>{`
        .overlay {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .overlay p {
          background-color: hsla(0, 0%, 100%, 0.8);
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

        .success-icon {
          margin: 0 auto;
          max-width: max-content;
        }

        .success-icon :global(svg) {
          height: 1.25rem;
          width: 1.25rem;
        }
      `}</style>
    </Container>
  );
};

const ImageDropZone = () => {
  const { values, setFieldValue } = useFormikContext();
  const data = values as FormData;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT_IMAGE_PROP,
    multiple: false,
    onDrop: async (files) => {
      const [file] = files;
      const { file_url } = await uploadImageToS3({ file });

      setFieldValue("image", file_url);
    },
    noKeyboard: true,
  });

  return (
    <div className={classNames("container", { "with-image": data.image })}>
      <DropZone
        label="NFT Image"
        isDragActive={isDragActive}
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
          grid-template-columns: 2fr 1fr;
          grid-column-gap: 1rem;
        }

        img {
          width: 100%;
        }
      `}</style>
    </div>
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
