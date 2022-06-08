import { useState } from "react";
import copy from "copy-to-clipboard";

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

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    copy(content);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <>
      <div>
        <pre
          dangerouslySetInnerHTML={{ __html: html }}
          // This class makes the Prism theme apply.
          className={`language-${language}`}
        />

        <button onClick={handleCopy}>
          {copied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          )}
        </button>
      </div>

      <style jsx>{`
        div {
          position: relative;
        }

        pre {
          border-radius: var(--border-radius);

          /* Overriding the Prism theme. */
          border: none;
        }

        button {
          background-color: hsla(0, 0%, 100%, 0.2);
          padding: 0.3rem;
          line-height: 0;
          border-radius: var(--border-radius);
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          opacity: 0;
          transition: var(--transition);
        }

        div:hover button {
          opacity: 1;
        }

        button svg {
          color: var(--white);
        }
      `}</style>
    </>
  );
};
