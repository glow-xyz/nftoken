import TwitterIcon from "../icons/Twitter.svg";
import { LuxButton } from "./LuxButton";
import { ResponsiveBreakpoint } from "../utils/style-constants";

export const Footer = () => {
  return (
    <footer>
      <div className="footer-inner spread">
        <a href="https://glow.app">
          <img className="dark" src="/glow-logo-dark.svg" />
          <img className="light" src="/glow-logo-light.svg" />
        </a>

        <LuxButton
          label="Twitter"
          icon={<TwitterIcon />}
          href="https://twitter.com/glowwallet"
          iconPlacement="icon-only"
          color="twitter"
          variant="link"
          rounded
          size="large"
        />
      </div>

      <style jsx>{`
        footer {
          padding: 2rem 1.5rem;
          background-color: var(--tertiary-bg-color);
        }

        .footer-inner {
          width: 100%;
          max-width: 52rem;
          margin: 0 auto;
        }

        footer img {
          display: block;
          height: 1.5rem;
        }

        footer .twitter {
          margin-bottom: 0.25rem;
        }

        footer .twitter :global(svg) {
          height: 1.25rem;
          width: 1.25rem;
        }

        :global(body.light) footer img.light {
          display: none;
        }

        :global(body.dark) footer img.dark {
          display: none;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          footer {
            padding: 1.25rem 1.5rem;
          }
        }
      `}</style>
    </footer>
  );
};
