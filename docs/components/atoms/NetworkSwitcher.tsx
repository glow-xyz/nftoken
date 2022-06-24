import { useState, useContext } from "react";
import { Network } from "@glow-app/glow-client";
import { NetworkContext, NETWORK_TO_INFO } from "../NetworkContext";
import { LuxMenu } from "../LuxMenu";
import { LuxButton } from "../LuxButton";
import { ChevronDownIcon } from "@heroicons/react/solid";

export const NetworkSwitcher = () => {
  const [open, setOpen] = useState(false);
  const networkContext = useContext(NetworkContext);

  return (
    <LuxMenu
      trigger={
        <LuxButton
          label={
            networkContext?.network
              ? NETWORK_TO_INFO[networkContext.network].name
              : ""
          }
          variant="link"
          icon={<ChevronDownIcon />}
          iconPlacement="right"
          size="small"
        />
      }
      open={open}
      setOpen={setOpen}
      placement="bottom-end"
      rows={[
        {
          key: "mainnet",
          name: "Mainnet",
          onClick: () => {
            networkContext?.setNetwork(Network.Mainnet);
          },
        },
        {
          key: "devnet",
          name: "Devnet",
          onClick: () => {
            networkContext?.setNetwork(Network.Devnet);
          },
        },
      ]}
    />
  );
};
