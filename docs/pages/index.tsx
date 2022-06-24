import { ChevronRightIcon } from "@heroicons/react/outline";
import { SocialHead } from "../components/SocialHead";
import { LuxButton } from "../components/LuxButton";
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
              <LuxButton
                label="Learn more"
                icon={<ChevronRightIcon />}
                href="/overview"
                iconPlacement="right"
                rounded
                color="brand"
                size="large"
              />
              <LuxButton
                label="Create an NFT"
                icon={<ChevronRightIcon />}
                href="/create-an-nft"
                iconPlacement="right"
                rounded
                color="secondary"
                variant="link"
                size="large"
              />
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
          gap: 3rem;
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
            gap: 1.5rem;
          }

          /* Reset large button styles. */
          .wrapper :global(.luma-button) {
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
            width: 250px;
            margin: 0 auto;
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
