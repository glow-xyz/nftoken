import { createContext, useEffect, useState } from "react";
import { Network } from "@glow-app/glow-client";

const NETWORK_LOCAL_STORAGE_KEY = "nftoken-docs-network";
type Context = {
  network: Network;
  setNetwork: (network: Network) => void;
};

export const NETWORK_TO_INFO: Record<Network, { name: string }> = {
  [Network.Mainnet]: { name: "Mainnet" },
  [Network.Devnet]: { name: "Devnet" },
  [Network.Localnet]: { name: "Localnet" },
};

export const NetworkContext = createContext<Context | null>(null);

export const NetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const defaultNetwork: Network = Network.Mainnet;
  const [networkState, setNetworkState] = useState<Network>(defaultNetwork);

  useEffect(() => {
    if (localStorage.getItem(NETWORK_LOCAL_STORAGE_KEY) === Network.Devnet) {
      setNetworkState(Network.Devnet);
    }
  }, []);

  const setAndPersistNetworkState = (name: Network) => {
    setNetworkState(name);
    localStorage.setItem(NETWORK_LOCAL_STORAGE_KEY, name);
  };

  return (
    <NetworkContext.Provider
      value={{
        network: networkState,
        setNetwork: setAndPersistNetworkState,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
