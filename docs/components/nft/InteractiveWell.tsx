import classNames from "classnames";
import { useGlowContext, GlowSignInButton } from "@glow-xyz/glow-react";
import { NetworkSwitcher } from "../atoms/NetworkSwitcher";

export const InteractiveWell = ({
  title,
  minimal = false,
  className = "",
  children,
}: {
  title: string;
  // If true, this hides the network switcher.
  // Useful for cleaner success states.
  minimal?: boolean;
  className?: string;
  children: React.ReactNode;
}) => {
  const { user, glowDetected } = useGlowContext();

  const blurred = !glowDetected || !user;

  return (
    <section className={classNames("px-3 pb-3 rounded", className)}>
      <div className="title text-xs font-weight-bold">{title}</div>

      {!minimal && (
        <div className={classNames("network-switcher", { blurred })}>
          <NetworkSwitcher />
        </div>
      )}

      <div className={classNames("children", { blurred })}>{children}</div>

      {!glowDetected && (
        <div className="overlay text-center">
          <p>
            You’ll need to install{" "}
            <a href="https://glow.app/download" target="_blank">
              Glow
            </a>{" "}
            in order to mint an NFT.
          </p>
        </div>
      )}

      {glowDetected && !user && (
        <div className="overlay">
          <GlowSignInButton variant="purple" />
        </div>
      )}

      <style jsx>{`
        section {
          border: 1px solid var(--divider-color);
          background-color: var(--secondary-bg-color);
          position: relative;
          padding-top: 2.25rem;
          overflow: hidden;
          width: 100%;
        }

        .title {
          position: absolute;
          top: 0;
          left: 0;
          background-color: var(--gray-90);
          color: var(--white);
          line-height: 1;
          padding: 0.3rem 0.6rem 0.35rem 0.6rem;
          border-bottom-right-radius: calc(var(--border-radius) / 2);
        }

        .network-switcher {
          position: absolute;
          top: 0;
          right: 0;

          background-color: var(--gray-90);
          padding: 0.2rem 0.6rem 0.3rem 0.6rem;
          border-bottom-left-radius: calc(var(--border-radius) / 2);
          line-height: 1;
        }

        .network-switcher :global(.luma-button .label),
        .network-switcher :global(.luma-button svg) {
          color: var(--white);
        }

        .overlay {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .overlay p {
          background-color: var(--primary-bg-color);
          padding: 0.3rem 1rem;
          border-radius: var(--border-radius);
          color: var(--primary-color);
        }

        .network-switcher,
        .children {
          /* For transitioning blur smoothly. */
          transition: var(--transition);
        }

        .blurred {
          filter: blur(6px) brightness(120%) grayscale(20%);
        }
      `}</style>
    </section>
  );
};
