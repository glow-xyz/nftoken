import { ChevronRightIcon } from "@heroicons/react/outline";
import Link from "next/link";

export default function Index() {
  return (
    <div className="wrapper">
      <div className="container">
        <div className="inner">
          <h1>Solana NFT Standard</h1>
          <Link href="/overview">
            <a className="luma-button flex-center icon-right round outline large light">
              <span>Read the docs</span>
              <ChevronRightIcon />
            </a>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .wrapper {
          /* https://www.joshwcomeau.com/gradient-generator?colors=ffb071|1c8cf3|1c8cf3|1c8cf3&angle=155&colorMode=lrgb&precision=5&easingCurve=0.40086206896551724|0.7113752693965517|0.8663793103448276|0.6467200969827587 */
          background-image: linear-gradient(
            155deg,
            hsl(27deg 100% 72%) 0%,
            hsl(344deg 27% 72%) 20%,
            hsl(226deg 54% 68%) 42%,
            hsl(209deg 90% 53%) 61%,
            hsl(209deg 90% 53%) 75%,
            hsl(209deg 90% 53%) 85%,
            hsl(209deg 90% 53%) 92%,
            hsl(209deg 90% 53%) 97%,
            hsl(209deg 90% 53%) 100%
          );
        }

        .wrapper::after {
          content: "";
          display: block;
          height: 100%;
          width: 100%;
          background-image: url("/noise.svg");
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .container {
          height: 100vh;
          display: grid;
          align-items: end;
          padding: 4rem;
        }

        .inner {
          display: flex;
          align-items: end;
        }

        h1 {
          color: var(--white);
          font-size: 5rem;
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0;
          margin-right: 3rem;
        }

        a {
          color: var(--white) !important;
          border-width: 0.15rem !important;
          border-color: var(--white) !important;
          margin-bottom: 0.65rem;
        }

        a:hover {
          background-color: var(--white) !important;
          color: hsl(209deg 90% 53%) !important;
        }
      `}</style>
    </div>
  );
}
