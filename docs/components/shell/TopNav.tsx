import Link from "next/link";

export const TopNav = () => {
  return (
    <>
      <header className="flex-center spread">
        <Link href="/">
          <a className="font-weight-bold">NFToken</a>
        </Link>

        <Link href={"https://github.com/glow-xyz/nftoken"}>
          <a>GitHub</a>
        </Link>
      </header>

      <style jsx>
        {`
          header {
            width: 100%;
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid var(--tertiary-divider-color);
            padding: 1rem 2rem 1rem;
            background-color: var(--secondary-bg-color);
          }

          header :global(a) {
            text-decoration: none;
          }
        `}
      </style>
    </>
  );
};
