import { useState } from "react";
import classNames from "classnames";
import { Network } from "@glow-app/glow-client";
import { SolanaClient } from "@glow-app/solana-client";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { useGlowContext, GlowSignInButton } from "@glow-app/glow-react";
import { Field, Form, Formik, useFormikContext } from "formik";
import { useDropzone } from "react-dropzone";
import { NFTOKEN_NFT_CREATE_IX } from "../utils/nft-borsh";
import { uploadJsonToS3 } from "../utils/upload-file";
import { DropZone, ACCEPT_IMAGE_PROP } from "../components/LuxDropZone";
import { BadgeCheckIcon } from "@heroicons/react/outline";

type FormData = {
  name: string;
  image: string | null;
};

export const CreateNftSection = () => {
  const { user, canSignIn, signOut } = useGlowContext();
  const [success, setSuccess] = useState(false);

  const initialValues: FormData = { name: "", image: null };

  return (
    <Container>
      <div className="create-nft-section">
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
              onSubmit={async ({ name }, { resetForm }) => {
                const { publicKey } = await window.glow!.connect();

                const nft_keypair = Keypair.generate();
                const { file_url: metadata_url } = await uploadJsonToS3({
                  json: { name },
                });
                const recentBlockhash = await SolanaClient.getRecentBlockhash({
                  rpcUrl: "https://api.mainnet-beta.solana.com",
                });

                // TODO: replace this with not Solana web3.js
                const transaction = new Transaction({
                  feePayer: publicKey,
                  recentBlockhash,
                });
                transaction.add({
                  keys: [
                    // NFT Creator
                    {
                      pubkey: publicKey,
                      isSigner: true,
                      isWritable: true,
                    },
                    // Holder
                    { pubkey: publicKey, isWritable: false, isSigner: false },
                    {
                      pubkey: nft_keypair.publicKey,
                      isSigner: true,
                      isWritable: true,
                    },
                    {
                      pubkey: PublicKey.default,
                      isWritable: false,
                      isSigner: false,
                    },
                  ],
                  programId: new PublicKey(
                    "nf7SGC2ZAruzXwogZRffpATHwG8j7fJfxppSWaUjCfi"
                  ),
                  data: NFTOKEN_NFT_CREATE_IX.toBuffer({
                    ix: null,
                    metadata_url,
                    collection_included: false,
                  }),
                });
                transaction.partialSign(nft_keypair);

                await window.glow!.signAndSendTransaction({
                  transactionBase64: transaction
                    .serialize({ verifySignatures: false })
                    .toString("base64"),
                  network: Network.Mainnet,
                });

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
          <div className="overlay">
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
        .create-nft-section {
          width: 36rem;
          max-width: 100%;
          position: relative;
        }

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
    // onDrop: async (files) => {
    // We join both accepted and rejected because the error handling case is
    // in upload hook as well.
    // const [file] = files;
    // const { file_url } = await uploadFileToS3({
    //   file,
    //   destination: { bucket: "cdn.lu.ma", folder: "misc" },
    //   ZmClient,
    // });
    // setUploadedFile(file_url);
    // },
    onDrop: () => {
      setFieldValue("image", "https://source.unsplash.com/random");
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

      {data.image && <img src={data.image} />}

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
    <section className="px-3 pb-3 rounded">
      <div className="badge text-xs font-weight-bold">Live Minting Demo</div>
      <div>{children}</div>

      <style jsx>{`
        section {
          border: 1px solid var(--primary-border-color);
          background-color: var(--secondary-bg-color);
          position: relative;
          padding-top: 2.25rem;
          overflow: hidden;
          max-width: max-content;
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
