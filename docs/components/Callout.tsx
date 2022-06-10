import React from "react";
import { LightBulbIcon } from "@heroicons/react/outline";

export const Callout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="callout">
        <LightBulbIcon />
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

        .callout :global(svg) {
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
