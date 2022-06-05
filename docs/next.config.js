import withMarkdoc from "@markdoc/next.js";

/* config: https://markdoc.io/docs/nextjs#options */
export default withMarkdoc()({
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdoc"],
});
