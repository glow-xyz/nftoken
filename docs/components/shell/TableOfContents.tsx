export const TableOfContents = ({ content }) => {
  if (!content) {
    return null;
  }

  return (
    <div>
      <div className="table-of-contents">
        {content.children
          .filter(
            // We don't include h1's because there's only one h1 in the page — the title.
            (child) => child.name === "Heading" && child.attributes.level > 1
          )
          .map((child) => (
            <a
              key={child.children.join("")}
              style={{ marginLeft: 16 * (child.attributes.level - 2) }}
              className="block text-sm text-secondary mb-2"
            >
              {child.children.join("")}
            </a>
          ))}

        <style jsx>{`
          .table-of-contents {
            height: max-content;
            border-left: 2px solid var(--brand-color);
            padding-left: 1rem;
          }

          a {
            max-width: max-content;
          }
        `}</style>
      </div>
    </div>
  );
};
