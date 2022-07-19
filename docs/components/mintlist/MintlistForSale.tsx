import { useGlowContext } from "@glow-xyz/glow-react";
import { constructMintNftTx } from "@glow-xyz/nftoken-js";
import React from "react";
import { useBoolean } from "../../hooks/useBoolean";
import { LAMPORTS_PER_SOL } from "../../utils/constants";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { LuxButton } from "../atoms/LuxButton";
import { useNetworkContext } from "../atoms/NetworkContext";

export const MintlistForSale = ({
  mintlist,
}: {
  mintlist: NftokenTypes.Mintlist;
}) => {
  const { network } = useNetworkContext();
  const { glowDetected } = useGlowContext();
  const minting = useBoolean();
  const feeString =
    parseInt(mintlist.price.lamports) / LAMPORTS_PER_SOL + " SOL";

  return (
    <div className="mt-5">
      <div className="text-xl flex-column flex-center-center gap-3 mb-3 font-weight-medium">
        <div>This Mintlist is now For Sale.</div>

        <div>You can mint an NFT for {feeString}</div>
      </div>

      <div className="flex-center-center">
        {glowDetected ? (
          <LuxButton
            label="Mint NFT"
            disabled={minting.value}
            onClick={async () => {
              minting.setTrue();

              const { address: wallet } = await window.glow!.connect();
              const { transactionBase64 } = await constructMintNftTx({
                wallet,
                network,
                mintlist,
              });

              try {
                await window.glow!.signAndSendTransaction({
                  transactionBase64,
                  network,
                });
              } catch (err) {
                console.error(err);
              }

              minting.setFalse();
            }}
          />
        ) : (
          <LuxButton
            label={"Download Glow"}
            color={"brand"}
            href={"https://glow.app/download"}
          />
        )}
      </div>
    </div>
  );
};
