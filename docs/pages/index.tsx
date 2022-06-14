import Head from "next/head";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/outline";
// import { ResponsiveBreakpoint } from "../utils/style-constants";

export default function Index() {
  return (
    <>
      <Head>
        <title>NFToken</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="wrapper">
        <div className="inner">
          <div className="content">
            <img className="logo" src="/logo-brand-color.svg" />
            <h1>
              A simple, inexpensive <br />
              Solana NFT Standard
            </h1>
            <div className="buttons flex-center">
              <Link href="/overview">
                <a className="mr-5 luma-button flex-center icon-right round solid large brand">
                  <span>Learn more</span>
                  <ChevronRightIcon />
                </a>
              </Link>
              <Link href="/getting-started">
                <a className="luma-button flex-center icon-right round link large secondary">
                  Create an NFT
                  <ChevronRightIcon />
                </a>
              </Link>
            </div>
          </div>
          <img src="/sketch.png" alt="" className="graphic" />
        </div>
      </div>

      <style jsx>{`
        .wrapper {
          border-top: 4px solid var(--brand-color);
          display: grid;
          place-items: center;
          height: 85vh; /* For visual centering. */
        }

        .inner {
          padding: 1.5rem;
          max-width: 1200px;

          display: grid;
          grid-template-columns: max-content 1fr;
          grid-column-gap: 130px;
        }

        .content {
          margin-top: 2rem;
        }

        .graphic {
          width: 100%;
          display: block;
          max-width: 300px;
        }

        .logo {
          display: block;
          height: 2rem;
          margin-bottom: 1rem;
          margin-left: 0.25rem;
        }

        h1 {
          font-size: 4rem;
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        .buttons {
          margin-top: 3rem;
        }
      `}</style>
    </>
  );
}
