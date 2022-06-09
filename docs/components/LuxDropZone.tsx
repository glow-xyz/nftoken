import classNames from "classnames";
import React from "react";
import { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";

// Inline the icon instead of importing it,
// since we don't have the full Luma codebase.
// Icon is from Heroicons.com
const ImageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

export const DropZone = ({
  icon = <ImageIcon />,
  label,
  sublabel,
  isDragActive,
  isActive,
  isLoading,
  rootProps,
  inputProps,
}: {
  icon?: React.ReactNode;
  label: string;
  sublabel?: string;
  isDragActive: boolean;
  isActive?: boolean;
  isLoading?: boolean;
  rootProps: DropzoneRootProps | null;
  inputProps: DropzoneInputProps | null;
}) => {
  return (
    <div
      className={classNames("dropzone-wrapper animated", {
        dragging: isDragActive,
        loading: isLoading,
        active: isActive,
      })}
      {...(rootProps || {})}
    >
      <div>
        {inputProps && <input {...inputProps} />}
        {icon}
        <div className="label text-lg b animated">{label}</div>

        {sublabel && (
          <div className="sublabel text-sm text-secondary animated mt-1">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};

export const ACCEPT_IMAGE_PROP = {
  "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
};

export const ACCEPT_VIDEO_PROP = {
  "video/*": [
    ".avf",
    ".avi",
    ".divx",
    ".flv",
    ".gifv",
    ".mkv",
    ".mov",
    ".mp4",
    ".ogb",
    ".vob",
    ".webm",
    ".wmv",
  ],
};

export const ACCEPT_TEXT_PROP = {
  "text/*": [".csv", ".txt", ".md"],
};
