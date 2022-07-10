import classNames from "classnames";
import { MintlistStatus } from "./mintlist-utils";

const StatusToDisplay: Record<MintlistStatus, string> = {
  [MintlistStatus.Pending]: "Pending",
  [MintlistStatus.PreSale]: "Pre Sale",
  [MintlistStatus.ForSale]: "For Sale",
  [MintlistStatus.SaleEnded]: "Sale Ended",
};

const StatusToColor: Record<MintlistStatus, PillColor> = {
  [MintlistStatus.Pending]: "yellow",
  [MintlistStatus.PreSale]: "blue",
  [MintlistStatus.ForSale]: "green",
  [MintlistStatus.SaleEnded]: "barney",
};

export const MintlistStatusPill = ({ status }: { status: MintlistStatus }) => {
  return <Pill label={StatusToDisplay[status]} color={StatusToColor[status]} />;
};

type PillColor = "barney" | "blue" | "yellow" | "green" | "gray";

export const Pill = ({ label, color }: { label: string; color: PillColor }) => {
  return (
    <div className={classNames("pill", `pill-${color}`)}>
      {label}

      <style jsx>{`
        .pill {
          white-space: nowrap;
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          line-height: 1;
          border: none;
          padding: var(--small-pill-padding);
          font-size: var(--small-pill-font-size);
        }

        .pill-green {
          color: var(--success-color);
          background-color: var(--success-pale-bg-color);
        }

        .pill-barney {
          color: var(--barney);
          background-color: var(--pale-barney);
        }

        .pill-yellow {
          color: var(--warning-color);
          background-color: var(--warning-pale-bg-color);
        }

        .pill-blue {
          color: var(--blue);
          background-color: var(--pale-blue);
        }

        .pill-gray {
          color: var(--gray);
          background-color: var(--pale-gray);
        }
      `}</style>
    </div>
  );
};
