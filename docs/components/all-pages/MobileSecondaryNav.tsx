import classNames from "classnames";
import { useRouter } from "next/router";
import { ResponsiveBreakpoint } from "../../utils/style-constants";
import { SecondaryNavLink } from "./DesktopSecondaryNav";
import { LuxLink } from "../atoms/LuxLink";

export function MobileSecondaryNav({ links }: { links: SecondaryNavLink[] }) {
  const router = useRouter();
  return (
    <div className="nav-container bg-secondary">
      <div className="scrolly-container">
        {links.map((item) => {
          return (
            <div className="nav-item" key={item.title}>
              <LuxLink
                href={item.href}
                className={classNames("font-weight-medium", {
                  current: router.pathname === item.href,
                })}
              >
                {item.title}
              </LuxLink>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .nav-container {
          display: none;
          border-bottom: 1px solid var(--divider-color);
          min-height: 0;
          width: 100%;
          overflow: auto;
        }

        .scrolly-container {
          display: flex;
          width: auto;
          min-width: min-content;
        }

        @media (max-width: ${ResponsiveBreakpoint.small}) {
          .nav-container {
            display: flex;
          }
        }

        .nav-item :global(a) {
          display: block;
          padding: 0.5rem 0.75rem;
          color: var(--secondary-color);
          white-space: nowrap;
          background-color: var(--secondary-bg-color);
          border-right: 1px solid var(--divider-color);
        }

        .nav-item :global(a):not(.current):hover {
          color: var(--primary-color);
          background-color: var(--tertiary-bg-color);
        }

        .nav-item :global(a).current {
          color: var(--white);
          background-color: var(--brand-color);
        }
      `}</style>
    </div>
  );
}
