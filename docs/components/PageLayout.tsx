import { Header } from "./all-pages/Header";
import { Footer } from "./all-pages/Footer";
import { Toaster } from "react-hot-toast";
import { SecondaryNav, SecondaryNavLink } from "./SecondaryNav";
import classNames from "classnames";

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
          className={classNames("content", {
            "with-secondary-nav": secondaryNavLinks,
          })}
        >
          {secondaryNavLinks && (
            <div>
              <SecondaryNav links={secondaryNavLinks} />
            </div>
          )}
          <div>{children}</div>
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

        .content {
          width: 100%;
          max-width: 60rem;
          margin: 0 auto;
          padding: 1.5rem;
          padding-bottom: 3rem;
        }

        .content.with-secondary-nav {
          padding-left: 0.75rem;
          padding-right: 1.5rem;
          padding-top: 2rem;
          padding-bottom: 3rem;

          display: grid;
          grid-template-columns: 10rem 1fr;
          grid-column-gap: 5rem;
        }
      `}</style>
    </>
  );
};
