import withMarkdoc from "@markdoc/next.js";

export default withMarkdoc(/* config: https://markdoc.io/docs/nextjs#options */)(
  {
    pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdoc"],
  }
);
