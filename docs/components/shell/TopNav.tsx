import Link from "next/link";
import React from "react";

export const TopNav = () => {
  return (
    <div className="nav-bar">
      <nav className="flex-center spread">
        <Link href="/" className="flex">
          <a>Nftoken</a>
        </Link>

        <Link href={"https://github.com/glow-xyz/nftoken"}>GitHub</Link>
      </nav>

      <style jsx>
        {`
          .nav-bar {
            top: 0;
            position: fixed;
            z-index: 100;
            display: flex;
            width: 100%;
            background: var(--light);
          }

          nav {
            width: 100%;
            border-bottom: 1px solid var(--divider-color);
            padding: 1rem 2rem 1rem;
          }

          nav :global(a) {
            text-decoration: none;
          }
        `}
      </style>
    </div>
  );
};