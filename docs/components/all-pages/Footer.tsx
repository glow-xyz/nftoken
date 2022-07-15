import TwitterIcon from "../../icons/Twitter.svg";
import GitHubIcon from "../../icons/GitHub.svg";
import { LuxButton } from "../atoms/LuxButton";
import { ResponsiveBreakpoint } from "../../utils/style-constants";

export const Footer = () => {
  return (
    <footer>
      <div className="footer-inner spread">
        <a href="https://glow.app">
          <img className="dark" src="/glow-logo-dark.svg" />
          <img className="light" src="/glow-logo-light.svg" />
        </a>

        <div className="flex-center gap-3">
          <LuxButton
            label="GitHub"
            icon={<GitHubIcon />}
            href="https://github.com/glow-xyz/nftoken"
            iconPlacement="icon-only"
            color="primary"
            variant="link"
            rounded
            size="large"
          />
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
      </div>

      <style jsx>{`
        footer {
          background-color: var(--tertiary-bg-color);
          width: 100%;
        }

        .footer-inner {
          max-width: var(--page-max-width);
          padding: 2rem var(--page-horizontal-padding);
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
