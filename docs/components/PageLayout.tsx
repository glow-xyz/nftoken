import classNames from "classnames";
import React from "react";
import { Toaster } from "react-hot-toast";
import { ResponsiveBreakpoint } from "../utils/style-constants";
import { Footer } from "./all-pages/Footer";
import { Header } from "./all-pages/Header";
import { DOC_PAGES, MINTLIST_PAGES } from "./all-pages/navigation-constants";
import { SecondaryNav } from "./SecondaryNav";

type SecondaryNav = "docs" | "mintlists";
const SecondaryNavToLinks: Record<
  SecondaryNav,
  Array<{ href: string; title: string }>
> = {
  docs: DOC_PAGES,
  mintlists: MINTLIST_PAGES,
};

export const PageLayout = ({
  children,
  secondaryNav,
}: {
  children: React.ReactNode;
  secondaryNav: "docs" | "mintlists" | null;
}) => {
  return (
    <>
      <div className="page">
        <Header />

        <div
          className={classNames("wrapper", {
            "with-secondary-nav": secondaryNav,
          })}
        >
          {secondaryNav && (
            <div className="secondary-nav-container" key={secondaryNav}>
              <SecondaryNav links={SecondaryNavToLinks[secondaryNav]} />
            </div>
          )}
          <div className="content min-width-0">{children}</div>
        </div>
        <Footer />
      </div>

      <Toaster />

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: grid;
          grid-template-rows: max-content 1fr max-content;
        }

        .wrapper {
          width: 100%;
          margin: 0 auto;
          max-width: var(--page-max-width);
          padding: 1.5rem var(--page-horizontal-padding);
          padding-bottom: 3rem;
        }

        .wrapper.with-secondary-nav {
          padding-left: 0.75rem;
          padding-right: 1.5rem;
          padding-top: 2rem;
          padding-bottom: 3rem;

          display: grid;
          grid-template-columns: 10rem 1fr;
          grid-column-gap: 5rem;
        }

        .secondary-nav-container {
          position: sticky;
          top: 9rem;
          height: max-content;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          .wrapper.with-secondary-nav {
            grid-template-columns: 1fr;
            grid-template-rows: 0 auto;
            padding: 1.5rem;
            padding-bottom: 3rem;
          }

          .secondary-nav-container {
            position: relative;
          }
        }
      `}</style>
    </>
  );
};
