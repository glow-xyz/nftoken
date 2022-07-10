import { useState } from "react";
import { Network } from "@glow-xyz/glow-client";
import { useNetworkContext, NETWORK_TO_INFO } from "../NetworkContext";
import { LuxMenu } from "../LuxMenu";
import { LuxButton } from "../LuxButton";
import { ChevronDownIcon } from "@heroicons/react/solid";

export const NetworkSwitcher = () => {
  const [open, setOpen] = useState(false);
  const { network, setNetwork } = useNetworkContext();

  return (
    <LuxMenu
      trigger={
        <LuxButton
          label={NETWORK_TO_INFO[network].name}
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
          onClick: () => setNetwork(Network.Mainnet),
        },
        {
          key: "devnet",
          name: "Devnet",
          onClick: () => setNetwork(Network.Devnet),
        },
      ]}
    />
  );
};
