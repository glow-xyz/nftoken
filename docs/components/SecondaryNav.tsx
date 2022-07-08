import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import classNames from "classnames";
import { LuxLink } from "./LuxLink";
import { ChevronRightIcon, XIcon } from "@heroicons/react/solid";
import { AnimatePresence, motion } from "framer-motion";
import { ResponsiveBreakpoint } from "../utils/style-constants";

export type SecondaryNavLink = { title: string; href: string };

export function SecondaryNav({ links }: { links: SecondaryNavLink[] }) {
  const router = useRouter();

  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (navOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [navOpen]);

  useEffect(() => {
    // Close nav when a nav link is clicked.
    setNavOpen(false);
  }, [router.pathname]);

  return (
    <>
      <div className="secondary-nav-container">
        <div className="desktop-nav">
          <Links links={links} />
        </div>

        <button className="open-mobile-nav" onClick={() => setNavOpen(true)}>
          <ChevronRightIcon />
        </button>

        <AnimatePresence>
          {navOpen && (
            <motion.nav className="mobile-nav">
              <motion.div
                className="mobile-nav-backdrop"
                onClick={() => setNavOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                className="mobile-nav-inner"
                initial={{ opacity: 0, x: "-100vw" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "-100vw" }}
                transition={{ type: "tween" }}
              >
                <Links links={links} />
              </motion.div>
              <button
                className="close-mobile-nav"
                onClick={() => setNavOpen(false)}
              >
                <XIcon />
              </button>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .secondary-nav-container {
          position: relative;
        }

        .open-mobile-nav {
          background-color: var(--primary-bg-color);
          color: var(--primary-color);
          border: 1px solid var(--secondary-border-color);
          height: 2.5rem;
          width: 2.5rem;
          border-radius: 99rem;
          box-shadow: var(--shadow-sm);
          position: fixed;
          top: 9rem;
          left: -1.25rem;
          padding: 0;

          display: none;
          align-items: center;
          justify-content: end;
        }

        .open-mobile-nav :global(svg) {
          height: 1.5rem;
          width: 1.5rem;
        }

        .secondary-nav-container :global(.mobile-nav) {
          position: fixed;
          z-index: 20;
          inset: 0;
        }

        .secondary-nav-container :global(.mobile-nav-backdrop) {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.8);
        }

        .secondary-nav-container :global(.mobile-nav-inner) {
          position: absolute;
          inset: 0 4rem 0 0;
          background-color: var(--primary-bg-color);
          padding: 1.5rem;
          padding-top: 5rem;
        }

        .close-mobile-nav {
          color: white;
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
        }

        .close-mobile-nav :global(svg) {
          height: 1.5rem;
          width: 1.5rem;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          .open-mobile-nav {
            display: flex;
          }

          .desktop-nav {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

const Links = ({ links }: { links: SecondaryNavLink[] }) => {
  const router = useRouter();

  return (
    <>
      {links.map((item) => {
        const active = router.pathname === item.href;

        return (
          <div className="nav-item" key={item.title}>
            {active && (
              <motion.div
                className="active-highlight"
                layout="position"
                layoutId="secondary-nav-active-highlight"
                transition={{ type: "tween", duration: 0.2 }}
              />
            )}
            <LuxLink
              href={item.href}
              className={classNames({
                current: router.pathname === item.href,
              })}
            >
              {item.title}
            </LuxLink>
          </div>
        );
      })}

      <style jsx>{`
        .nav-item :global(a) {
          display: block;
          margin-bottom: 0.25rem;
          padding: 0.25rem 0.75rem;
          color: var(--secondary-color);
          font-weight: var(--medium-font-weight);
          border-radius: var(--border-radius);
          transition: var(--transition);
        }

        .nav-item :global(a):not(.current):hover {
          color: var(--primary-color);
          background-color: var(--tertiary-bg-color);
        }

        .nav-item :global(a).current {
          color: var(--white);
          // background-color: var(--brand-color);
        }

        .nav-item {
          position: relative;
        }

        .nav-item :global(.active-highlight) {
          position: absolute;
          inset: 0;
          border-radius: var(--border-radius);
          background-color: var(--brand-color);
          z-index: -1;
        }
      `}</style>
    </>
  );
};
