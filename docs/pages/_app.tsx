import { GlowProvider } from "@glow-app/glow-react";
import "@glow-app/glow-react/dist/styles.css";

import { NetworkProvider } from "../components/NetworkContext";

import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Header } from "../components/all-pages/Header";
import { NextPreviousButtons } from "../components/all-pages/NextPreviousButtons";
import { TabBar } from "../components/all-pages/TabBar";
import { Footer } from "../components/all-pages/Footer";
import { SocialHead } from "../components/SocialHead";
import { ChevronRightIcon } from "@heroicons/react/solid";
import "../public/globals.css";
import "../styles/app.scss";

import { ResponsiveBreakpoint } from "../utils/style-constants";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const router = useRouter();

  if (router.pathname.startsWith("/docs")) {
    return <DocsPage {...props} />;
  }

  return (
    <GlowProvider>
      <NetworkProvider>
        <Component {...pageProps} />
      </NetworkProvider>
    </GlowProvider>
  );
}

const DocsPage = ({ Component, pageProps }: AppProps) => {
  return (
    <GlowProvider>
      <NetworkProvider>
        <SocialHead subtitle={pageProps.markdoc?.frontmatter.title} />

        <div className="wrapper">
          <Header />

          <div className="content">
            <nav className="desktop">
              <div className="nav-inner">
                <TabBar />
              </div>
            </nav>

            <main className={"min-width-0"}>
              <Component {...pageProps} />

              <NextPreviousButtons />
            </main>
          </div>

          <Footer />

          <button className="open-mobile-nav">
            <ChevronRightIcon />
          </button>
        </div>

        <style jsx>{`
          .wrapper {
            min-height: 100vh;
          }

          .content {
            display: grid;
            grid-template-columns: max-content 1fr;
            grid-column-gap: 6rem;
            height: 100%;
            width: 100%;
            max-width: 60rem;
            margin: 0 auto;
          }

          nav.desktop {
            height: 100%;
          }

          nav.desktop .nav-inner {
            padding-left: 0.75rem;
            position: sticky;
            top: 9.5rem;
          }

          main {
            padding-top: 2rem;
            padding-bottom: 5rem;
            padding-right: 1.5rem;
            min-height: 90vh; // Push the footer down on small pages
          }

          .open-mobile-nav {
            background-color: var(--primary-bg-color);
            color: var(--primary-color);
            border: 1px solid var(--secondary-border-color);
            height: 2.5rem;
            width: 2.5rem;
            border-radius: 99rem;
            box-shadow: var(--shadow-sm);
            position: fixed;
            top: 9rem;
            left: -1.25rem;
            display: flex;
            align-items: center;
            justify-content: end;
            padding: 0;
          }

          .open-mobile-nav :global(svg) {
            height: 1.5rem;
            width: 1.5rem;
          }

          @media (max-width: ${ResponsiveBreakpoint.medium}) {
            .content {
              display: block;
            }

            nav.desktop {
              display: none;
            }

            main {
              padding-top: 1.5rem;
              padding-left: 1.5rem;
              padding-right: 1.5rem;
            }
          }
        `}</style>
      </NetworkProvider>
    </GlowProvider>
  );
};
