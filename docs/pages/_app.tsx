import { GlowProvider } from "@glow-app/glow-react";
import "@glow-app/glow-react/dist/styles.css";

import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Header } from "../components/all-pages/Header";
import { NextPreviousButtons } from "../components/all-pages/NextPreviousButtons";
import { TabBar } from "../components/all-pages/TabBar";
import { Footer } from "../components/all-pages/Footer";
import { SocialHead } from "../components/SocialHead";
import "../public/globals.css";
import "../styles/app.scss";

import { ResponsiveBreakpoint } from "../utils/style-constants";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const router = useRouter();

  if (router.pathname === "/") {
    return <Component {...pageProps} />;
  }

  return <DocsPage {...props} />;
}

const DocsPage = ({ Component, pageProps }: AppProps) => {
  return (
    <GlowProvider>
      <SocialHead subtitle={pageProps.markdoc?.frontmatter.title} />

      <div className="wrapper">
        <Header />

        <div className="content">
          <nav className="desktop">
            <div className="nav-inner">
              <TabBar />
            </div>
          </nav>

          <nav className="mobile">
            <TabBar />
          </nav>

          <main>
            <Component {...pageProps} />

            <NextPreviousButtons />
          </main>
        </div>

        <Footer />
      </div>

      <style jsx>{`
        .wrapper {
          min-height: 100vh;
          display: grid;
          grid-template-rows: max-content 1fr max-content;
        }

        .content {
          display: grid;
          grid-template-columns: max-content 1fr;
          grid-column-gap: 2rem;
          height: 100%;

          width: 100%;
          max-width: 60rem;
          margin: 0 auto;
        }

        nav.desktop {
          height: 100%;
        }

        nav.desktop .nav-inner {
          padding-left: 3rem;
          position: sticky;
          top: 8rem;
        }

        nav.mobile {
          /* Hide nav by default, so there's no flash on page load. */
          height: 0;
          padding: 0 1.5rem;

          position: fixed;
          background-color: var(--primary-bg-color);
          left: 0;
          right: 0;
          z-index: 100;
          overflow: hidden;
        }

        main {
          padding: 3rem 4rem 5rem 4rem;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          .wrapper {
            display: block;
          }

          .content {
            display: block;
          }

          nav.desktop {
            display: none;
          }

          main {
            padding: 1.5rem;
            padding-bottom: 6rem;
          }
        }
      `}</style>
    </GlowProvider>
  );
};
