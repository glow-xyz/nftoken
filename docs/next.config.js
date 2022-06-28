const withMarkdoc = require("@markdoc/next.js");

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdoc"],
  webpack: (config, options) => {
    // https://github.com/vercel/next.js/discussions/33161#discussioncomment-2082895
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.tsx?$/,
      include: [options.dir],
      use: [
        "next-swc-loader",
        {
          loader: "@svgr/webpack",
          options: { babel: false },
        },
      ],
    });
    return config;
  },
};

/* config: https://markdoc.io/docs/nextjs#options */
module.exports = withMarkdoc()(nextConfig);
