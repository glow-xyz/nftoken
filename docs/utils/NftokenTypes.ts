import { Solana } from "@glow-app/solana-client";
import * as z from "zod";

export const CoerceBooleanZ = z.preprocess(
  (data) => Boolean(data),
  z.boolean()
);

export namespace NftTypes {
  export const NftTraitValueZ = z.string().or(z.number()).or(z.boolean());
  export type NftTraitValue = z.infer<typeof NftTraitValueZ>;

  export const NftTraitZ = z.object({
    trait_type: z.string(),
    value: NftTraitValueZ.nullable(),
  });
  export type NftTrait = z.infer<typeof NftTraitZ>;
  export const NftTraitsZ = z.array(NftTraitZ);
}

export namespace NftokenTypes {
  export const METADATA_URL_LENGTH = 96;
  export const MetadataUrlZ = z.string().max(METADATA_URL_LENGTH);

  export const MetadataZ = z.object({
    name: z.string(),
    description: z.string().nullable().optional(),

    image: z.string().url(),
    traits: NftTypes.NftTraitsZ.nullable().optional(),

    minted_at: z.string().nullable().optional(), // TODO: use new type here that ensures it's a datetime

    animation_url: z.string().nullable().optional(),
    external_url: z.string().nullable().optional(),
  });
  export type Metadata = z.infer<typeof MetadataZ>;

  export const CollectionAccountZ = z.object({
    authority: Solana.AddressZ,
    authority_can_update: CoerceBooleanZ,

    metadata_url: MetadataUrlZ.nullable(),
  });
  export type CollectionAccount = z.infer<typeof CollectionAccountZ>;
  export const CollectionZ = CollectionAccountZ.merge(
    z.object({ address: Solana.AddressZ, network: z.string() })
  );
  export type Collection = z.infer<typeof CollectionZ>;
  export const CollectionInfoZ = CollectionZ.merge(MetadataZ.partial());
  export type CollectionInfo = z.infer<typeof CollectionInfoZ>;

  export const NftAccountZ = z.object({
    holder: Solana.AddressZ,
    authority: Solana.AddressZ,
    authority_can_update: CoerceBooleanZ,

    collection: Solana.AddressZ.nullable(),
    delegate: Solana.AddressZ.nullable(),

    metadata_url: MetadataUrlZ.nullable(),
  });

  export type NftAccount = z.infer<typeof NftAccountZ>;

  export const NftZ = NftAccountZ.merge(z.object({ address: Solana.AddressZ }));
  export type Nft = z.infer<typeof NftZ>;

  export const NftInfoZ = NftZ.merge(MetadataZ.partial());
  export type NftInfo = z.infer<typeof NftInfoZ>;

  export const MintingOrderZ = z.enum(["sequential", "random"]);
  export type MintingOrder = z.infer<typeof MintingOrderZ>;

  export const MintInfoArgZ = z.object({
    metadata_url: MetadataUrlZ,
  });
  export type MintInfoArg = z.infer<typeof MintInfoArgZ>;

  export const MintInfoZ = z.object({
    minted: CoerceBooleanZ,
    metadata_url: z.string().max(METADATA_URL_LENGTH),
  });
  export type MintInfo = z.infer<typeof MintInfoZ>;
  export const MintlistZ = z.object({
    address: Solana.AddressZ,
    authority: Solana.AddressZ,
    treasury_sol: Solana.AddressZ,
    go_live_date: z.string(),
    created_at: z.string(),
    metadata_url: z.string(),
    collection: Solana.AddressZ,
    price: Solana.SolAmountZ,
    minting_order: MintingOrderZ,

    num_nfts_total: z.number(),
    num_nfts_redeemed: z.number(),

    mint_infos: z.array(MintInfoZ),
  });
  export type Mintlist = z.infer<typeof MintlistZ>;

  export const MintlistInfoZ = MintlistZ.merge(MetadataZ.partial());
  export type MintlistInfo = z.infer<typeof MintlistInfoZ>;
}
