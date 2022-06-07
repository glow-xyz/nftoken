import { GlowProvider } from "@glow-app/glow-react";
import "@glow-app/glow-react/dist/styles.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import classNames from "classnames";

import "../public/globals.css";
import "../styles/app.scss";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <GlowProvider>
      <Head>
        <title>{pageProps.markdoc?.frontmatter.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="wrapper">
        <header className="spread">
          <Link href="/">
            <a className="logo">NFToken</a>
          </Link>
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
        </header>

        <div className="content">
          <nav>
            <div className="nav-inner">
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
          </nav>

          <main>
            <Component {...pageProps} />
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

        .logo {
          display: block;
          font-weight: 900;
          color: var(--primary-color);
          margin: 0;
          font-size: 1.1rem;
        }

        .github {
          display: block;
          background-color: var(--brand-color);
          color: var(--white);
          font-size: var(--small-font-size);
          font-weight: 600;
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
          grid-template-columns: 320px 1fr;
          height: 100%;
        }

        nav {
          border-right: 1px solid var(--secondary-border-color);
          height: 100%;
        }

        .nav-inner {
          padding-left: 3rem;
          position: sticky;
          top: 6rem;
        }

        nav a {
          color: var(--secondary-color);
          display: block;
          margin-bottom: 0.3rem;
          transition: none;
          max-width: max-content;
        }

        nav a.current {
          color: var(--brand-color);
          font-weight: 600;
          text-decoration: underline;
        }

        main {
          padding: 3rem 4rem;
          max-width: 50rem;
        }
      `}</style>
    </GlowProvider>
  );
}

const nav = [
  { title: "Overview", href: "/" },
  { title: "Installation", href: "/installation" },
  { title: "Usage", href: "/usage" },
];
