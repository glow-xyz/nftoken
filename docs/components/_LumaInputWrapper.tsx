import classNames from "classnames";
import React from "react";

import { LuxInputLabel } from "./LuxInputLabel";

export type LumaInputProps = {
  label?: React.ReactNode;
  className?: string;
  size?: "medium" | "large";
  rounded?: boolean;
  variant?: "outline" | "solid";
  error?: boolean;
  twoColumns?: boolean;
  helperText?: string | React.ReactElement | null | undefined | false;
};

export const LumaInputWrapper = ({
  label,
  className,
  children,
  size,
  rounded,
  variant = "outline",
  error,
  helperText,
  accessoryText,
  accessoryTextPlacement = "left",
  twoColumns,
}: Omit<LumaInputProps, "size"> & {
  size: "medium" | "large";
  children: React.ReactNode;
  accessoryText?: React.ReactNode;
  accessoryTextPlacement?: "left" | "right" | null;
}) => {
  if (!accessoryText) {
    accessoryTextPlacement = null;
  }

  return (
    <div
      className={classNames("luma-input-wrapper", size, variant, className, {
        error,
        round: rounded,
        "two-columns": twoColumns,
        "accessory-left": accessoryTextPlacement === "left",
        "accessory-right": accessoryTextPlacement === "right",
      })}
    >
      <div className="inner-wrapper">
        <LuxInputLabel text={label} size={size} />
        <div className="input-wrapper flex-baseline">
          <div className="flex-center flex-1">
            <div className="zero-width-filler">​</div>
            {/*
                TODO
                  - should accessoryText be on the input instead?
                  - does it make sense to allow textarea to have an input?
            */}
            {accessoryTextPlacement === "left" && (
              <div className="accessory-text flex-center">{accessoryText}</div>
            )}
            {children}
            {accessoryTextPlacement === "right" && (
              <div className="accessory-text flex-center">{accessoryText}</div>
            )}
          </div>
        </div>
      </div>

      <div
        className={classNames("helper-text", {
          show: helperText,
        })}
      >
        {helperText}
      </div>
    </div>
  );
};
