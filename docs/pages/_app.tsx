import { GlowProvider } from "@glow-xyz/glow-react";
import "@glow-xyz/glow-react/dist/styles.css";

import { NetworkProvider } from "../components/NetworkContext";

import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { NextPreviousButtons } from "../components/all-pages/NextPreviousButtons";
import { SocialHead } from "../components/SocialHead";
import "../public/globals.css";
import "../styles/app.scss";

import { PageLayout } from "../components/PageLayout";
import { DOC_PAGES } from "../components/all-pages/navigation-constants";

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

        <PageLayout secondaryNavLinks={DOC_PAGES}>
          <Component {...pageProps} />

          <NextPreviousButtons />
        </PageLayout>
      </NetworkProvider>
    </GlowProvider>
  );
};
