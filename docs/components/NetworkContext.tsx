import { createContext } from "react";
import { Network } from "@glow-app/glow-client";
import { createUseAppContext } from "../utils/context";
import { usePersistedState } from "../hooks/usePersistedState";

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
  const [network, setNetwork] = usePersistedState(
    NETWORK_LOCAL_STORAGE_KEY,
    defaultNetwork
  );

  return (
    <NetworkContext.Provider
      value={{
        network: network as Network,
        setNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = createUseAppContext(NetworkContext);
