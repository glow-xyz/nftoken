import React from "react";
import { CreateNftSection } from "../components/CreateNftSection";
import { PageLayout } from "../components/PageLayout";

export default function CreateAnNftPage() {
  return (
    <PageLayout secondaryNav={"mintlists"}>
      <h1>Create an NFT</h1>

      <div className={"mb-2 text-secondary"}>
        It's easy and cheap to create an NFT
      </div>

      <CreateNftSection />
    </PageLayout>
  );
}
