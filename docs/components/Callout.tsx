import React from "react";

export const Callout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="callout">
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
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <div>{children}</div>
      </div>

      <style jsx>{`
        .callout {
          background-color: var(--secondary-bg-color);
          border: 1px solid var(--primary-border-color);
          padding: 1rem;
          border-radius: var(--border-radius);
          margin-bottom: 1.5rem;

          display: grid;
          grid-template-columns: max-content 1fr;
          grid-column-gap: 1rem;
        }

        svg {
          color: var(--secondary-color);
          height: 1.25rem;
          width: 1.25rem;
          margin-top: 0.05rem;
        }

        div :global(*:last-child) {
          margin-bottom: 0;
        }
      `}</style>
    </>
  );
};
