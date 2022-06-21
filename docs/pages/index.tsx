import { ChevronRightIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { SocialHead } from "../components/SocialHead";
import { ResponsiveBreakpoint } from "../utils/style-constants";
import { Footer } from "../components/all-pages/Footer";

export default function Index() {
  return (
    <>
      <SocialHead />

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
          <img
            src="/sketch.png"
            alt=""
            width="342"
            height="352"
            className="graphic"
          />
        </div>

        <Footer />
      </div>

      <style jsx>{`
        .wrapper {
          border-top: 4px solid var(--brand-color);
          min-height: 100vh;
          display: grid;
          grid-template-rows: 1fr max-content;
        }

        .inner {
          padding: 1.5rem;
          margin: 0 auto;
          width: 100%;
          max-width: 60rem;

          /* To visually center. */
          margin-bottom: 4rem;

          display: grid;
          grid-template-columns: 2fr 1fr;
          grid-column-gap: 6rem;
          align-items: center;
        }

        .content {
          margin-top: 1rem;
        }

        .graphic {
          max-width: 100%;
          height: auto;
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
          font-size: 3.5rem;
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
          .inner {
            grid-column-gap: 4rem;
          }

          .logo {
            height: 1.5rem;
          }

          h1 {
            font-size: 3rem;
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
          h1 {
            font-size: 2.5rem;
          }

          .graphic {
            width: 400px;
          }

          .inner {
            width: auto; /* To center everything horizontally. */
            padding-bottom: 5rem;

            /* No more visual centering necessary. */
            margin-bottom: 0;

            grid-template-columns: 1fr;
            grid-template-rows: max-content max-content;
            grid-row-gap: 5rem;
          }
        }
      `}</style>
    </>
  );
}
