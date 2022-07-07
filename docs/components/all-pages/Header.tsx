import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { animate, stagger } from "motion";
import { ExternalLinkIcon, MenuIcon, XIcon } from "@heroicons/react/solid";
import { TabBar } from "./TabBar";
import { ResponsiveBreakpoint } from "../../utils/style-constants";
import classNames from "classnames";
import { motion } from "framer-motion";

export const Header = () => {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (navOpen) {
      animate("nav.mobile", {
        pointerEvents: "auto",
        height: "100%",
        paddingTop: "1.5rem",
        paddingBottom: "1.5rem",
      });
      animate(
        "nav.mobile .nav-item",
        { opacity: [0, 1], transform: ["translateY(-8px)", "translateY(0)"] },
        { delay: stagger(0.05, { start: 0.05 }) }
      );
      document.body.classList.add("no-scroll");
    } else {
      animate("nav.mobile", {
        pointerEvents: "none",
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
      });
      animate("nav.mobile .nav-item", { opacity: 0 });
      document.body.classList.remove("no-scroll");
    }
  }, [navOpen]);

  useEffect(() => {
    setNavOpen(false);
  }, [router.pathname]);

  return (
    <>
      <header>
        <div className="header-inner">
          <div className="spread">
            <div className="flex-center">
              <button
                className="mobile-nav"
                onClick={() => setNavOpen(!navOpen)}
              >
                {navOpen ? <XIcon /> : <MenuIcon />}
              </button>
              <Link href="/docs/overview">
                <a>
                  <img src="/logo.svg" className="logo dark" />
                  <img src="/logo-light.svg" className="logo light" />
                </a>
              </Link>
            </div>
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
            <div>
              <Link href="/docs/overview">
                <a>Docs</a>
              </Link>
              {router.pathname.startsWith("/docs") && (
                <motion.div className="underline" layout layoutId="underline" />
              )}
            </div>
            <div>
              <Link href="/mintlists">
                <a>Mintlists</a>
              </Link>
              {router.pathname === "/mintlists" && (
                <motion.div className="underline" layout layoutId="underline" />
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="mobile">
        <TabBar />
      </nav>

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

        .site-nav a {
          display: block;
          padding-bottom: 0.25rem;
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
