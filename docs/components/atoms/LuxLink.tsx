import { startsWithHttp } from "../../utils/social-links";
import classNames from "classnames";
import isEmpty from "lodash/isEmpty";
import qs from "query-string";
import React, { DOMAttributes } from "react";
import Link from "next/link";
import { ExternalLink } from "./ExternalLink";

export const LuxLink = React.forwardRef(
  (
    {
      className: _className,
      onClick,
      href,
      children,
      query,
      forceOpenInNewTab,
      forcePageChange,
      disabled,
      ...props
    }: {
      className?: string;
      onClick?: DOMAttributes<HTMLAnchorElement>["onClick"];
      href: string;
      children: React.ReactNode;
      query?: { [key: string]: string | boolean };
      forceOpenInNewTab?: boolean;
      forcePageChange?: boolean;
      disabled?: boolean;
    } & React.DetailedHTMLProps<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >,
    ref: React.ForwardedRef<HTMLAnchorElement>
  ) => {
    const HOST = "https://nftoken.so";

    if (href.startsWith(HOST)) {
      href = href.slice(HOST.length);
    }

    if (query && !isEmpty(query)) {
      href += "?" + qs.stringify(query);
    }

    const className = classNames(_className, { disabled });

    if (startsWithHttp(href)) {
      return (
        <ExternalLink
          {...props}
          ref={ref}
          href={href}
          className={className}
          onClick={onClick}
        >
          {children}
        </ExternalLink>
      );
    }

    if (forceOpenInNewTab || forcePageChange) {
      return (
        <a
          {...props}
          ref={ref}
          href={href}
          target={forceOpenInNewTab ? "_blank" : "_self"}
          className={className}
          onClick={onClick}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href}>
        <a {...props} ref={ref} className={className} onClick={onClick}>
          {children}
        </a>
      </Link>
    );
  }
);
