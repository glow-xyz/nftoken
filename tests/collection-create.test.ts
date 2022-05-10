import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Nftoken as NftokenTypes } from "../target/types/nftoken";
import { createCollection } from "./utils/create-collection";

describe("ix_collection_create", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Nftoken as Program<NftokenTypes>;

  test("creates a collection", async () => {
    await createCollection({ program });
  });
});
