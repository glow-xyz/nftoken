import { Placement } from "@popperjs/core";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { usePopper } from "react-popper";

import { LuxLink } from "./LuxLink";
import { useIsMounted } from "../hooks/useIsMounted";
import { useOnMount } from "../hooks/useOnMount";
import { PlusIcon } from "@heroicons/react/solid";
import { FRAMER_BOUNCE_TRANSITION, FRAMER_TRANSITION } from "../utils/framer";

export const LuxBaseMenu = ({
  trigger,
  placement,
  open,
  setOpen,
  autoClose = true,
  mode = "click",
  children,
  showArrow = true,
  color = "default",
  shadow = "small",
}: {
  trigger: React.ReactNode;
  placement: Placement;
  open: boolean;
  setOpen: (open: boolean) => void;
  autoClose?: boolean;
  mode?: "click" | "hover";
  children: any;
  showArrow?: boolean;
  color?: "default" | "inverted";
  shadow?: "none" | "small" | "medium";
}) => {
  const referenceRef = useRef<any>(null);
  const popperRef = useRef<any>(null);
  const arrowRef = useRef<any>(null);
  const mounted = useIsMounted();

  const { styles, attributes, state, update } = usePopper(
    referenceRef.current,
    popperRef.current,
    {
      placement,
      strategy: "fixed",
      modifiers: [
        {
          name: "eventListeners",
          options: {
            resize: open,
            scroll: open,
          },
        },
        {
          name: "offset",
          enabled: true,
          options: {
            offset: [0, 8],
          },
        },
        {
          name: "arrow",
          options: {
            element: arrowRef.current,
          },
        },
      ],
    }
  );

  useEffect(() => {
    update && update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, trigger]);

  useOnMount(() => {
    if (mode === "click") {
      // We want to use the capture phase here to capture the click even if e.stopPropagation()
      // is called in a different component (like a modal that the Menu is a child of)
      // More https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
      document.addEventListener("click", handleDocumentClick, true);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("click", handleDocumentClick, true);
        document.removeEventListener("keydown", handleEscape);
      };
    }

    return undefined;
  });

  const handleDocumentClick: EventListener = (event) => {
    if (!referenceRef.current || !popperRef.current) {
      return;
    }

    if (
      !referenceRef.current.contains(event.target) &&
      (!popperRef.current.contains(event.target) || autoClose)
    ) {
      setOpen(false);
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  let hoverTimer: ReturnType<typeof setTimeout> | null = null;

  const handleMouseEnter = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }

    if (mode === "hover") {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (mode === "hover") {
      hoverTimer = setTimeout(() => {
        setOpen(false);
      }, 100);
    }
  };

  const arrowPosition = state?.modifiersData?.arrow;
  let shadowStyle = "var(--shadow-sm)";
  if (shadow === "none") {
    shadowStyle = "none";
  } else if (shadow === "medium") {
    shadowStyle = "var(--shadow)";
  }

  return (
    <React.Fragment>
      <div
        className="menu-trigger-wrapper"
        ref={referenceRef}
        onClick={() => {
          if (mode === "click") {
            setOpen(!open);
          }
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {trigger}
      </div>
      {mounted &&
        ReactDOM.createPortal(
          <div
            ref={popperRef}
            className={classNames("menu-wrapper", "theme-cranberry", color)}
            style={styles.popper}
            {...attributes.popper}
          >
            <AnimatePresence>
              {open && children && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    opacity: FRAMER_TRANSITION,
                    scale: FRAMER_BOUNCE_TRANSITION,
                  }}
                  style={scaleOrigin(
                    placement,
                    arrowPosition?.x as any,
                    arrowPosition?.y as any
                  )}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="menu">{children}</div>
                  {showArrow && (
                    <div
                      className="menu-arrow"
                      ref={arrowRef}
                      style={styles.arrow}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.body
        )}

      <style jsx>{`
        .menu-trigger-wrapper {
          display: inline-flex;
          min-width: 0;
        }

        .menu-wrapper {
          z-index: 999;
        }

        .menu {
          border-radius: var(--border-radius);
          border: 1px solid var(--menu-border-color);
          overflow: hidden;
          background-color: var(--menu-bg-color);
          box-shadow: ${shadowStyle};
        }

        .menu-arrow,
        .menu-arrow:before {
          position: absolute;
          width: 8px;
          height: 8px;
          background: inherit;
          background-color: var(--menu-bg-color);
        }

        .menu-arrow {
          visibility: hidden;
        }

        .menu-arrow:before {
          visibility: visible;
          content: "";
          transform: rotate(45deg);
        }

        .menu-wrapper {
          &[data-popper-placement^="top"] .menu-arrow {
            bottom: -4px;

            &:before {
              border-bottom: 1px solid var(--menu-border-color);
              border-right: 1px solid var(--menu-border-color);
            }
          }

          &[data-popper-placement^="bottom"] .menu-arrow {
            top: -4px;

            &:before {
              border-top: 1px solid var(--menu-border-color);
              border-left: 1px solid var(--menu-border-color);
            }
          }

          &[data-popper-placement^="left"] .menu-arrow {
            right: -4px;

            &:before {
              border-left: 1px solid var(--menu-border-color);
              border-bottom: 1px solid var(--menu-border-color);
            }
          }

          &[data-popper-placement^="right"] > .menu-arrow {
            left: -4px;

            &:before {
              border-right: 1px solid var(--menu-border-color);
              border-top: 1px solid var(--menu-border-color);
            }
          }
        }

        .menu-wrapper.inverted {
          .menu,
          .menu-arrow,
          .menu-arrow:before {
            background-color: var(--menu-inverted-bg-color);
          }

          .menu,
          .menu-arrow:before {
            border-color: var(--menu-inverted-border-color);
          }
        }
      `}</style>
    </React.Fragment>
  );
};

export type LuxMenuRowData = {
  key: string;
  name: string;
  icon?: React.ReactNode;
  rightText?: string | number;
} & (
  | {
      href: string;
      onClick?: never | undefined;
    }
  | {
      href?: never | undefined;
      onClick: (() => Promise<void>) | (() => void);
    }
);

/**
 * A popover menu.
 *
 * @param trigger The trigger element to anchor the menu to.
 * @param open Whether the menu is open.
 * @param setOpen Set the menu to open / close.
 * @param autoClose Whether clicking on the menu automatically closes it.
 * @param placement Popperjs placement of the menu.
 * @param rows Rows in the menu.
 * @param onClick Function called when a menu row is clicked.
 * @param showArrow Whether to show the arrow (tip) that points to the trigger.
 * @param defaultSelectFirst Whether to highlight (select) the first row when
 *    the menu is shown.
 * @param searchable Whether to display a search bar above the rows.
 * @param searchPlaceholder The placeholder for the search bar.
 * @param onCreate Function called when a new element should be created. If this
 *    is null, then creation is not allowed.
 * @param forbiddenCreateValue The list of values to disallow creating. This is
 *    usually existing values. If a value is one of the rows, creating the same
 *    value is disallowed automatically. So only specify additional values.
 */
export const LuxMenu = ({
  trigger,
  open,
  setOpen,
  autoClose = true,
  placement,
  rows,
  showArrow = true,
  defaultSelectFirst = true,
  searchable = false,
  searchPlaceholder,
  onCreate,
  forbiddenCreateValue,
}: {
  trigger: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  autoClose?: boolean;
  placement: Placement;
  rows: Array<LuxMenuRowData>;
  showArrow?: boolean;
  defaultSelectFirst?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onCreate?: (value: string) => Promise<void>;
  forbiddenCreateValue?: string[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Clear the search and focus the menu when it is opened
      searchInputRef.current?.focus();
      setSearchTerm("");
      setCurrentIndex(defaultSelectFirst ? 0 : -1);
    }
  }, [open, setSearchTerm, setCurrentIndex, defaultSelectFirst]);

  useEffect(() => {
    // When we have a new search term, we put the selected value at the start
    setCurrentIndex(0);
  }, [searchTerm, setCurrentIndex]);

  // Search
  const lowerSearchTerm = searchTerm.trim().toLowerCase();
  let filteredRows = rows;
  let hasExactMatch = false;
  if (lowerSearchTerm) {
    filteredRows = rows.filter((r) => {
      const lowerName = r.name.toLowerCase();
      if (lowerName === lowerSearchTerm) {
        hasExactMatch = true;
        return true;
      }

      return lowerName.match(new RegExp("\\b" + lowerSearchTerm));
    });
  }

  let canCreate = Boolean(onCreate && lowerSearchTerm && !hasExactMatch);
  if (canCreate && forbiddenCreateValue) {
    canCreate = !forbiddenCreateValue
      .map((v) => v.toLowerCase())
      .includes(lowerSearchTerm);
  }

  // Keyboard navigation
  const handleKeyNavigation = useCallback(
    // This function needs to be synchronous in order to properly prevent default and
    // stop propagation on the keyboard event.
    (event: KeyboardEvent): boolean => {
      if (!open) {
        return true;
      }

      switch (event.key) {
        case "ArrowDown":
        case "Down": {
          event.preventDefault();
          event.stopPropagation();
          setCurrentIndex(
            Math.min(
              currentIndex + 1,
              canCreate ? filteredRows.length : filteredRows.length - 1
            )
          );
          return false;
        }
        case "ArrowUp":
        case "Up": {
          event.stopPropagation();
          event.preventDefault();
          setCurrentIndex(Math.max(currentIndex - 1, 0));
          return false;
        }
        case "Enter": {
          event.preventDefault();
          event.stopPropagation();

          if (currentIndex > filteredRows.length || currentIndex < 0) {
            return false;
          }

          if (currentIndex === filteredRows.length) {
            if (canCreate) {
              onCreate?.(searchTerm);
            }
            return false;
          }

          // Find the row and trigger the action.
          const r = filteredRows[currentIndex];
          if (r.href) {
            window.location.href = r.href;
          }
          if (r.onClick) {
            r.onClick();
          }

          setOpen(false);
          return false;
        }
      }

      return true;
    },
    [
      open,
      setOpen,
      setCurrentIndex,
      canCreate,
      filteredRows,
      currentIndex,
      searchTerm,
      onCreate,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyNavigation);
    return () => {
      document.removeEventListener("keydown", handleKeyNavigation);
    };
  }, [handleKeyNavigation]);

  return (
    <LuxBaseMenu
      trigger={trigger}
      placement={placement}
      open={open}
      setOpen={setOpen}
      autoClose={autoClose}
      showArrow={showArrow}
    >
      <>
        <div className="menu-content">
          {searchable && (
            <div className="search-wrapper">
              <input
                className="with-placeholder"
                // @ts-ignore
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder || "Search"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          <div className="rows overflow-auto">
            {filteredRows.map((row, i) =>
              row.href ? (
                <LuxLink key={row.key} href={row.href}>
                  <MenuItem
                    row={row}
                    selected={i === currentIndex}
                    onHover={() => {
                      setCurrentIndex(i);
                    }}
                  />
                </LuxLink>
              ) : (
                <div
                  key={row.key}
                  onClick={async () => {
                    if (row.onClick) {
                      await row.onClick();
                    }
                  }}
                >
                  <MenuItem
                    row={row}
                    selected={i === currentIndex}
                    onHover={() => {
                      setCurrentIndex(i);
                    }}
                  />
                </div>
              )
            )}
            {filteredRows.length === 0 && searchTerm && !canCreate && (
              <div className="no-result">No Results</div>
            )}
            {canCreate && (
              <div
                className={classNames("create-row flex-center", {
                  selected: currentIndex === filteredRows.length,
                })}
                onClick={async () => {
                  await onCreate?.(searchTerm);
                }}
              >
                <div className="icon flex-center">
                  <PlusIcon />
                </div>
                <div>
                  Create "<span>{searchTerm}</span>"
                </div>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .menu-content {
            min-width: 120px;
            max-width: 240px;
          }

          .search-wrapper {
            position: relative;
            background-color: var(--menu-search-bg-color);
            border-bottom: 1px solid var(--menu-search-divider-color);

            input {
              background: transparent;
              border: 0;
              padding: 0.375rem 0.75rem;
              outline: 0;
              width: 100%;
              color: var(--input-color);
            }
          }

          .rows {
            max-height: 50vh;
          }

          .create-row,
          .no-result {
            font-size: 0.9rem;
            padding: 0.375rem 0.75rem;
          }

          .no-result {
            color: var(--menu-no-result-color);
          }

          .create-row {
            cursor: pointer;

            .icon {
              margin-right: 0.75rem;
              width: 1rem;
              height: 1rem;
              color: var(--menu-item-icon-color);

              :global(svg) {
                width: 1rem;
                height: 1rem;
              }
            }

            span {
              font-weight: var(--medium-font-weight);
            }

            &.selected {
              color: var(--menu-item-hover-color);
              background-color: var(--menu-item-hover-bg-color);

              .icon {
                color: var(--menu-item-icon-hover-color);
              }
            }
          }
        `}</style>
      </>
    </LuxBaseMenu>
  );
};

const MenuItem = ({
  row,
  selected,
  onHover,
}: {
  row: LuxMenuRowData;
  selected: boolean;
  onHover: () => void;
}) => {
  return (
    <div
      className={classNames("menu-item flex-center spread", {
        selected,
      })}
      onMouseEnter={onHover}
    >
      <div className="flex-center icon-text">
        {row.icon && <div className="menu-icon flex-center">{row.icon}</div>}
        <div className="menu-text flex-1">{row.name}</div>
      </div>

      {row.rightText && (
        <div className="menu-right-text mono-number">{row.rightText}</div>
      )}

      <style jsx>{`
        .icon-text {
          min-width: 0;
        }

        .menu-icon {
          margin-right: 0.75rem;
          width: 1rem;
          height: 1rem;
          color: var(--menu-item-icon-color);
          justify-content: center;

          :global(svg) {
            width: 1rem;
            height: 1rem;
          }
        }

        .menu-text {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .menu-right-text {
          color: var(--menu-item-secondary-color);
          margin-left: 1rem;
        }

        .menu-item {
          padding: 0.375rem 0.75rem;
          color: var(--menu-item-color);
          font-size: 0.9rem;
          cursor: pointer;
          position: relative;
          z-index: 1;

          &.selected {
            color: var(--menu-item-hover-color);
            background-color: var(--menu-item-hover-bg-color);

            .menu-icon {
              color: var(--menu-item-icon-hover-color);
            }

            .menu-right-text {
              color: var(--menu-item-hover-color);
            }
          }
        }
      `}</style>
    </div>
  );
};

const scaleOrigin = (
  placement: Placement,
  x: number | null,
  y: number | null
): { originX: number | string; originY: number | string } => {
  const xInPixels = x ? `${x}px` : null;
  const yInPixels = y ? `${y}px` : null;

  if (placement === "top") {
    return { originX: xInPixels || 0.5, originY: 1 };
  }

  if (placement === "top-start" || placement === "right-end") {
    return { originX: xInPixels || 0, originY: yInPixels || 1 };
  }

  if (placement === "top-end" || placement === "left-end") {
    return { originX: xInPixels || 1, originY: yInPixels || 1 };
  }

  if (placement === "bottom") {
    return { originX: xInPixels || 0.5, originY: 0 };
  }

  if (placement === "bottom-start" || placement === "right-start") {
    return { originX: xInPixels || 0, originY: yInPixels || 0 };
  }

  if (placement === "bottom-end" || placement === "left-start") {
    return { originX: xInPixels || 1, originY: yInPixels || 0 };
  }

  if (placement === "right") {
    return { originX: 0, originY: yInPixels || 0.5 };
  }

  if (placement === "left") {
    return { originX: 1, originY: yInPixels || 0.5 };
  }

  return { originX: xInPixels || 0, originY: yInPixels || 0 };
};
