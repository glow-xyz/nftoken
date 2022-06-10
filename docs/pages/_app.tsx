import { useState, useEffect } from "react";

import { GlowProvider } from "@glow-app/glow-react";
import "@glow-app/glow-react/dist/styles.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import classNames from "classnames";
import { animate, stagger } from "motion";

import { ResponsiveBreakpoint } from "../utils/style-constants";
import "../public/globals.css";
import "../styles/app.scss";

const nav = [
  { title: "Overview", href: "/" },
  { title: "Getting Started", href: "/getting-started" },
  { title: "Technical Details", href: "/technical-details" },
  { title: "Security", href: "/security" },
  { title: "FAQ", href: "/faq" },
  { title: "Changelog", href: "/changelog" },
];

export default function App({ Component, pageProps }: AppProps) {
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
        "nav.mobile a",
        { opacity: 1, transform: ["translateY(-8px)", "translateY(0)"] },
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
      animate("nav.mobile a", { opacity: 0 });
      document.body.classList.remove("no-scroll");
    }
  }, [navOpen]);

  const router = useRouter();

  useEffect(() => {
    setNavOpen(false);
  }, [router.pathname]);

  return (
    <GlowProvider>
      <Head>
        <title>{pageProps.markdoc?.frontmatter.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="wrapper">
        <header>
          <div className="header-inner spread">
            <div className="flex-center">
              <button
                className="mobile-nav"
                onClick={() => setNavOpen(!navOpen)}
              >
                {navOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>

              <Link href="/">
                <a className="logo">NFToken</a>
              </Link>
            </div>

            <a
              href="https://github.com/glow-xyz/nftoken"
              target="_blank"
              className="github"
            >
              <span>GitHub</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        </header>

        <div className="content">
          <nav className="desktop">
            <div className="nav-inner">
              <NavContent />
            </div>
          </nav>

          <nav className="mobile">
            <NavContent />
          </nav>

          <main>
            <Component {...pageProps} />

            <NextPrev />
          </main>
        </div>
      </div>

      <style jsx>{`
        .wrapper {
          min-height: 100vh;
          display: grid;
          grid-template-rows: max-content 1fr;
        }

        header {
          padding: 1.2rem 3rem;
          border-top: 4px solid var(--brand-color);
          border-bottom: 1px solid var(--secondary-border-color);
          position: sticky;
          top: 0;
          background-color: var(--primary-bg-color);
          z-index: 100;
        }

        .header-inner {
          width: 100%;
          max-width: 80rem;
          margin: 0 auto;
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
          font-weight: var(--black-font-weight);
          color: var(--primary-color);
          margin: 0;
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

        .github svg {
          height: 1rem;
          width: 1rem;
          margin-left: 0.3rem;
          transform: translateY(-0.1rem);
        }

        .content {
          display: grid;
          grid-template-columns: max-content 1fr;
          grid-column-gap: 2rem;
          height: 100%;

          width: 100%;
          max-width: 60rem;
          margin: 0 auto;
        }

        nav.desktop {
          height: 100%;
        }

        nav.desktop .nav-inner {
          padding-left: 3rem;
          position: sticky;
          top: 8rem;
        }

        nav.mobile {
          /* Hide nav by default, so there's no flash on page load. */
          height: 0;
          padding: 0 1.5rem;

          position: fixed;
          background-color: var(--white);
          left: 0;
          right: 0;
          z-index: 100;
          overflow: hidden;
        }

        main {
          padding: 3rem 4rem 5rem 4rem;
        }

        @media (max-width: ${ResponsiveBreakpoint.medium}) {
          .wrapper {
            display: block;
          }

          .content {
            display: block;
          }

          nav.desktop {
            display: none;
          }

          header {
            padding: 1rem 1.5rem;
          }

          button.mobile-nav {
            display: block;
          }

          main {
            padding: 1.5rem;
            padding-bottom: 6rem;
          }
        }
      `}</style>
    </GlowProvider>
  );
}

function NavContent() {
  const router = useRouter();

  return (
    <>
      <div className="container">
        <div
          className="active-highlight"
          style={{
            top:
              nav.indexOf(nav.find((item) => item.href === router.pathname)!) *
                2.25 +
              "rem",
          }}
        ></div>

        {nav.map((item) => (
          <Link href={item.href} key={item.title}>
            <a
              className={classNames({
                current: router.pathname === item.href,
              })}
            >
              {item.title}
            </a>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .container {
          position: relative;
        }

        a {
          display: block;
          margin-bottom: 0.25rem;
          padding: 0.25rem 0.75rem;
          color: var(--secondary-color);
          font-weight: var(--medium-font-weight);
          border-radius: var(--border-radius);
          transition: var(--transition);
        }

        a.current {
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

          a.current {
            background-color: var(--brand-color);
          }
        }
      `}</style>
    </>
  );
}

const NextPrev = () => {
  const router = useRouter();

  const current = nav.find((item) => item.href === router.pathname);

  if (!current) {
    return null;
  }

  const index = nav.indexOf(current);

  return (
    <div className="spread">
      {nav[index - 1] && (
        <Link href={nav[index - 1].href}>
          <a className="luma-button round icon-left flex-center p-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {nav[index - 1].title}
          </a>
        </Link>
      )}

      {nav[index + 1] && (
        <Link href={nav[index + 1].href}>
          <a className="luma-button round icon-right flex-center p-0">
            {nav[index + 1].title}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </Link>
      )}

      <style jsx>{`
        div {
          margin-top: 3rem;
        }

        svg {
          display: inline-block;
          margin-bottom: -0.05rem;
        }
      `}</style>
    </div>
  );
};
