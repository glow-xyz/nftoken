import { ChevronRightIcon } from "@heroicons/react/outline";
import { SocialHead } from "../components/SocialHead";
import { LuxButton } from "../components/LuxButton";
import { ResponsiveBreakpoint } from "../utils/style-constants";

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
          gap: 3rem;
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
