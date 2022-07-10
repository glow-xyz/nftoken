import { GlowProvider } from "@glow-xyz/glow-react";
import "@glow-xyz/glow-react/dist/styles.css";

import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { NextPreviousButtons } from "../components/all-pages/NextPreviousButtons";

import { NetworkProvider } from "../components/NetworkContext";

import { PageLayout } from "../components/PageLayout";
import { SocialHead } from "../components/SocialHead";
import "../public/globals.css";
import "../styles/app.scss";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const router = useRouter();

  const isDocs = router.pathname.startsWith("/docs");

  return (
    <GlowProvider>
      <NetworkProvider>
        {isDocs ? <DocsPage {...props} /> : <Component {...pageProps} />}
      </NetworkProvider>
    </GlowProvider>
  );
}

const DocsPage = ({ Component, pageProps }: AppProps) => {
  return (
    <PageLayout secondaryNav={'docs'}>
      <SocialHead subtitle={pageProps.markdoc?.frontmatter.title} />
      <Component {...pageProps} />

      <NextPreviousButtons />
    </PageLayout>
  );
};
