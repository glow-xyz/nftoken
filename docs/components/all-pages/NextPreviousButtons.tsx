import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { DOC_PAGES } from "./navigation-constants";

export const NextPreviousButtons = () => {
  const router = useRouter();

  const current = DOC_PAGES.find((item) => item.href === router.pathname);

  if (!current) {
    return null;
  }

  const index = DOC_PAGES.indexOf(current);

  return (
    <div className="spread">
      {DOC_PAGES[index - 1] ? (
        <Link href={DOC_PAGES[index - 1].href}>
          <a className="luma-button round icon-left flex-center p-0">
            <ChevronLeftIcon />
            {DOC_PAGES[index - 1].title}
          </a>
        </Link>
      ) : (
        // Spacer so the other link goes on the right.
        <div />
      )}

      {DOC_PAGES[index + 1] && (
        <Link href={DOC_PAGES[index + 1].href}>
          <a className="luma-button round icon-right flex-center p-0">
            {DOC_PAGES[index + 1].title}
            <ChevronRightIcon />
          </a>
        </Link>
      )}

      <style jsx>{`
        div {
          margin-top: 3rem;
        }

        div :global(svg) {
          display: inline-block;
          margin-bottom: -0.05rem;
        }
      `}</style>
    </div>
  );
};
