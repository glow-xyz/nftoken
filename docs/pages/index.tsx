import { Head } from "../components/Head";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { ResponsiveBreakpoint } from "../utils/style-constants";

export default function Index() {
  return (
    <>
      <Head title="NFToken — a simple, inexpensive Solana NFT Standard" />
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
                <a className="luma-button flex-center icon-right round solid large brand">
                  <span>Learn more</span>
                  <ChevronRightIcon />
                </a>
              </Link>
              <Link href="/create-an-nft">
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
          grid-template-columns: 1fr 300px;
          grid-column-gap: 120px;
          align-items: center;
        }

        .content {
          margin-top: 2rem;
        }

        .graphic {
          width: 100%;
          display: block;
        }

        :global(body.dark) .graphic {
          filter: invert(1);
          mix-blend-mode: lighten;
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

        .buttons a:first-child {
          margin-right: 3rem;
        }

        @media (max-width: ${ResponsiveBreakpoint.large}) {
          .graphic {
            max-width: 300px;
            margin: 0 auto;
          }

          .inner {
            grid-template-columns: 1fr 200px;
          }

          .content {
            margin-top: 1rem;
          }

          .logo {
            height: 1rem;
          }

          h1 {
            font-size: 2.5rem;
            font-weight: 600;
          }

          .buttons {
            margin-top: 2rem;
          }

          .buttons a:first-child {
            margin-right: 1.5rem;
          }

          /* Reset large button styles. */
          .luma-button {
            --padding: var(--input-padding);
            --size: var(--input-font-size);
            --gap: var(--input-element-gap);
            --height: var(--input-height);
          }
        }

        @media (max-width: ${ResponsiveBreakpoint.small}) {
          .wrapper {
            place-items: start center;
          }

          .inner {
            padding-bottom: 6rem;

            grid-template-columns: 1fr;
            grid-template-rows: max-content max-content;
            grid-row-gap: 75px;
          }
        }
      `}</style>
    </>
  );
}
