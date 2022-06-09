import { useState, useRef, useEffect } from "react";
import copy from "copy-to-clipboard";
import { animate } from "motion";

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

  const copyIcon = useRef<SVGSVGElement | null>(null);
  const successIcon = useRef<SVGSVGElement | null>(null);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    copy(content);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  useEffect(() => {
    if (!copyIcon.current || !successIcon.current) {
      return;
    }

    const leave = copied ? copyIcon.current : successIcon.current;
    const enter = copied ? successIcon.current : copyIcon.current;

    animate(leave, { opacity: 0, transform: "scale(0)" }, { duration: 0.15 });
    animate(enter, { opacity: 1, transform: "scale(1)" }, { duration: 0.15 });
  }, [copied]);

  return (
    <>
      <div>
        <pre
          dangerouslySetInnerHTML={{ __html: html }}
          // This class makes the Prism theme apply.
          className={`language-${language}`}
        />

        <button onClick={handleCopy}>
          <svg
            ref={copyIcon}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
            />
          </svg>
          <svg
            ref={successIcon}
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
          background-color: var(--secondary-color);
          padding: 0.3rem;
          line-height: 0;
          border-radius: var(--border-radius);
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          opacity: 0;
          transition: var(--transition);

          /* For positioning the two icons on top of one another. */
          display: grid;
        }

        div:hover button {
          opacity: 1;
        }

        button svg {
          color: var(--white);
          grid-column: 1;
          grid-row: 1;
        }
      `}</style>
    </>
  );
};
