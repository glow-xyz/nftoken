import classNames from "classnames";
import React from "react";

export const LuxInputLabel = ({
  text,
  size = "medium",
  className,
  noMargin,
  focused,
  htmlFor,
}: {
  text: React.ReactNode;
  size?: "medium" | "large";
  className?: string | null;
  noMargin?: boolean;
  focused?: boolean;
  htmlFor?: string;
}) => {
  if (!text) {
    return null;
  }

  return (
    <label
      className={classNames("luma-input-label", size, className, {
        "no-margin": noMargin,
        focused,
        clickable: htmlFor,
      })}
      htmlFor={htmlFor}
    >
      {text}
    </label>
  );
};
