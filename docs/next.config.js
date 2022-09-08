const withMarkdoc = require("@markdoc/next.js");
const path = require("node:path");

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
      include: [
        options.dir,
        path.resolve(
          __dirname,
          "../node_modules/.pnpm/@luma-team+lux-icons@0.43.0/"
        ),
      ],
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
  redirects: () => [
    { source: "/docs", destination: "/docs/overview", permanent: true },
    { source: "/overview", destination: "/docs/overview", permanent: true },
    {
      source: "/technical-details",
      destination: "/docs/technical-details",
      permanent: true,
    },
    { source: "/faq", destination: "/docs/faq", permanent: true },
    { source: "/changelog", destination: "/docs/changelog", permanent: true },
  ],
  rewrites: () => ({
    beforeFiles: [
      {
        source: "/",
        destination: "/docs/overview",
      },
    ],
    // `fallback` allows us to only rewrite if the path doesn’t exist.
    fallback: [{ source: "/docs/:slug", destination: "/docs/overview" }],
  }),
};

/* config: https://markdoc.io/docs/nextjs#options */
module.exports = withMarkdoc()(nextConfig);
