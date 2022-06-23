import classNames from "classnames";
import { useFormikContext } from "formik";
import lodashSize from "lodash/size";
import React, { DOMAttributes } from "react";
import { LuxLink } from "./LuxLink";

import { LuxSpinner } from "./LuxSpinner";

export type LuxButtonProps = {
  label: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  size?: "small" | "medium" | "large";
  iconPlacement?: "left" | "right" | "icon-only";
  color?:
    | "brand"
    | "primary"
    | "secondary"
    | "light"
    | "success"
    | "error"
    | "zoom"
    | "twitter"
    | "discord"
    | "ethereum"
    | "google"
    | "youtube"
    | "slack";
  variant?: "solid" | "outline" | "link" | "naked";
  rounded?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: DOMAttributes<HTMLElement>["onClick"];
  href?: string;
  forceOpenInNewTab?: boolean;
  forcePageChange?: boolean;
  className?: string;
  shouldSubmit?: boolean;
} & (React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
> &
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >);

export const LuxButton = ({
  label,
  icon,
  fullWidth,
  size = "medium",
  iconPlacement = "left",
  color = "primary",
  variant = "solid",
  rounded,
  disabled,
  loading,
  onClick,
  href,
  forceOpenInNewTab,
  forcePageChange,
  className,
  shouldSubmit,
  ref,
  ...props
}: LuxButtonProps) => {
  const svg = loading ? <LuxSpinner /> : icon;
  const Button = href ? LuxLink : "button";
  // button doesn't support forceOpenInNewTab so we don't pass it down
  const extraProps = href ? { forceOpenInNewTab, forcePageChange } : {};

  return (
    <Button
      {...props}
      ref={ref as any}
      href={href!}
      className={classNames(
        "btn luma-button flex-center",
        size,
        color,
        variant,
        className,
        {
          loading,
          round: rounded,
          "full-width": fullWidth,
          "no-icon": !icon,
          "icon-left": icon && iconPlacement === "left",
          "icon-right": icon && iconPlacement === "right",
          "icon-only": icon && iconPlacement === "icon-only",
        }
      )}
      onClick={onClick}
      disabled={loading || disabled}
      type={href ? undefined : shouldSubmit ? "submit" : "button"}
      {...extraProps}
    >
      {iconPlacement === "left" && svg}
      {iconPlacement === "icon-only" ? (
        svg
      ) : (
        <div className="label">{label}</div>
      )}
      {iconPlacement === "right" && svg}
    </Button>
  );
};

export type LuxSubmitButtonProps = {
  className?: string;
  outline?: boolean;
  disabledWhenErrorBeforeSubmit?: boolean;
} & Omit<React.ComponentPropsWithoutRef<typeof LuxButton>, "should_submit">;

export const LuxSubmitButton = ({
  label,
  icon,
  fullWidth,
  size = "medium",
  iconPlacement = "left",
  color = "primary",
  variant = "solid",
  className,
  rounded,
  disabled,
  disabledWhenErrorBeforeSubmit,
}: LuxSubmitButtonProps) => {
  const { errors, submitCount, isSubmitting } = useFormikContext();
  const hasError =
    (submitCount > 0 || disabledWhenErrorBeforeSubmit) &&
    lodashSize(errors) > 0;

  // Note: We don't call submitForm on onClick because Firefox will trigger both onClick
  // and the native form submit events which will result in a double submit of the form
  return (
    <LuxButton
      label={label}
      icon={icon}
      fullWidth={fullWidth}
      size={size}
      iconPlacement={iconPlacement}
      color={color}
      className={className}
      variant={variant}
      rounded={rounded}
      disabled={disabled || isSubmitting || hasError}
      loading={isSubmitting}
      shouldSubmit={true}
    />
  );
};
