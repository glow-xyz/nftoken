import classNames from "classnames";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { ResponsiveBreakpoint } from "../utils/style-constants";
import { LuxLink } from "./LuxLink";

export type SecondaryNavLink = { title: string; href: string };

export function DesktopSecondaryNav({
  links,
  navKey,
}: {
  links: SecondaryNavLink[];
  navKey: string;
}) {
  const router = useRouter();

  return (
    <div className="nav-container">
      {links.map((item) => {
        const active = router.pathname === item.href;

        return (
          <div className="nav-item" key={item.title}>
            {active && (
              <motion.div
                className="active-highlight"
                initial={false}
                layout
                layoutId={`desktop-nav-highlight-${navKey}`}
                transition={{ type: "tween", duration: 0.2 }}
              />
            )}
            <LuxLink
              href={item.href}
              className={classNames("animated rounded font-weight-medium", {
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

        .nav-container {
          display: block;
        }

        @media (max-width: ${ResponsiveBreakpoint.small}) {
          .nav-container {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
