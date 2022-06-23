import { startsWithHttp } from "../utils/social-links";
import React from "react";

export const ExternalLink = React.forwardRef(
  (
    {
      href,
      className,
      children,
      onClick,
      ...props
    }: React.PropsWithChildren<
      {
        href: string;
      } & React.DetailedHTMLProps<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      >
    >,
    ref: React.ForwardedRef<HTMLAnchorElement>
  ) => {
    if (
      typeof href === "string" &&
      !startsWithHttp(href) &&
      !href.startsWith("chrome-extension://") &&
      !href.startsWith("moz-extension://") &&
      !href.startsWith("safari-web-extension://") &&
      !href.startsWith("mailto:")
    ) {
      href = "http://" + href;
    }

    return (
      <a
        {...props}
        ref={ref}
        href={href}
        className={className}
        target="_blank"
        rel="nofollow noopener"
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
);
