import { useRouter } from "next/router";
import { ExternalLinkIcon } from "@heroicons/react/solid";
import { ResponsiveBreakpoint } from "../../utils/style-constants";
import { motion } from "framer-motion";
import { LuxLink } from "../LuxLink";

enum TopLevelTab {
  DOCS,
  NFTS,
  MINTLISTS,
}
const TopLevelTabs = [
  {
    id: TopLevelTab.DOCS,
    title: "Docs",
    href: "/docs/overview",
    match: (href: string) => href.startsWith("/docs"),
  },
  {
    id: TopLevelTab.NFTS,
    title: "Create an NFT",
    href: "/nft/create",
    match: (href: string) => href === "/nft/create",
  },
  {
    id: TopLevelTab.MINTLISTS,
    title: "Mintlists",
    href: "/mintlists",
    match: (href: string) => href.startsWith("/mintlist"), // Matches both /mintlists and /mintlist/[mintlistAddress]
  },
];

export const Header = () => {
  const router = useRouter();

  return (
    <>
      <header>
        <div className="header-inner">
          <div className="flex-center spread">
            <LuxLink href="/docs/overview">
              <img src="/logo.svg" className="logo dark" />
              <img src="/logo-light.svg" className="logo light" />
            </LuxLink>
            <a
              href="https://github.com/glow-xyz/nftoken"
              target="_blank"
              className="github"
            >
              <span>GitHub</span>
              <ExternalLinkIcon />
            </a>
          </div>

          <div className="site-nav">
            {TopLevelTabs.map((tab) => (
              <div key={tab.id}>
                <LuxLink href={tab.href}>{tab.title}</LuxLink>
                {tab.match(router.pathname) && (
                  <motion.div
                    className="underline"
                    layout
                    layoutId="underline"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <style jsx>{`
        header {
          border-top: 4px solid var(--brand-color);
          border-bottom: 1px solid var(--secondary-border-color);
          background-color: var(--primary-bg-color);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-inner {
          width: 100%;
          margin: 0 auto;
          max-width: 60rem;
          padding: 1.5rem;
          padding-bottom: 0;
        }

        button.mobile-nav {
          display: none;
          line-height: 1;
          margin-right: 0.75rem;
          background-color: var(--brand-color);
          color: var(--white);
          border-radius: 0.5rem;
          padding: 0.1rem 0.3rem 0.2rem 0.3rem;
        }

        .logo {
          display: block;
          height: 1rem;
          cursor: pointer;
        }

        :global(body.light) .logo.light {
          display: none;
        }

        :global(body.dark) .logo.dark {
          display: none;
        }

        .github {
          display: block;
          background-color: var(--brand-color);
          color: var(--white);
          font-size: var(--small-font-size);
          font-weight: var(--medium-font-weight);
          height: max-content;
          padding: 0.2rem 0.8rem;
          border-radius: 99px;
        }

        .github :global(svg) {
          margin-left: 0.3rem;
          transform: translateY(-0.1rem);
        }

        nav.mobile {
          /* Hide nav by default, so there's no flash on page load. */
          height: 0;
          padding: 0 1.5rem;

          position: fixed;
          background-color: var(--primary-bg-color);
          left: 0;
          right: 0;
          top: 4rem;
          overflow: hidden;
          z-index: 9;
        }

        .site-nav {
          margin-top: 1rem;
          display: flex;
          gap: 1rem;
        }

        .site-nav :global(a) {
          display: block;
          padding-bottom: 0.4rem;
          font-weight: 500;
          color: var(--primary-color);
          transition: var(--transition);
        }

        .site-nav :global(.underline) {
          height: 2px;
          background-color: var(--brand-color);
          margin-bottom: -1.5px;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          .header-inner {
            padding-top: 1rem;
          }

          button.mobile-nav {
            display: block;
          }
        }
      `}</style>
    </>
  );
};
