import { constructCloseMintlistTx } from "@glow-xyz/nftoken-js";
import { useRouter } from "next/router";
import React from "react";
import { useBoolean } from "../../hooks/useBoolean";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { LuxButton } from "../atoms/LuxButton";
import { useNetworkContext } from "../atoms/NetworkContext";

export const MintlistSaleEnded = ({
  mintlist,
}: {
  mintlist: NftokenTypes.MintlistInfo;
}) => {
  const { network } = useNetworkContext();
  const close = useBoolean();
  const router = useRouter();

  return (
    <div className="mt-5">
      <div className="text-xl flex-column flex-center-center gap-3 mb-3">
        <div>This Mintlist has sold out.</div>

        <div>
          You can close the Mintlist and return the rent to your wallet.
        </div>
      </div>

      <div className="flex-center-center">
        <LuxButton
          label="Close Mintlist"
          disabled={close.value}
          onClick={async () => {
            close.setTrue();

            const { address: wallet } = await window.glow!.connect();
            const { transactionBase64 } = await constructCloseMintlistTx({
              wallet,
              network,
              mintlist: mintlist.address,
            });

            try {
              await window.glow!.signAndSendTransaction({
                transactionBase64,
                network,
              });
              await router.push('/mintlists')
            } catch (err) {
              console.error(err);
            }

            close.setFalse();
          }}
        />
      </div>
    </div>
  );
};
