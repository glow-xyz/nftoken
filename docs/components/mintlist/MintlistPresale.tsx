import { DateTime } from "luxon";
import React, { useState } from "react";
import { usePolling } from "../../hooks/usePolling";
import { NftokenTypes } from "../../utils/NftokenTypes";

export const MintlistPresale = ({
  mintlist,
}: {
  mintlist: NftokenTypes.MintlistInfo;
}) => {
  const startAt = DateTime.fromISO(mintlist.go_live_date);
  const [time, setTime] = useState<Duration>(() =>
    startAt.diffNow().shiftTo("hours", "minutes", "seconds")
  );

  usePolling(() => {
    setTime(startAt.diffNow().shiftTo("hours", "minutes", "seconds"));
  }, 250);

  return (
    <div className={"mt-5"}>
      <div className="flex-center-center mb-4 text-xl">
        Sale Starts at{" "}
        {startAt.toLocaleString({
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })}
      </div>

      <div className={"countdown flex-center-center gap-3"}>
        <div className={"text-center time"}>
          <div className={"unit"}>{time.hours}</div>
          <div className={"label"}>Hours</div>
        </div>

        <div className={"text-center time"}>
          <div className={"unit"}>{time.minutes}</div>
          <div className={"label"}>Minutes</div>
        </div>

        <div className={"text-center time"}>
          <div className={"unit"}>{Math.round(time.seconds ?? 0)}</div>
          <div className={"label"}>Seconds</div>
        </div>
      </div>

      <style jsx>{`
        .time {
          flex-basis: 80px;
        }

        .unit {
          font-size: var(--larger-font-size);
          font-weight: var(--medium-font-weight);
        }

        .label {
          color: var(--secondary-color);
        }
      `}</style>
    </div>
  );
};
