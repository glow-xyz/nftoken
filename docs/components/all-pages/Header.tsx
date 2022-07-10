import { GlowSignInButton, useGlowContext } from "@glow-xyz/glow-react";
import classNames from "classnames";
import { useRouter } from "next/router";
import { LuxButton } from "../LuxButton";
import { LuxLink } from "../LuxLink";

enum TopLevelTab {
  DOCS,
  DASHBOARD,
}

const TopLevelTabs = [
  {
    id: TopLevelTab.DOCS,
    title: "Docs",
    href: "/docs/overview",
    match: (href: string) => href.startsWith("/docs"),
  },
  // TODO: consider nesting everything under dash
  {
    id: TopLevelTab.DASHBOARD,
    title: "Dashboard",
    href: "/my-nfts",
    match: (href: string) => !href.startsWith("/docs"),
  },
];

export const Header = () => {
  return (
    <>
      <header>
        <div className="header-inner flex-center spread">
          <div className="flex-center gap-3 full-height">
            <HeaderLogo />
            <HeaderTabs />
          </div>

          <AuthButton />
        </div>
      </header>

      <style jsx>{`
        header {
          border-top: 4px solid var(--brand-color);
          border-bottom: 1px solid var(--secondary-border-color);
          background-color: var(--primary-bg-color);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-inner {
          width: 100%;
          margin: 0 auto;
          max-width: var(--page-max-width);
          padding: 0 var(--page-horizontal-padding);
          padding-top: 0.5rem;
        }
      `}</style>
    </>
  );
};

const AuthButton = () => {
  const { user, signOut } = useGlowContext();
  return (
    <>
      {user ? (
        <LuxButton
          label={"Sign Out"}
          size={"small"}
          rounded
          color={"secondary"}
          onClick={() => {
            signOut();
          }}
        />
      ) : (
        <GlowSignInButton
          render={({ glowDetected, signIn }) => (
            <LuxButton
              label={"Sign In"}
              size={"small"}
              rounded
              color={"brand"}
              href={glowDetected ? undefined : "https://glow.app/download"}
              onClick={signIn}
            />
          )}
        />
      )}
    </>
  );
};

const HeaderTabs = () => {
  const router = useRouter();
  return (
    <div className="site-nav flex gap-3">
      {TopLevelTabs.map((tab, idx) => (
        <LuxLink
          key={idx}
          href={tab.href}
          className={classNames(
            "nav-tab font-weight-medium flex-column animated",
            {
              active: tab.match(router.pathname),
            }
          )}
        >
          <div className={"tab-inner"}>{tab.title}</div>
        </LuxLink>
      ))}

      <style jsx>{`
        .site-nav {
          height: 100%;
          min-height: 3.2rem;
        }

        .site-nav :global(a) {
          justify-content: center;
          color: var(--secondary-color);
          transition: var(--transition);
          margin-bottom: -1px;
          border-bottom: 2px solid transparent;
        }

        .tab-inner {
          margin-top: 0.25rem;
        }

        .site-nav :global(a:hover) {
          color: var(--primary-color);
        }

        .site-nav :global(a.active) {
          color: var(--brand-color);
          border-bottom: 2px solid var(--brand-color);
        }
      `}</style>
    </div>
  );
};

const HeaderLogo = () => {
  return (
    <LuxLink href="/docs/overview">
      <img src="/logo.svg" className="logo dark" />
      <img src="/logo-light.svg" className="logo light" />

      <style jsx>{`
        .logo {
          display: block;
          height: 1rem;
          cursor: pointer;
        }

        :global(body.light) .logo.light {
          display: none;
        }

        :global(body.dark) .logo.dark {
          display: none;
        }
      `}</style>
    </LuxLink>
  );
};
