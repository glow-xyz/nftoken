import classNames from "classnames";
import React from "react";

export const LuxEmptyState = ({
  icon,
  className,
  iconStyle = "big",
  title,
  desc,
  cta,
}: {
  icon: React.ReactNode;
  className?: string;
  iconStyle?: "big" | "round";
  title: string;
  desc?: string;
  cta?: React.ReactNode;
}) => {
  return (
    <div
      className={classNames(
        "lux-empty-state flex-center flex-column",
        className
      )}
    >
      <div className={classNames("icon flex-center-center", iconStyle)}>
        {icon}
      </div>
      <h3 className="mt-4 mb-0 p-0">{title}</h3>

      {desc && <div className="mt-2 text-tertiary text-sm">{desc}</div>}
      {cta && <div className="flex-center-center mt-3">{cta}</div>}
    </div>
  );
};
