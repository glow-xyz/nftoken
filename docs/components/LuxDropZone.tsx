import classNames from "classnames";
import React from "react";
import { LuxSpinner } from "../components/LuxSpinner";
import ImageIcon from "@luma-team/lux-icons/feather/image.svg";
import { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";

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
        {isLoading ? <LuxSpinner /> : icon}
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
