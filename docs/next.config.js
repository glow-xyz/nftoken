const withMarkdoc = require("@markdoc/next.js");

/* config: https://markdoc.io/docs/nextjs#options */
module.exports = withMarkdoc()({
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdoc"],
});
