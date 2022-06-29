import { CreateNftSection } from "../components/CreateNftSection";
import { CreateMintlistSection } from "../components/CreateMintlistSection";
import { Callout } from "../components/Callout";
import { ModalTest } from "../components/test/ModalTest";
import { AttributeTable, AttributeRow } from "../components/AttributeTable";

export default {
  ["create-nft-section"]: {
    render: CreateNftSection,
    attributes: {},
  },
  ["create-mintlist-section"]: {
    render: CreateMintlistSection,
    attributes: {},
  },
  ["callout"]: {
    render: Callout,
    attributes: {},
  },
  ["modal-test"]: {
    render: ModalTest,
    attributes: {},
  },
  ["attribute-table"]: {
    render: AttributeTable,
    attributes: { title: String },
  },
  ["attribute-row"]: {
    render: AttributeRow,
    attributes: { attribute: String, type: String },
  },
};
