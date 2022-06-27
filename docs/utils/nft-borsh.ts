import { FixableGlowBorsh, GlowBorsh, Solana } from "@glow-app/solana-client";
import { bool, u8, u32, array } from "@metaplex-foundation/beet";
import { DateTime } from "luxon";
import { NftokenTypes } from "./NftokenTypes";

export const NFTOKEN_NFT_CREATE_IX = new FixableGlowBorsh<{
  ix: null;
  metadata_url: string;
  collection_included: boolean;
}>({
  fields: [
    ["ix", GlowBorsh.ixDiscriminator({ ix_name: "nft_create_v1" })],
    ["metadata_url", FixableGlowBorsh.utf8String],
    ["collection_included", bool],
  ],
});

export type NftokenNftAccount = {
  discriminator: null;
  version: number;
  holder: Solana.Address;
  authority: Solana.Address;
  authority_can_update: boolean;
  metadata_url: string;
  is_frozen: boolean;
  unused_1: number;
  unused_2: number;
  unused_3: number;
  collection_included: boolean;
  collection: Solana.Address | null;
  delegate: Solana.Address | null;
};

export const NFTOKEN_NFT_ACCOUNT = new FixableGlowBorsh<NftokenNftAccount>({
  fields: [
    ["discriminator", GlowBorsh.accountDiscriminator("NftAccount")],
    ["version", u8],
    ["holder", GlowBorsh.address],
    ["authority", GlowBorsh.address],
    ["authority_can_update", bool],
    ["collection", GlowBorsh.addressNullable],
    ["delegate", GlowBorsh.addressNullable],
    ["is_frozen", bool],
    ["unused_1", u8],
    ["unused_2", u8],
    ["unused_3", u8],
    ["metadata_url", FixableGlowBorsh.utf8String],
  ],
});

export const NFTOKEN_MINTLIST_CREATE_IX = new FixableGlowBorsh<{
  ix: null;
  metadata_url: string;
  collection_metadata_url: string;
  go_live_date: DateTime;
  price: Solana.SolAmount;
  num_nfts_total: number;
  minting_order: string;
}>({
  fields: [
    ["ix", GlowBorsh.ixDiscriminator({ ix_name: "mintlist_create_v1" })],
    ["metadata_url", GlowBorsh.utf8String(96)],
    ["collection_metadata_url", FixableGlowBorsh.utf8String],
    ["go_live_date", GlowBorsh.timestamp],
    ["price", GlowBorsh.solAmount],
    ["num_nfts_total", u32],
    ["minting_order", FixableGlowBorsh.utf8String],
  ],
});

export const NFTOKEN_MINTLIST_ACCOUNT = new FixableGlowBorsh<{
  discriminator: null;
  version: number;
  authority: Solana.Address;
  treasury_sol: Solana.Address;
  go_live_date: DateTime;
  price: Solana.SolAmount;
  metadata_url: string;
  minting_order: number;
  collection: Solana.Address;
  created_at: DateTime;
  num_nfts_total: number;
  num_nfts_redeemed: number;
  mint_infos: NftokenTypes.MintInfo[];
}>({
  fields: [
    ["discriminator", GlowBorsh.accountDiscriminator("MintlistAccount")],
    ["version", u8],
    ["authority", GlowBorsh.address],
    ["treasury_sol", GlowBorsh.address],
    ["go_live_date", GlowBorsh.timestamp],
    ["price", GlowBorsh.solAmount],
    ["minting_order", u8], // TODO: Figure out what this should be to be an enum
    ["collection", GlowBorsh.address],
    ["metadata_url", FixableGlowBorsh.utf8String],
    ["created_at", GlowBorsh.timestamp],
    ["num_nfts_total", u32],
    ["num_nfts_redeemed", u32],
    // ["num_nfts_configured", u32], // This is stored at the beginning of the `Vec<MintInfo>`
    [
      "mint_infos",
      array(
        new GlowBorsh<NftokenTypes.MintInfo>({
          fields: [
            ["minted", bool],
            [
              "metadata_url",
              GlowBorsh.utf8String(NftokenTypes.METADATA_URL_LENGTH),
            ],
          ],
        })
      ),
    ],
  ],
});

export const NFTOKEN_COLLECTION_ACCOUNT = new FixableGlowBorsh<{
  discriminator: null;
  version: number;
  authority: Solana.Address;
  authority_can_update: boolean;
  unused_1: number;
  unused_2: number;
  unused_3: number;
  unused_4: number;
  metadata_url: string;
}>({
  fields: [
    ["discriminator", GlowBorsh.accountDiscriminator("CollectionAccount")],
    ["version", u8],
    ["authority", GlowBorsh.address],
    ["authority_can_update", bool],
    ["unused_1", u8],
    ["unused_2", u8],
    ["unused_3", u8],
    ["unused_4", u8],
    ["metadata_url", FixableGlowBorsh.utf8String],
  ],
});
