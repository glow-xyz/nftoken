import classNames from "classnames";
import React from "react";

export type SwitcherOption<Value extends string | number> = {
  label: string;
  icon?: React.ReactNode;
  value: Value;
};

type ButtonSwitcherProps<Value extends string | number> = {
  className?: string;
  disabled?: boolean;
  hideIconsBreakpoint?: "tiny" | "small";
  maxWidth?: number | string;
  minWidth?: number | string;
  options: SwitcherOption<Value>[];
  round?: boolean;
  selectedOptionValue: Value;
  setSelectedOption: (option: SwitcherOption<Value>) => void;
  smallSizeBreakpoint?: "always" | "tiny" | "small";
};

export const ButtonSwitcher = <Value extends string | number>({
  className,
  disabled,
  hideIconsBreakpoint,
  maxWidth,
  minWidth,
  options,
  round,
  selectedOptionValue,
  setSelectedOption,
  smallSizeBreakpoint,
}: ButtonSwitcherProps<Value>): JSX.Element => {
  let selectedIndex = -2;
  for (let i = 0; i < options.length; i++) {
    if (selectedOptionValue === options[i].value) {
      selectedIndex = i;
    }
  }

  return (
    <div
      className={classNames(
        "lux-button-switcher",
        smallSizeBreakpoint,
        className,
        {
          [`hide-icons-${hideIconsBreakpoint}`]: hideIconsBreakpoint,
          round,
          disabled,
        }
      )}
      style={{
        minWidth: minWidth || "auto",
        maxWidth: maxWidth || "auto",
        // @ts-ignore
        "--option-length": options.length,
      }}
    >
      <div className="segments">
        {options.map((o, i) => (
          <button
            type="button"
            className={classNames("btn segment flex-center animated", {
              selected: i === selectedIndex,
              nodivider: i === selectedIndex || i - 1 === selectedIndex,
            })}
            key={i}
            onClick={() => {
              setSelectedOption(o);
            }}
          >
            {o.icon && <div className="flex-center icon">{o.icon}</div>}
            <div>{o.label}</div>
          </button>
        ))}
        <div
          className="slider animated"
          style={{
            left: `calc(100% / ${options.length} * ${selectedIndex})`,
          }}
        />
      </div>
    </div>
  );
};
