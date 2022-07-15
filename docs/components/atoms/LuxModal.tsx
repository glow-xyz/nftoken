import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { useIsMounted } from "../../hooks/useIsMounted";
import CloseIcon from "@luma-team/lux-icons/feather/x.svg";
import {
  FRAMER_BOUNCE_TRANSITION,
  FRAMER_EASE,
  FRAMER_TRANSITION,
} from "../../utils/framer";

type ModalVariant = "regular" | "compact" | "lux-alert" | "sticky-footer";
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
    <div className="lux-modal-header flex-center spread bg-primary">
      <div className="title">{title}</div>
      <button
        className="btn close flex-center-center animated"
        onClick={onHide}
      >
        <CloseIcon />
      </button>
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
      className={classNames("lux-modal", className, variant)}
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
        <div className="lux-modal-body overflow-auto">{children}</div>
      ) : (
        render?.({
          Body: ({ children }) => (
            <div className="lux-modal-body overflow-auto">{children}</div>
          ),
          Footer: ({ children, className }) => (
            <div className={classNames("lux-modal-footer", className)}>
              {children}
            </div>
          ),
        })
      )}
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
      className={classNames("lux-modal-overlay", { pop })}
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
    </motion.div>
  );
};
