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
  attributes: { [key: string]: any };
}) => {
  return (
    <>
      <div className="container">
        {Object.keys(attributes).map((key) => (
          <React.Fragment key={key}>
            <div className="value-container">
              <div className="key">{key}</div>
              <Value value={attributes[key]} attributeKey={key} />
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

        .value-container .key {
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

        .container .divider {
          border-top: 1px solid var(--secondary-border-color);
          grid-column: span 2;
          margin: 0.5rem 0;
        }

        .container .divider:last-of-type {
          display: none;
        }

        @media (max-width: ${ResponsiveBreakpoint.small}) {
          .container {
            grid-column-gap: 1rem;
          }
        }
      `}</style>
    </>
  );
};

const Value = ({
  attributeKey,
  value,
}: {
  attributeKey: string;
  value: any;
}) => {
  if (typeof value !== "string") {
    return <div>{JSON.stringify(value)}</div>;
  }

  if (value.match(Solana.AddressRegex)) {
    return (
      <>
        <div className="solana-address flex-center flex-wrap">
          <SolanaAddress address={value} />
          {attributeKey === "collection" && (
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
