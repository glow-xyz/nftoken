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
      <div className="wrapper">
        <div className="inner">
          <div className="content">
            <h1>NFToken</h1>
            <h2>
              A faster, cheaper, simpler <br />
              Solana NFT standard.
            </h2>
            <div className="buttons flex-center">
              <Link href="/overview">
                <a className="mr-5 luma-button flex-center icon-right round solid large brand">
                  <span>Learn more</span>
                  <ChevronRightIcon />
                </a>
              </Link>
              <Link href="/getting-started">
                <a className="luma-button flex-center icon-right round link large secondary">
                  Mint in your browser
                  <ChevronRightIcon />
                </a>
              </Link>
            </div>
          </div>
          <img src="/sketch.jpg" alt="" />
        </div>
      </div>

      <style jsx>{`
        .wrapper {
          border-top: 4px solid var(--brand-color);
        }

        .inner {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 8rem;

          display: grid;
          grid-template-columns: max-content 1fr;
          grid-column-gap: 130px;
        }

        .content {
          margin-top: 3rem;
        }

        img {
          width: 100%;
          display: block;
          max-width: 300px;
        }

        h1 {
          font-size: 3rem;
          font-weight: 900;
          color: var(--brand-color);
          margin-bottom: 0;
          letter-spacing: -0.07rem;
        }

        h2 {
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
