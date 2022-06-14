import Head from "next/head";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { ResponsiveBreakpoint } from "../utils/style-constants";

export default function Index() {
  return (
    <>
      <Head>
        <title>NFToken</title>
      </Head>
      <div className="container">
        <div className="inner">
          <h1>NFToken</h1>
          <h2>Solana NFT Standard</h2>
          <Link href="/overview">
            <a className="luma-button flex-center icon-right round outline large brand">
              <span>Read the docs</span>
              <ChevronRightIcon />
            </a>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .container {
          border-top: 4px solid var(--brand-color);
          padding: 8rem;
        }

        h1,
        h2 {
          font-size: 5rem;
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        h1 {
          margin-bottom: 0;
        }

        h2 {
          color: var(--tertiary-color);
        }
      `}</style>
    </>
  );
}
