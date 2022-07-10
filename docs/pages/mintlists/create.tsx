import { PageLayout } from "../../components/PageLayout";
import { CreateMintlistSection } from "../../components/CreateMintlistSection";

export default function CreateMintlistPage() {
  return (
    <PageLayout secondaryNav={'mintlists'}>
      <CreateMintlistSection />
    </PageLayout>
  );
}
