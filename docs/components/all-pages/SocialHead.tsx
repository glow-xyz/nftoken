import Head from "next/head";
import React from "react";
import { Thing, WithContext } from "schema-dts";

export const SocialHead = <SchemaType extends Thing>({
  title: _title = "NFToken",
  subtitle,
  description = "A simple, inexpensive Solana NFT standard.",
  imagePath,
  imageUrl = "https://nftoken.so/share.png",
  imageSize = { width: 1200, height: 630 },
  canonicalPath,
  canonicalUrl,
  blockRobots,
  schema,
  faviconUrl = '/favicon.png',
  children,
  twitterCardType = "summary_large_image",
}: React.PropsWithChildren<{
  title?: string;
  subtitle?: string;
  description?: string;
  imagePath?: string;
  imageUrl?: string | null;
  imageSize?: { height: number; width: number };
  canonicalPath?: string;
  canonicalUrl?: string;
  blockRobots?: boolean;
  faviconUrl?: string;
  schema?: WithContext<SchemaType>;
  twitterCardType?: "summary_large_image" | "summary";
}>) => {
  const title = subtitle ? `${subtitle} · ${_title}` : _title;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description || ""} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description || ""} />
      <meta property="og:type" content="article" />

      <meta name="twitter:card" content={twitterCardType} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {canonicalUrl ? (
        <>
          <meta property="og:url" content={canonicalUrl} />
          <link rel="canonical" href={canonicalUrl} />
        </>
      ) : canonicalPath ? (
        <>
          <meta
            property="og:url"
            content={`https://nftoken.so${canonicalPath}`}
          />
          <link rel="canonical" href={`https://nftoken.so${canonicalPath}`} />
        </>
      ) : null}

      {imageSize && (
        <>
          <meta
            property="og:image:width"
            content={imageSize.width.toString()}
          />
          <meta
            property="og:image:height"
            content={imageSize.height.toString()}
          />
        </>
      )}

      {blockRobots && <meta name="robots" content="noindex" />}

      {imagePath ? (
        <>
          <meta
            property="og:image"
            content={`https://nftoken.so${imagePath}`}
          />
          <meta
            name="twitter:image"
            content={`https://nftoken.so${imagePath}`}
          />
        </>
      ) : imageUrl ? (
        <>
          <meta property="og:image" content={imageUrl} />
          <meta name="twitter:image" content={imageUrl} />
        </>
      ) : null}

      {schema && (
        <script
          data-cfasync={false}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      {faviconUrl && (
        <link key="favicon" rel="shortcut icon" href={faviconUrl} />
      )}

      {children}
    </Head>
  );
};
