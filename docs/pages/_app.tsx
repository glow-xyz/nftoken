import type { AppProps } from "next/app";
import Head from "next/head";

import "../public/globals.css";
import "../styles/app.scss";

import { TopNav } from "../components/shell/TopNav";
import { SideNav } from "../components/shell/SideNav";
import { TableOfContents } from "../components/shell/TableOfContents";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>{pageProps.markdoc.frontmatter.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <TopNav />

      <main>
        <SideNav />
        <Component {...pageProps} />
        <TableOfContents content={pageProps.markdoc?.content} />
      </main>

      <style jsx>{`
        main {
          display: grid;
          grid-template-columns: 14rem 65ch 1fr;
          grid-column-gap: 4rem;
        }

        main > :global(*):not(article) {
          position: sticky;
          top: var(--top-nav-height);
          height: calc(100vh - var(--top-nav-height));
        }

        main > :global(*):nth-child(1) {
          padding: 2rem 0 2rem 2rem;
        }

        main > :global(*):nth-child(2) {
          padding-top: 2rem;
          padding-bottom: 5rem;
        }

        main > :global(*):nth-child(3) {
          padding: 2rem 2rem 2rem 0;
        }
      `}</style>
    </>
  );
}
