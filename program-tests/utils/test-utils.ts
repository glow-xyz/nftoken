import { Program } from "@project-serum/anchor";
import {
  Nftoken as _NftokenIdlType,
  IDL as _NftokenIdl,
} from "../../target/types/nftoken";
import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

export const NULL_PUBKEY_STRING = "11111111111111111111111111111111";
export type Base58 = string;

export const program = anchor.workspace.Nftoken as Program<_NftokenIdlType>;

export const NftokenIdl = _NftokenIdl;
export type NftokenIdlType = _NftokenIdlType;
export const PROGRAM_ID = "nf7SGC2ZAruzXwogZRffpATHwG8j7fJfxppSWaUjCfi";

// Anchor uses `nodewallet.ts` when testing to find and use a wallet. It automatically signs
// transactions with this keypair.
export const DEFAULT_KEYPAIR = Keypair.fromSecretKey(
  Buffer.from(
    JSON.parse(
      require("fs").readFileSync(process.env.ANCHOR_WALLET, {
        encoding: "utf-8",
      })
    )
  )
);

export const METADATA_LENGTH = 96;

export function nullArray(length: number) {
  return Array.from({ length }, () => 0);
}

export const strToArr = (str: string, length: number): Array<number> => {
  const buff = Buffer.alloc(length);
  buff.write(str, 0);
  return Array.from(buff);
};

export const generateAlphaNumericString = (
  length: number,
  characters: string = "abcdefghijklmnopqrstuvwxyz0123456789"
): string => {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export type NftAccount = {
  holder: PublicKey;
  delegate: PublicKey | null;
  creator: PublicKey | null;
  metadataUrl: string | number[];
  collection: PublicKey | null;
};

export type CollectionAccount = {
  creator: PublicKey | null;
  metadataUrl: string | number[];
};

export type MintInfo = {
  metadataUrl: number[];
};

export const arrayToStr = (arr: Array<number>): string => {
  const buffer = Buffer.from(arr);
  const str = buffer.toString("utf-8");
  return str.replace(/\0/g, "");
};

export const logNft = (nft: NftAccount | null) => {
  console.log(
    "NFT:",
    nft &&
      JSON.stringify(
        {
          holder: nft.holder.toString(),
          creator: nft.creator?.toString() ?? null,
          delegate: nft.delegate?.toString() ?? null,
          metadataUrl: nft.metadataUrl,
          collection: nft.collection?.toString() ?? null,
        },
        null,
        2
      )
  );
};

export const logCollection = (coll: CollectionAccount | null) => {
  if (coll) {
    console.log(
      "Collection:",
      JSON.stringify(
        {
          metadataUrl: coll.metadataUrl,
          creator: coll.creator?.toString(),
        },
        null,
        2
      )
    );
  }
};
