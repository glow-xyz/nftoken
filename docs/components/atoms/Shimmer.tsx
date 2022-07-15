import classNames from "classnames";
import React, { CSSProperties } from "react";

/**
 * Draws a gray box animating to show loading indication.
 */
export const Shimmer = ({
  width,
  height,
  className,
  style,
  shape = "rounded",
}: {
  width: number | string;
  height: number | string;
  className?: string;
  style?: CSSProperties;
  shape?: "rounded" | "circle" | "rectangle";
}) => {
  return (
    <div className={classNames("shimmer-wrapper", className)}>
      <div
        className={classNames("shimmer mb-0", {
          "shimmer-round": shape === "rounded",
          "shimmer-circle": shape === "circle",
        })}
        style={{ ...style, width, height }}
      />
    </div>
  );
};
