export const TableOfContents = ({ content }) => {
  if (!content) {
    return null;
  }

  return (
    <div>
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
        div {
          height: max-content;
          border-left: 2px solid var(--brand-color);
          padding-left: 1rem;
          margin-left: 2rem;
        }

        a {
          max-width: max-content;
        }
      `}</style>
    </div>
  );
};
