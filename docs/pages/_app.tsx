import { GlowProvider } from "@glow-app/glow-react";
import "@glow-app/glow-react/dist/styles.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SideNav } from "../components/shell/SideNav";
import { TopNav } from "../components/shell/TopNav";

import "../public/globals.css";
import "../styles/app.scss";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (navOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [navOpen]);

  const router = useRouter();

  useEffect(() => {
    setNavOpen(false);
  }, [router.pathname]);

  return (
    <GlowProvider>
      <Head>
        <title>{pageProps.markdoc?.frontmatter.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <TopNav
        navOpen={navOpen}
        toggleNav={() => {
          setNavOpen((open) => !open);
        }}
      />

      <main>
        <SideNav />
        <Component {...pageProps} />
      </main>

      <style jsx>{`
        main {
          display: grid;
          grid-template-columns: 16rem 65ch 1fr;
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

        @media (max-width: 1300px) {
          main {
            grid-template-columns: 12rem 55ch 1fr;
            grid-column-gap: 2rem;
          }
        }

        @media (max-width: 1000px) {
          main > :global(*):nth-child(3) {
            display: none;
          }
        }

        @media (max-width: 800px) {
          main > :global(*):nth-child(1) {
            padding: 1rem;
            position: fixed;
            inset: 0;
            top: var(--top-nav-height);
            background: var(--primary-bg-color);
            z-index: 100;

            transition: var(--transition);
            ${navOpen
              ? `
              opacity: 1;
              transform: translateY(0);
              pointer-events: all;
            `
              : `
              opacity: 0;
              transform: translateY(1rem);
              pointer-events: none;
            `}
          }

          main {
            display: block;
          }

          main > :global(*):nth-child(2) {
            padding-top: 1rem;
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </GlowProvider>
  );
}
