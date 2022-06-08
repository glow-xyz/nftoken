import prism from "prismjs";

import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

import "prism-themes/themes/prism-xonokai.css";

export const CodeBlock = ({
  content,
  language,
}: {
  content: string;
  language: string;
}) => {
  const html = prism.languages[language]
    ? prism.highlight(content, prism.languages[language], language)
    : content;

  return (
    <>
      <pre
        dangerouslySetInnerHTML={{ __html: html }}
        // This class makes the Prism theme apply.
        className={`language-${language}`}
      />
      <style jsx>{`
        pre {
          border-radius: var(--border-radius);
        }
      `}</style>
    </>
  );
};
