import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { useIsMounted } from "../hooks/useIsMounted";
import { XIcon } from "@heroicons/react/solid";
import {
  FRAMER_BOUNCE_TRANSITION,
  FRAMER_EASE,
  FRAMER_TRANSITION,
} from "../utils/framer";
import { ResponsiveBreakpoint } from "../utils/style-constants";

type ModalVariant = "regular" | "compact" | "lu-alert" | "sticky-footer";
type RenderProps =
  | {
      children: null | React.ReactNode;
      render?: never;
    }
  | {
      children?: never;
      render: null | ModalRender;
    };
type ModalRender = (vals: {
  Body: React.FC<{
    children?: React.ReactNode;
  }>;
  Footer: React.FC<{ children?: React.ReactNode; className?: string }>;
}) => React.ReactNode;

/**
 * we only want to render the modal when it is shown
 * if we render the modal when it is hidden, we run into two problems
 *
 * 1. re-opening the modal may not trigger a re-render so the modal will have old info
 * 2. when hidden, we may not have valid data to render the modal
 *
 * Most of the time you will just pass in children like:
 *
 * ```
 * <LuxModalContainer>
 *   {show && (...)}
 * </LuxModalContainer>
 * ```
 *
 * But if you want to use a modal with a footer, you will need to do something more complicated:
 *
 * ```
 * <LuxModalContainer
 *   render={show && ({Body, Footer}) => (
 *     <>
 *       <Body>
 *         ...
 *       </Body>
 *       <Footer>
 *         ...
 *       </Footer>
 *     </>
 *   )}
 * />
 * ```
 *
 * This is pretty awkward. But it allows us to have a footer that is sticky to the bottom
 * while the Body scrolls in place.
 */
export const LuxModalContainer = ({
  title,
  variant = "regular",
  onHide,
  canClickOutToDismiss = true,
  ...props
}: {
  title?: React.ReactNode;
  variant?: ModalVariant;
  onHide: () => void;
  canClickOutToDismiss?: boolean;
} & RenderProps) => {
  const shouldShow = Boolean(props.children || props.render);

  useEffect(() => {
    if (shouldShow) {
      document.body.classList.add("scroll-locked");
    } else {
      document.body.classList.remove("scroll-locked");
    }

    return () => {
      document.body.classList.remove("scroll-locked");
    };
  }, [shouldShow]);

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onHide();
    }
  };
  const mounted = useIsMounted();

  return (
    <>
      {mounted &&
        ReactDOM.createPortal(
          <AnimatePresence>
            {shouldShow && (
              <ModalOverlay
                onHide={onHide}
                canClickOutToDismiss={canClickOutToDismiss}
              >
                <LuxModal
                  title={title}
                  onHide={onHide}
                  variant={variant}
                  {...props}
                />
              </ModalOverlay>
            )}
          </AnimatePresence>,
          document.body
        )}

      <style jsx>{`
        :global(#__next) {
          // Create a stacking context on next so that the modal is in front of everything
          position: relative;
          z-index: 1;
        }
      `}</style>
    </>
  );
};

const LuxModalHeader = ({
  title,
  onHide,
}: {
  title: React.ReactNode;
  onHide: () => void;
}) => {
  return (
    <div className="lu-modal-header flex-center spread bg-primary">
      <div className="title">{title}</div>
      <button
        className="btn close flex-center-center animated"
        onClick={onHide}
      >
        <XIcon />
      </button>

      <style jsx>{`
        .lu-modal-header {
          padding: var(--modal-header-footer-padding);
          border-bottom: 1px solid var(--divider-color);

          .title {
            color: var(--primary-color);
            font-size: 1.1rem;
            font-weight: var(--bold-font-weight);
          }

          .close {
            padding: 0;
            border: 0;
            border-radius: 100px;
            background-color: var(--secondary-color);
            color: var(--modal-bg-color);
            width: 1.25rem;
            height: 1.25rem;

            opacity: 0.75;

            &:hover {
              opacity: 1;
            }
          }

          @media (max-width: ${ResponsiveBreakpoint.tiny}) {
            background-color: var(--modal-header-bg-color);
          }
        }
      `}</style>
    </div>
  );
};

const LuxModal = ({
  title,
  children,
  render,
  className,
  variant = "regular",
  onHide,
}: {
  title?: React.ReactNode;
  className?: string;
  variant?: ModalVariant;
  onHide: () => void;
} & RenderProps) => {
  return (
    <motion.div
      className={classNames("lu-modal", className, variant)}
      onClick={(e) => {
        e.stopPropagation();
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        opacity: FRAMER_TRANSITION,
        scale: FRAMER_BOUNCE_TRANSITION,
      }}
    >
      {title && <LuxModalHeader title={title} onHide={onHide} />}

      {children ? (
        <div className="lu-modal-body overflow-auto">{children}</div>
      ) : (
        render?.({
          Body: ({ children }) => (
            <div className="lu-modal-body overflow-auto">{children}</div>
          ),
          Footer: ({ children, className }) => (
            <div className={classNames("lu-modal-footer", className)}>
              {children}
            </div>
          ),
        })
      )}

      <style jsx global>{`
        .lu-modal {
          overflow: hidden;
          display: flex;
          flex-direction: column;

          width: 480px;
          max-height: 70vh;

          border-radius: var(--modal-border-radius);
          box-shadow: var(--shadow-lg);
          background-color: var(--modal-bg-color);
          border: var(--modal-border);

          &.sticky-footer {
            .lu-modal-body {
              background-color: var(--secondary-bg-color);
            }
          }

          &.lu-alert {
            width: 360px;
          }

          @media (max-width: ${ResponsiveBreakpoint.small}) {
            &:not(.lu-alert) {
              width: calc(100% - 40px);
              max-width: 480px;
            }
          }

          @media (max-width: ${ResponsiveBreakpoint.tiny}) {
            &:not(.compact):not(.lu-alert) {
              width: 100%;
              height: 100%;
              border-radius: 0;
              max-width: 100%;
              max-height: 100%;
            }

            &.lu-alert {
              width: calc(100% - 40px);
              max-width: 360px;
            }
          }

          .lu-modal-body {
            width: 100%;
            padding: var(--modal-padding);
          }

          .lu-modal-footer {
            border-top: 1px solid var(--divider-color);
            background-color: var(--primary-bg-color);
            width: 100%;
            padding: var(--modal-header-footer-padding);
          }
        }
      `}</style>
    </motion.div>
  );
};

const ModalOverlay = ({
  children,
  onHide,
  canClickOutToDismiss,
}: {
  children: React.ReactNode;
  onHide: () => void;
  canClickOutToDismiss: boolean;
}) => {
  const [pop, setPop] = useState(false);
  const onPop = () => {
    setPop(true);
    setTimeout(() => setPop(false), 300);
  };

  return (
    <motion.div
      className={classNames("lu-modal-overlay", { pop })}
      onClick={canClickOutToDismiss ? onHide : onPop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.3,
        opacity: { ease: FRAMER_EASE },
      }}
    >
      {children}
      <style jsx global>{`
        .lu-modal-overlay {
          position: fixed;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 15vh;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          z-index: 900;

          background: var(--overlay-color);

          @keyframes pop {
            50% {
              transform-origin: center;
              transform: scale(1.005);
            }
          }

          &.pop .lu-modal {
            animation: pop 0.3s cubic-bezier(0.4, 0, 0.2, 1) 1;
          }

          @media (max-width: ${ResponsiveBreakpoint.tiny}) {
            padding-top: 0;
            align-items: center;
          }
        }
      `}</style>
    </motion.div>
  );
};
