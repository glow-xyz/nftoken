import { GlowProvider } from "@glow-xyz/glow-react";
import "@glow-xyz/glow-react/dist/styles.css";

import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import React from "react";
import { Toaster } from "react-hot-toast";
import { NextPreviousButtons } from "../components/all-pages/NextPreviousButtons";

import { NetworkProvider } from "../components/NetworkContext";

import { PageLayout } from "../components/PageLayout";
import { SocialHead } from "../components/SocialHead";
import "../styles/app.scss";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const router = useRouter();

  const isDocs = router.pathname.startsWith("/docs");

  return (
    <GlowProvider>
      <NetworkProvider>
        <SocialHead />

        {isDocs ? (
          <DocsPage {...props} />
        ) : (
          <PageLayout secondaryNav={"dashboard"}>
            <Component {...pageProps} />
          </PageLayout>
        )}

        <Toaster />
      </NetworkProvider>
    </GlowProvider>
  );
}

const DocsPage = ({ Component, pageProps }: AppProps) => {
  return (
    <PageLayout secondaryNav={"docs"}>
      <SocialHead subtitle={pageProps.markdoc?.frontmatter.title} />
      <Component {...pageProps} />

      <NextPreviousButtons />
    </PageLayout>
  );
};
