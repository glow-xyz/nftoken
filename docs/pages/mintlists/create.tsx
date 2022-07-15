import React from "react";
import { CreateMintlistSection } from "../../components/mintlist/CreateMintlistSection";
import { SocialHead } from "../../components/all-pages/SocialHead";

export default function CreateMintlistPage() {
  return (
    <div>
      <SocialHead subtitle={"My Mintlists"} />

      <h1>Create a Mintlist</h1>

      <div className="flex-center spread mb-3">
        <div className="text-secondary">Create a Mintlist to sell NFTs.</div>
      </div>

      <CreateMintlistSection />
    </div>
  );
}
