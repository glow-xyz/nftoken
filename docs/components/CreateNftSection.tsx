import { Network } from "@glow-app/glow-client";
import { SolanaClient } from "@glow-app/solana-client";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import classNames from "classnames";
import { Field, Form, Formik, useFormikContext } from "formik";
import { useState } from "react";
import { NFTOKEN_NFT_CREATE_IX } from "../utils/nft-borsh";
import { uploadJsonToS3 } from "../utils/upload-file";
import { useGlowContext, GlowSignInButton } from "@glow-app/glow-react";

export const CreateNftSection = () => {
  const { user, canSignIn, signOut } = useGlowContext();

  return (
    <Container>
      <div className="create-nft-section">
        <div
          className={classNames("form-section", {
            blurred: !canSignIn || !user,
          })}
        >
          <Formik
            initialValues={{ name: "", image: null }}
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
            }}
          >
            <Form>
              <div className="mb-4">
                <label htmlFor="name" className="luma-input-label medium">
                  Name
                </label>
                <Field name="name" id="name" className="luma-input" />
              </div>

              <ImageDropzone />

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
        </div>

        {!canSignIn && (
          <div className="overlay">
            <div>
              You’ll need to install{" "}
              <a href="https://glow.app/download" target="_blank">
                Glow
              </a>{" "}
              in order to mint an NFT.
            </div>
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

        .form-section {
          transition: var(--transition); /* So blur transitions smoothly. */
        }

        .form-section.blurred {
          filter: blur(6px) brightness(120%) grayscale(20%);
        }
      `}</style>
    </Container>
  );
};

const ImageDropzone = () => {
  const { setFieldValue } = useFormikContext();

  const [imageinDropzone, setImageInDropzone] = useState(false);

  return (
    <div>
      <label htmlFor="image" className="luma-input-label medium">
        NFT Image
      </label>
      <div
        className={classNames("dropzone", { active: imageinDropzone })}
        onDragEnter={() => setImageInDropzone(true)}
        onDragOver={() => setImageInDropzone(true)}
        onDragLeave={() => setImageInDropzone(false)}
        onDrop={() => setImageInDropzone(false)}
      >
        <input
          type="file"
          accept="image/*"
          name="image"
          id="image"
          onChange={(event) => {
            setFieldValue("image", event.target.files?.[0]);
          }}
        />
        <div>Drag and drop an image or click to browse.</div>
      </div>

      <style jsx>{`
        .dropzone {
          position: relative;
          border: 1px dashed var(--primary-border-color);
          width: max-content;
          color: var(--secondary-color);
          background-color: var(--primary-bg-color);
          padding: 1rem;
          border-radius: var(--border-radius);
          transition: var(--transition);
          text-align: center;
          width: 100%;
        }

        .dropzone.active {
          color: var(--success-color);
          border-color: var(--success-color);
          background-color: var(--success-pale-bg-color);
        }

        input[type="file"] {
          opacity: 0;
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
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
