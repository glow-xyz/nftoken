import type { AppProps } from "next/app";

import "../public/globals.css";
import "../styles/app.scss";

import { TopNav } from "../components/shell/TopNav";
import { SideNav } from "../components/shell/SideNav";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <TopNav />

      <main>
        <SideNav />
        <Component {...pageProps} />
      </main>

      <style jsx>{`
        main {
          display: grid;
          grid-template-columns: 14rem 65ch 1fr;
          grid-column-gap: 2rem;
          padding: 2rem;
          padding-bottom: 4rem;
        }
      `}</style>
    </>
  );
}
