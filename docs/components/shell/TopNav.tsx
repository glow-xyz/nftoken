import { useState } from "react";
import { GlowSignInButton, useGlowContext } from "@glow-app/glow-react";
import Link from "next/link";

export const TopNav = ({
  navOpen,
  toggleNav,
}: {
  navOpen: boolean;
  toggleNav: () => void;
}) => {
  const { user, signOut } = useGlowContext();

  const [confirmSignOut, setConfirmSignOut] = useState(false);
  function handleAuthButtonClick() {
    if (!confirmSignOut) {
      setConfirmSignOut(true);
      return;
    }

    signOut();
    setConfirmSignOut(false);
  }

  return (
    <>
      <header className="flex-center spread">
        <div className="flex-center">
          <button className="menu-button mr-1" onClick={toggleNav}>
            {navOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          <Link href="/">
            <a className="font-weight-bold">NFToken</a>
          </Link>
        </div>

        <div className="flex-center">
          {user ? (
            <button className="auth-button" onClick={handleAuthButtonClick}>
              {confirmSignOut ? (
                "Sign out?"
              ) : (
                <>
                  {user.address.slice(0, 5)}...
                  {user.address.slice(user.address.length - 5)}
                </>
              )}
            </button>
          ) : (
            <GlowSignInButton size="sm" variant="purple" />
          )}

          <Link href={"https://github.com/glow-xyz/nftoken"}>
            <a className="block ml-3">GitHub</a>
          </Link>
        </div>
      </header>

      <style jsx>
        {`
          :global(:root) {
            --top-nav-height: 3.5rem;
          }

          header {
            width: 100%;
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid var(--tertiary-divider-color);
            padding: 0 2rem;
            background-color: var(--secondary-bg-color);
            height: var(--top-nav-height);
          }

          header :global(a) {
            text-decoration: none;
          }

          .menu-button {
            display: none;
          }

          .auth-button {
            display: block;
            background-color: var(--brand-color);
            font-size: var(--small-font-size);
            font-weight: var(--medium-font-weight);
            color: var(--white);
            border-radius: 99px;
            margin-left: 1rem;
            padding: 0.1rem 0.6rem;
          }

          @media (max-width: 800px) {
            header {
              padding: 0 1rem;
            }

            .menu-button {
              display: block;
              color: var(--secondary-color);
              margin-bottom: 3px; /* Visually center */
            }
          }
        `}
      </style>
    </>
  );
};
