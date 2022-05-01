import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

export type Base58 = string;
export type Base64 = string;

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
  update_authority: PublicKey | null;
  name: Array<number>;
  imageUrl: Array<number>;
  metadataUrl: Array<number>;
  collection: PublicKey | null;
};

export type CollectionAccount = {
  update_authority: PublicKey | null;
  name: Array<number>;
  imageUrl: Array<number>;
  metadataUrl: Array<number>;
};

const arrayToStr = (arr: Array<number>): string => {
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
          update_authority: nft.update_authority?.toString() ?? null,
          delegate: nft.delegate?.toString() ?? null,
          name: arrayToStr(nft.name),
          imageUrl: arrayToStr(nft.imageUrl),
          metadataUrl: arrayToStr(nft.metadataUrl),
          collection: nft.collection?.toString() ?? null,
        },
        null,
        2
      )
  );
};

export const logCollection = (coll: CollectionAccount) => {
  console.log(
    "Collection:",
    JSON.stringify(
      {
        name: arrayToStr(coll.name),
        imageUrl: arrayToStr(coll.imageUrl),
        metadataUrl: arrayToStr(coll.metadataUrl),
        update_authority: coll.update_authority?.toString(),
      },
      null,
      2
    )
  );
};
