import { useState, useRef, useEffect } from "react";
import copy from "copy-to-clipboard";
import { animate } from "motion";
import ClipboardIcon from "@luma-team/lux-icons/feather/clipboard.svg";
import CheckIcon from "@luma-team/lux-icons/feather/check.svg";

import prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

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

  const copyIcon = useRef<HTMLDivElement | null>(null);
  const successIcon = useRef<HTMLDivElement | null>(null);

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
      <div className={"code-container rounded"}>
        <pre
          dangerouslySetInnerHTML={{ __html: html }}
          // This class makes the Prism theme apply.
          className={`language-${language}`}
        />

        <button className="copy-button" onClick={handleCopy}>
          <div ref={copyIcon}>
            <ClipboardIcon />
          </div>
          <div ref={successIcon}>
            <CheckIcon />
          </div>
        </button>
      </div>

      <style jsx>{`
        .code-container {
          position: relative;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .code-container pre {
          border-radius: var(--border-radius);

          /* Overriding the Prism theme. */
          margin: 0;
          border: none;
        }

        .copy-button {
          background-color: var(--tertiary-bg-color);
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

        button > :global(div) {
          color: var(--primary-color);
          grid-column: 1;
          grid-row: 1;
        }
      `}</style>
    </>
  );
};
