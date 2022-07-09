import classNames from "classnames";
import { MintlistStatus } from "./mintlist-utils";

const StatusToDisplay: Record<MintlistStatus, string> = {
  [MintlistStatus.Pending]: "Pending",
  [MintlistStatus.PreSale]: "Pre Sale",
  [MintlistStatus.ForSale]: "For Sale",
  [MintlistStatus.SaleEnded]: "Sale Ended",
};

export const MintlistStatusPill = ({ status }: { status: MintlistStatus }) => {
  return (
    <div className={classNames("mintlist-pill", status)}>
      {StatusToDisplay[status]}

      <style jsx>{`
        .mintlist-pill {
          white-space: nowrap;
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          line-height: 1;
          border: none;
          padding: var(--small-pill-padding);
          font-size: var(--small-pill-font-size);
        }

        .for-sale {
          color: var(--success-color);
          background-color: var(--success-pale-bg-color);
        }

        .pre-sale {
          color: var(--barney);
          background-color: var(--pale-barney);
        }

        .pending {
          color: var(--warning-color);
          background-color: var(--warning-pale-bg-color);
        }

        .sale-ended {
          color: var(--blue);
          background-color: var(--pale-blue);
        }
      `}</style>
    </div>
  );
};
