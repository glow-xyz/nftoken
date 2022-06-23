import React from "react";

export const AttributeTable = ({
  title = "Attributes",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <section>
        <h2>{title}</h2>
        {children}
      </section>
      <style jsx>{`
        h2 {
          font-size: 1.1rem;
          font-weight: var(--medium-font-weight);
          border-bottom: 1px solid var(--secondary-border-color);
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
          margin-top: 0;
        }

        section {
          margin-top: 2rem;
          margin-bottom: 3rem;
        }

        section > :global(div:not(:last-child)) {
          margin-bottom: 1rem;
          padding-bottom: 0.25rem;
          border-bottom: 1px solid var(--secondary-border-color);
        }
      `}</style>
    </>
  );
};

export const AttributeRow = ({
  attribute,
  type,
  children,
}: {
  attribute: string;
  type: string;
  children: React.ReactNode;
}) => {
  return (
    <div>
      <p className="mb-2">
        <span className="mono text-secondary font-weight-bold">
          {attribute}
        </span>{" "}
        <span className="ml-1 text-tertiary font-weight-medium">{type}</span>
      </p>
      <div>{children}</div>
    </div>
  );
};
