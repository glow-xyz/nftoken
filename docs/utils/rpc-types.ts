import { Network } from "@glow-app/glow-client";

export const NETWORK_TO_RPC: Record<Network, string> = {
  [Network.Mainnet]: "https://api.mainnet-beta.solana.com",
  [Network.Devnet]: "https://api.devnet.solana.com",
  [Network.Localnet]: "http://localhost:9900",
};
