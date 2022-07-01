import React from "react";
import { Solana } from "@glow-app/solana-client";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { ArrowRightIcon } from "@heroicons/react/solid";
import { startsWithHttp } from "../utils/social-links";
import { SolanaAddress } from "./SolanaAddress";
import { ExternalLink } from "./ExternalLink";
import { LuxButton } from "./LuxButton";
import { ResponsiveBreakpoint } from "../utils/style-constants";

export const ValueList = ({
  attributes,
}: {
  attributes: {
    label: string;
    value: string | number | boolean | null | undefined;
  }[];
}) => {
  return (
    <>
      <div className="container">
        {attributes.map(({ label, value }) => (
          <React.Fragment key={label}>
            <div className="value-container">
              <div className="label">{label}</div>
              <Value value={value} label={label} />
            </div>
          </React.Fragment>
        ))}
      </div>

      <style jsx>{`
        .container {
          padding: 0.75rem;
          border-radius: var(--border-radius);
          background-color: var(--secondary-bg-color);
          font-family: var(--mono-font);
          font-weight: var(--medium-font-weight);
          overflow-wrap: anywhere;
        }

        .value-container {
          display: flex;
          align-items: baseline;
        }

        .value-container .label {
          font-weight: var(--normal-font-weight);
          color: var(--secondary-color);
          width: 8.5rem;
          margin-right: 2rem;
          flex-shrink: 0;
        }

        .value-container + .value-container {
          border-top: 1px solid var(--secondary-border-color);
          margin-top: 0.5rem;
          padding-top: 0.5rem;
        }

        @media (max-width: ${ResponsiveBreakpoint.small}) {
          .value-container .label {
            margin-right: 1rem;
          }
        }
      `}</style>
    </>
  );
};

const Value = ({ label, value }: { label: string; value: any }) => {
  if (typeof value !== "string") {
    return <div>{JSON.stringify(value)}</div>;
  }

  if (value.match(Solana.AddressRegex)) {
    return (
      <>
        <div className="solana-address flex-center flex-wrap">
          <SolanaAddress address={value} />
          {label === "collection" && (
            <LuxButton
              label="View Collection"
              icon={<ArrowRightIcon />}
              href={`/collection/${value}`}
              iconPlacement="right"
              rounded
              size="small"
            />
          )}
        </div>
        <style jsx>{`
          .solana-address {
            gap: 0.25rem 1rem;
          }

          .solana-address :global(.luma-button) {
            font-family: var(--font);
          }
        `}</style>
      </>
    );
  }

  if (startsWithHttp(value)) {
    return (
      <>
        <div className="link">
          <ExternalLink href={value.toString()}>
            <span>{value.toString()}</span> <ExternalLinkIcon />
          </ExternalLink>
        </div>

        <style jsx>{`
          .link :global(svg) {
            margin-bottom: 0.2rem; /* For vertical alignment */
          }
        `}</style>
      </>
    );
  }

  return <div>{value}</div>;
};
