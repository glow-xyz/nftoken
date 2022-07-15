import React from "react";
import { CreateNftSection } from "../components/nft/CreateNftSection";
import { SocialHead } from "../components/all-pages/SocialHead";

export default function CreateAnNftPage() {
  return (
    <div>
      <SocialHead subtitle={"Create an NFT"} />

      <h1>Create an NFT</h1>

      <div className={"mb-2 text-secondary"}>
        It's easy and cheap to create an NFT.
      </div>

      <CreateNftSection />
    </div>
  );
}
