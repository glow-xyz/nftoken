import type { AppProps } from "next/app";

import "../public/globals.css";
import "../styles/app.scss"
import { TopNav } from "../components/shell/TopNav";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <TopNav />

      <Component {...pageProps} />
    </>
  );
}
