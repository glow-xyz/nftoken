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
import { useState } from "react";
import { DateTime } from "luxon";
import { toDateTimeLocal } from "../utils/dateTimeLocal";
import { NFTOKEN_ADDRESS } from "../utils/constants";
import {
  NFTOKEN_MINTLIST_CREATE_IX,
  SYSTEM_CREATE_ACCOUNT_IX,
} from "../utils/nft-borsh";
import { LuxInputField } from "../components/LuxInput";
import { LuxButton, LuxSubmitButton } from "../components/LuxButton";

// FIXME: Move these to `@glow-app/solana-client`
export const LAMPORTS_PER_SOL = 1000000000;
export const SYSVAR_CLOCK_PUBKEY = new GPublicKey(
  "SysvarC1ock11111111111111111111111111111111"
);

type FormData = {
  name: string;
  priceSol: number;
  goLiveDate: string;
  numNftsTotal: number;
};

export const CreateMintlistSection = () => {
  const { user, glowDetected, signOut } = useGlowContext();
  const [success, _setSuccess] = useState(false);

  const initialValues: FormData = {
    name: "Mintlist #1",
    priceSol: 1,
    goLiveDate: toDateTimeLocal(new Date()),
    numNftsTotal: 1,
  };

  return (
    <Container>
      <div>
        <div
          className={classNames("form-section", {
            blurred: !glowDetected || !user,
            invisible: success,
          })}
        >
          <Formik
            initialValues={initialValues}
            onSubmit={async (
              { /*name,*/ priceSol, numNftsTotal, goLiveDate },
              { resetForm }
            ) => {
              const goLiveDateSeconds = (Date.parse(goLiveDate) / 1000) | 0;

              console.log({
                priceSol,
                numNftsTotal,
                goLiveDateSeconds,
              });

              const { address: wallet } = await window.glow!.connect();

              const mintlistKeypair = GKeypair.generate();
              const collectionKeypair = GKeypair.generate();

              console.log({
                mintlist: mintlistKeypair.address,
                collection: collectionKeypair.address,
              });

              const mintlistAccountSize = getMintlistAccountSize(numNftsTotal);
              const { lamports: mintlistAccountLamports } =
                await SolanaClient.getMinimumBalanceForRentExemption({
                  dataLength: mintlistAccountSize,
                  rpcUrl: "https://api.mainnet-beta.solana.com",
                });

              const recentBlockhash = await SolanaClient.getRecentBlockhash({
                rpcUrl: "https://api.mainnet-beta.solana.com",
              });

              const transaction = GTransaction.create({
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
                      instruction: 1,
                      lamports: { lamports: mintlistAccountLamports },
                      space: { lamports: String(mintlistAccountSize) },
                      program_id: NFTOKEN_ADDRESS,
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
                        address: SYSVAR_CLOCK_PUBKEY.toString(),
                        signer: false,
                        writable: false,
                      },
                    ],
                    program: NFTOKEN_ADDRESS,
                    data_base64: NFTOKEN_MINTLIST_CREATE_IX.toBuffer({
                      ix: null,
                      go_live_date: DateTime.fromSeconds(goLiveDateSeconds),
                      price_lamports: {
                        lamports: String(priceSol * LAMPORTS_PER_SOL),
                      },
                      minting_order: "sequential",
                      num_nfts_total: numNftsTotal,
                      // FIXME: Handle the mintlist metadata upload.
                      metadata_url: "fake",
                      // FIXME: Handle the collection metadata upload.
                      collection_metadata_url: "fake",
                    }).toString("base64"),
                  },
                ],
                signers: [mintlistKeypair, collectionKeypair],
              });

              const txSignature = await window.glow!.signAndSendTransaction({
                transactionBase64: GTransaction.toBuffer({
                  gtransaction: transaction,
                }).toString("base64"),
                network: Network.Mainnet,
              });

              console.log({ txSignature });

              resetForm();
            }}
          >
            <Form>
              <div className="mb-4">
                <LuxInputField
                  label="Name (For Discoverability)"
                  name="name"
                  required
                />
              </div>
              <div className="mb-4">
                <LuxInputField
                  label="Price (SOL)"
                  name="priceSol"
                  type="number"
                  required
                />
              </div>
              <div className="mb-4">
                <LuxInputField
                  label="Total Number of NFTs"
                  name="numNftsTotal"
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  required
                />
              </div>
              <div className="mb-4">
                <LuxInputField
                  label="Go Live Date"
                  name="goLiveDate"
                  type="datetime-local"
                  required
                />
              </div>

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
      label="Create Mintlist"
      rounded
      color="brand"
      disabled={!(data.priceSol && data.goLiveDate)}
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

function getMintlistAccountSize(numNftsTotal: number): number {
  return (
    // Account discriminator
    8 +
    // version
    1 +
    // creator
    32 +
    // treasury_sol
    32 +
    // go_live_date
    8 +
    // price
    8 +
    // minting_order
    1 +
    // collection
    32 +
    // metadata_url
    96 +
    // created_at
    8 +
    // num_mints
    4 +
    // mints_redeemed
    4 +
    // num_nfts_configured
    4 +
    // mint_infos
    numNftsTotal * getMintInfoSize()
  );
}

function getMintInfoSize(): number {
  return (
    // minted
    1 +
    // metadata_url
    96
  );
}
