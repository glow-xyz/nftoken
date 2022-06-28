import { ETHEREUM_ADDRESS_REGEX } from "../utils/ethereum";
import { isValidEmail } from "../utils/email";
import { normalizeUrl } from "../utils/social-links";

import classNames from "classnames";
import { Field, FieldProps, getIn, useFormikContext } from "formik";
import React, {
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { LumaInputProps, LumaInputWrapper } from "./_LumaInputWrapper";
import { CheckIcon, XIcon } from "@heroicons/react/outline";
import { LuxSpinner } from "./LuxSpinner";

export const LuxInput = forwardRef(
  (
    {
      label,
      placeholder,
      className,
      value,
      onChange,
      size = "medium",
      type = "text",
      disabled,
      rounded,
      autoFocus,
      variant = "outline",
      monospace = false,
      textAlign = "left",
      statusIndicator,
      error,
      helperText,
      errorText,
      accessoryText,
      accessoryTextPlacement,
      twoColumns,
      inputProps,
    }: LumaInputProps & {
      placeholder?: string;
      value: string;
      onChange: (value: string) => void;
      type?:
        | "datetime-local"
        | "email"
        | "eth_address"
        | "name"
        | "number"
        | "password"
        | "text"
        | "title"
        | "token"
        | "url";
      disabled?: boolean;
      autoFocus?: boolean;
      monospace?: boolean;
      textAlign?: "left" | "right";
      statusIndicator?: "loading" | "success" | "error";
      errorText?: string;
      accessoryText?: React.ReactNode;
      accessoryTextPlacement?: "left" | "right";
      inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    },
    ref: ForwardedRef<{ focus: () => void }>
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (autoFocus) {
        inputRef.current?.focus();
      }
    }, [autoFocus]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    let props: InputHTMLAttributes<HTMLInputElement>;
    if (type === "name") {
      props = {
        type: "text",
        autoCapitalize: "words",
        autoCorrect: "off",
        spellCheck: "false",
      };
    } else if (type === "url") {
      props = {
        type: "url",
        autoCapitalize: "off",
        autoCorrect: "off",
        spellCheck: "false",
      };
    } else if (type === "title") {
      props = {
        type: "text",
        autoCapitalize: "sentences",
      };
    } else if (type === "token" || type === "eth_address") {
      props = {
        type: "text",
        autoCorrect: "off",
        spellCheck: "false",
      };
    } else {
      props = { type };
    }

    const helperTextToDisplay = error && errorText ? errorText : helperText;

    return (
      <LumaInputWrapper
        label={label}
        className={className}
        size={size}
        rounded={rounded}
        variant={variant}
        error={error}
        helperText={helperTextToDisplay}
        accessoryText={accessoryText}
        accessoryTextPlacement={accessoryTextPlacement}
        twoColumns={twoColumns}
      >
        <div className={classNames("input-inner-wrapper flex-1", size)}>
          <input
            // @ts-ignore
            ref={inputRef}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => {
              // Relative URLs like google.com aren't valid for type=url.
              // On blur, we check if the URL is a valid one, normalize it (make
              // it absolute), and if it's different from the user input (i.e.
              // the URL is relative), we change it to absolute.
              if (type === "url" && e.target.value) {
                const normalized = normalizeUrl(e.target.value);
                if (normalized && normalized !== value) {
                  onChange(normalized);
                }
              }
            }}
            {...(inputProps || {})}
            className={classNames("luma-input", inputProps?.className, {
              monospace,
              "align-right": textAlign === "right",
              "has-indicator": statusIndicator,
            })}
            {...props}
          />

          {statusIndicator && (
            <div className={classNames("indicator", statusIndicator)}>
              {statusIndicator === "loading" && <LuxSpinner />}
              {statusIndicator === "success" && <CheckIcon />}
              {statusIndicator === "error" && <XIcon />}
            </div>
          )}
        </div>
      </LumaInputWrapper>
    );
  }
);

export const LuxInputField = forwardRef(
  (
    {
      name,
      label,
      className,
      helperText,
      type = "text",
      size = "medium",
      placeholder,
      autoFocus,
      monospace,
      textAlign,
      disabled,
      required,
      accessoryText,
      accessoryTextPlacement = "left",
      statusIndicator,
      twoColumns,
      inputProps,
      setValueTransformer,
      onChange,
      displayValueTransformer,
      rounded,
      validate,
    }: {
      name: string;
      required?: boolean;
      setValueTransformer?: (value: string) => any;
      displayValueTransformer?: (value: any) => string;
      validate?: (
        value: string | null
      ) => Promise<string | undefined> | string | undefined;
    } & Omit<
      React.ComponentPropsWithoutRef<typeof LuxInput>,
      "onChange" | "value" | "error"
    > &
      Partial<
        Pick<
          React.ComponentPropsWithoutRef<typeof LuxInput>,
          "onChange" | "value" | "error"
        >
      >,
    ref: ForwardedRef<{ focus: () => void }>
  ) => {
    const { values, setFieldValue, isSubmitting } = useFormikContext();

    return (
      <Field
        name={name}
        validate={
          validate
            ? validate
            : (value: string | null) => {
                if ((value == null || value === "") && required) {
                  return "This field is required.";
                }

                if (value == null) {
                  return undefined;
                }

                if (type === "email" && !isValidEmail(value)) {
                  return "Please enter a valid email address.";
                }

                if (
                  type === "eth_address" &&
                  !ETHEREUM_ADDRESS_REGEX.test(value)
                ) {
                  return `Please enter a valid Ethereum address.`;
                }

                // TODO: Check for url validity.
                return undefined;
              }
        }
      >
        {({ meta }: FieldProps<string>) => (
          <LuxInput
            ref={ref}
            label={label}
            className={className}
            type={type}
            size={size}
            placeholder={placeholder}
            monospace={monospace}
            textAlign={textAlign}
            twoColumns={twoColumns}
            accessoryText={accessoryText}
            accessoryTextPlacement={accessoryTextPlacement}
            statusIndicator={statusIndicator}
            disabled={disabled || isSubmitting}
            autoFocus={autoFocus}
            error={Boolean(meta.touched && meta.error)}
            helperText={(meta.touched && meta.error) || helperText}
            value={(() => {
              let value = getIn(values, name) || "";
              if (displayValueTransformer) {
                value = displayValueTransformer(value);
              }
              return value;
            })()}
            onChange={
              onChange ??
              ((value: string) => {
                if (setValueTransformer) {
                  value = setValueTransformer(value);
                }
                setFieldValue(name, value);
              })
            }
            inputProps={inputProps}
            rounded={rounded}
          />
        )}
      </Field>
    );
  }
);
