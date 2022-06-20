import NextHead from "next/head";

export const Head = ({ title }: { title: string }) => {
  return (
    <NextHead>
      <title>{title}</title>
      <link rel="icon" href="/favicon.png" />

      <meta property="og:title" content={title} />
      <meta property="og:image" content="https://nftoken.so/share.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
    </NextHead>
  );
};
