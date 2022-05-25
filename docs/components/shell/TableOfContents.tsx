import { MarkdocContent } from "../../types/markdoc";

export const TableOfContents = ({ content }: { content: MarkdocContent }) => {
  if (!content) {
    return null;
  }

  return (
    <div>
      <div className="table-of-contents">
        {content.children.map((child) => {
          // We don't include h1's because the title is the only h1 on the page.
          if (child.name === "Heading" && child.attributes.level > 1) {
            return (
              <a
                href={`#${child.attributes.id}`}
                key={child.children.join("")}
                style={{ marginLeft: 16 * (child.attributes.level - 2) }}
                className="block text-sm mb-2"
              >
                {child.children.join("")}
              </a>
            );
          }
        })}

        <style jsx>{`
          .table-of-contents {
            height: max-content;
            border-left: 2px solid var(--brand-color);
            padding-left: 1rem;
          }

          a {
            max-width: max-content;
            color: var(--secondary-color);
            transition: none;
          }

          a:hover,
          a.current {
            text-decoration: underline;
            text-decoration-color: var(--primary-border-color);
          }
        `}</style>
      </div>
    </div>
  );
};
