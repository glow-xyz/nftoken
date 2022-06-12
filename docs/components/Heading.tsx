// This custom heading node is registered in markdoc/nodes.js.
// It provides anchor links to headings, so we can link to them in the
// table of contents on the side.

import React from "react";

export const Heading = ({
  level,
  id,
  children,
}: {
  level: number;
  id: string;
  children: React.ReactNode;
}) => {
  const Element = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <>
      <Element>
        <div className="anchor" id={id} />
        <a href={`#${id}`}>{children}</a>
      </Element>

      <style jsx>{`
        a {
          color: inherit;
          text-decoration: none;
        }

        .anchor {
          scroll-margin-top: 5rem;
        }
      `}</style>
    </>
  );
};
