import { CreateNftSection } from "../components/CreateNftSection";
import { Callout } from "../components/Callout";
import { AttributeTable, AttributeRow } from "../components/AttributeTable";

export default {
  ["create-nft-section"]: {
    render: CreateNftSection,
    attributes: {},
  },
  ["callout"]: {
    render: Callout,
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
