import classNames from "classnames";
import React from "react";
import { ResponsiveBreakpoint } from "../utils/style-constants";
import { Footer } from "./all-pages/Footer";
import { Header } from "./all-pages/Header";
import { DASHBOARD_PAGES, DOC_PAGES } from "./all-pages/navigation-constants";
import { DesktopSecondaryNav } from "./DesktopSecondaryNav";
import { MobileSecondaryNav } from "./MobileSecondaryNav";

type SecondaryNavType = "docs" | "dashboard";
const SecondaryNavToLinks: Record<
  SecondaryNavType,
  Array<{ href: string; title: string }>
> = {
  docs: DOC_PAGES,
  dashboard: DASHBOARD_PAGES,
};

export const PageLayout = ({
  children,
  secondaryNav,
}: {
  children: React.ReactNode;
  secondaryNav: "docs" | "dashboard" | null;
}) => {
  return (
    <div className="page">
      <Header />

      {secondaryNav && (
        <MobileSecondaryNav
          key={secondaryNav}
          links={SecondaryNavToLinks[secondaryNav]}
        />
      )}

      <div
        className={classNames("wrapper", {
          "with-secondary-nav": secondaryNav,
        })}
      >
        {secondaryNav && (
          <DesktopSecondaryNav
            key={secondaryNav}
            links={SecondaryNavToLinks[secondaryNav]}
          />
        )}

        <div className="content min-width-0">{children}</div>
      </div>

      <Footer />

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: grid;
          grid-template-rows: max-content max-content 1fr max-content;
        }

        .wrapper {
          width: 100%;
          margin: 0 auto;
          max-width: var(--page-max-width);
          padding: 1.5rem var(--page-horizontal-padding);
          padding-bottom: 3rem;
          display: grid;
        }

        @media (min-width: ${ResponsiveBreakpoint.small}) {
          .page {
            grid-template-rows: max-content 1fr max-content;
          }

          .wrapper.with-secondary-nav {
            padding-left: calc(var(--page-horizontal-padding) - 0.75rem);
            padding-right: var(--page-horizontal-padding);
            padding-top: 2rem;
            padding-bottom: 3rem;

            display: grid;
            grid-template-columns: 10rem 1fr;
            grid-column-gap: 3rem;
          }
        }
      `}</style>
    </div>
  );
};
