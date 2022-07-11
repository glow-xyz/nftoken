import ChevronLeftIcon from "@luma-team/lux-icons/feather/chevron-left.svg";
import ChevronRightIcon from "@luma-team/lux-icons/feather/chevron-right.svg";
import { useRouter } from "next/router";
import { LuxButton } from "../LuxButton";
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
        <LuxButton
          label={DOC_PAGES[index - 1].title}
          icon={<ChevronLeftIcon />}
          href={DOC_PAGES[index - 1].href}
          iconPlacement="left"
          rounded
          variant="link"
          color="brand"
        />
      ) : (
        // Spacer so the other link goes on the right.
        <div />
      )}

      {DOC_PAGES[index + 1] && (
        <LuxButton
          label={DOC_PAGES[index + 1].title}
          icon={<ChevronRightIcon />}
          href={DOC_PAGES[index + 1].href}
          iconPlacement="right"
          rounded
          variant="link"
          color="brand"
        />
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
