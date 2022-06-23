import { createContext, useState } from "react";
import { Network } from "@glow-app/glow-client";

type Context = {
  network: Network;
  setNetwork: (network: Network) => void;
  networkPrettyName: string;
};

export const NetworkContext = createContext<Context | null>(null);

export const NetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [networkState, setNetworkState] = useState<Network>(Network.Mainnet);

  return (
    <NetworkContext.Provider
      value={{
        network: networkState,
        networkPrettyName:
          networkState.substring(0, 1).toUpperCase() +
          networkState.substring(1),
        setNetwork: setNetworkState,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
