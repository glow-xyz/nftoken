import { PageLayout } from "../../components/PageLayout";
import { CreateMintlistSection } from "../../components/CreateMintlistSection";
import { MINTLIST_PAGES } from "../../components/all-pages/navigation-constants";

export default function CreateMintlistPage() {
  return (
    <PageLayout secondaryNavLinks={MINTLIST_PAGES}>
      <CreateMintlistSection />
    </PageLayout>
  );
}
