import React from "react";
import { CreateNftSection } from "../components/CreateNftSection";

export default function CreateAnNftPage() {
  return (
    <div>
      <h1>Create an NFT</h1>

      <div className={"mb-2 text-secondary"}>
        It's easy and cheap to create an NFT.
      </div>

      <CreateNftSection />
    </div>
  );
}
