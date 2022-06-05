import {
  FixableGlowBorsh,
  GlowBorsh,
} from "@glow-app/solana-client/dist/borsh/base";
import * as beet from "@metaplex-foundation/beet";

export const NFTOKEN_NFT_CREATE_IX = new FixableGlowBorsh<{
  ix: null;
  metadata_url: string;
  collection_included: boolean;
}>({
  fields: [
    ["ix", GlowBorsh.ixDiscriminator({ ix_name: "nft_create_v1" })],
    ["metadata_url", FixableGlowBorsh.utf8String],
    ["collection_included", beet.bool],
  ],
});
