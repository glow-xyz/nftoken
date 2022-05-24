/* Use this file to export your Markdoc nodes */

import { Heading } from "../components/Heading";

export const heading = {
  render: Heading,
  attributes: {
    level: { type: Number, required: true },
  },
};
