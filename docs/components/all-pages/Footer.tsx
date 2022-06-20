import TwitterIcon from "../../icons/Twitter.svg";
import { ResponsiveBreakpoint } from "../../utils/style-constants";

export const Footer = () => {
  return (
    <footer>
      <div className="footer-inner spread">
        <a href="https://glow.app">
          <img className="dark" src="/glow-logo-dark.svg" />
          <img className="light" src="/glow-logo-light.svg" />
        </a>

        <a
          href="https://twitter.com/glowwallet"
          target="_blank"
          className="twitter luma-button link rounded round icon-only"
        >
          <TwitterIcon />
        </a>
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
            padding: 1.25rem 1.5rem;
          }
        }
      `}</style>
    </footer>
  );
};
