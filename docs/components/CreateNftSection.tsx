import { Network } from "@glow-app/glow-client";
import { SolanaClient } from "@glow-app/solana-client";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import classNames from "classnames";
import { Field, Form, Formik, useFormikContext } from "formik";
import { useState } from "react";
import { NFTOKEN_NFT_CREATE_IX } from "../utils/nft-borsh";
import { uploadJsonToS3 } from "../utils/upload-file";

export const CreateNftSection = () => {
  return (
    <div className="create-nft-section">
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
              { pubkey: PublicKey.default, isWritable: false, isSigner: false },
            ],
            programId: new PublicKey(
              "nf8HTAnNYh2nSBh8a3Sfa7XsCZYitMcHRx3PgEtea5E"
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
          <div>
            <label htmlFor="name" className="luma-input-label medium">
              Name
            </label>
            <Field name="name" id="name" className="luma-input" />
          </div>

          <ImageDropzone />

          <button
            type="submit"
            className="luma-button round brand solid flex-center mt-4"
          >
            Create NFT
          </button>
        </Form>
      </Formik>

      <style jsx>{`
        form {
          max-width: 24rem;
        }

        .create-nft-section :global(form) > :global(div) {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
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
          background-color: var(--secondary-bg-color);
          padding: 1rem;
          border-radius: var(--border-radius);
          transition: var(--transition);
          width: 24rem;
          max-width: 100%;
          text-align: center;
        }

        .dropzone.active {
          color: var(--success-color);
          border-color: var(--success-color);
          background-color: var(--success-pale-bg-color);
        }

        .dropzone:hover {
          background-color: var(--tertiary-bg-color);
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
