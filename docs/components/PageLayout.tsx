import { Header } from "./all-pages/Header";
import { Footer } from "./all-pages/Footer";
import { Toaster } from "react-hot-toast";
import { SecondaryNav, SecondaryNavLink } from "./SecondaryNav";
import classNames from "classnames";

import { ResponsiveBreakpoint } from "../utils/style-constants";

export const PageLayout = ({
  children,
  secondaryNavLinks,
}: {
  children: React.ReactNode;
  secondaryNavLinks?: SecondaryNavLink[];
}) => {
  return (
    <>
      <div className="page">
        <Header />
        <div
          className={classNames("wrapper", {
            "with-secondary-nav": secondaryNavLinks,
          })}
        >
          {secondaryNavLinks && (
            <div className="secondary-nav-container">
              <SecondaryNav links={secondaryNavLinks} />
            </div>
          )}
          <div className="content">{children}</div>
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
          max-width: 62rem;
          margin: 0 auto;
          padding: 1.5rem;
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
