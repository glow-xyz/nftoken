import { useRouter } from "next/router";
import classNames from "classnames";
import { LuxLink } from "./LuxLink";
import { ResponsiveBreakpoint } from "../utils/style-constants";

export type SecondaryNavLink = { title: string; href: string };

export function SecondaryNav({ links }: { links: SecondaryNavLink[] }) {
  const router = useRouter();

  const currentNavItem = links.find((item) => item.href === router.pathname);

  return (
    <>
      <div className="container">
        {currentNavItem && (
          <div
            className="active-highlight"
            style={{
              top: links.indexOf(currentNavItem) * 2.25 + "rem",
            }}
          ></div>
        )}

        {links.map((item) => (
          <div className="nav-item" key={item.title}>
            <LuxLink
              href={item.href}
              className={classNames({
                current: router.pathname === item.href,
              })}
            >
              {item.title}
            </LuxLink>
          </div>
        ))}
      </div>

      <style jsx>{`
        .container {
          position: relative;
        }

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
        }

        .active-highlight {
          position: absolute;
          left: 0;
          height: 2rem;
          width: 100%;
          background-color: var(--brand-color);
          border-radius: var(--border-radius);
          z-index: -1;
          transition: var(--transition);
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          .active-highlight {
            display: none;
          }

          .nav-item :global(a).current {
            background-color: var(--brand-color);
          }
        }
      `}</style>
    </>
  );
}
