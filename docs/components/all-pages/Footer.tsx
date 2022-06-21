import TwitterIcon from "../../icons/Twitter.svg";
import { LuxButton } from "./LuxButton";
import { ResponsiveBreakpoint } from "../../utils/style-constants";

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
          background-color: var(--tertiary-bg-color);
          width: 100%;
        }

        .footer-inner {
          padding: 2rem 1.5rem;
          max-width: 60rem;
          width: 100%;
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
          .footer-inner {
            padding-top: 1.25rem;
            padding-bottom: 1.25rem;
          }
        }
      `}</style>
    </footer>
  );
};
