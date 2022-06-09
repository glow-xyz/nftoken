/* Use this file to export your Markdoc nodes */

import { Heading } from "../components/Heading";
import { CodeBlock } from "../components/CodeBlock";
import { Tag } from "@markdoc/markdoc";

export const heading = {
  render: Heading,
  attributes: {
    level: { type: Number, required: true },
    id: { type: String, required: true },
  },
  transform(
    node: {
      transformAttributes: (config: any) => any;
      transformChildren: (config: any) => any;
    },
    config: object
  ) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    const id = children
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/, "");

    return new Tag("Heading", { ...attributes, id }, children);
  },
};

export const fence = {
  render: CodeBlock,
  attributes: {
    content: { type: String, required: true },
    language: { type: String, required: true },
  },
};
