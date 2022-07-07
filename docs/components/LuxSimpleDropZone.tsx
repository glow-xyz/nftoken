import React, { useState } from "react";
import { getImageUrl } from "../utils/cdn";
import { useDropzone } from "react-dropzone";
import { uploadImageToS3 } from "../utils/upload-file";
import { ACCEPT_IMAGE_PROP } from "./LuxDropZone";
import { LuxInputLabel } from "./LuxInputLabel";
import { XIcon, ArrowUpIcon } from "@heroicons/react/solid";
import { LuxSpinner } from "./LuxSpinner";
import classNames from "classnames";
import { LuxButton } from "./LuxButton";

export const LuxSimpleDropZone = ({
  label,
  size,
  shape = "square",
  image,
  setImage,
}: {
  label?: string;
  size: number;
  shape?: "square" | "circle";
  image: string | null;
  setImage: (image: string | null) => void;
}) => {
  const [uploading, setUploading] = useState<boolean>(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT_IMAGE_PROP,
    multiple: false,
    onDrop: async (files) => {
      setUploading(true);
      const [file] = files;
      const { file_url } = await uploadImageToS3({ file });
      setImage(file_url);
      setUploading(false);
    },
    noKeyboard: true,
  });

  const onRemoveImage = () => {
    setImage(null);
  };

  return (
    <div>
      <LuxInputLabel text={label} />
      <div
        className="simple-drop-zone-container"
        style={{ "--size": size + "px" } as React.CSSProperties}
      >
        <div
          {...getRootProps()}
          className={classNames("drop-zone", {
            active: isDragActive,
            "has-image": image !== null,
            square: shape === "square",
            circle: shape === "circle",
          })}
          style={{
            backgroundImage: image
              ? `url(${getImageUrl({
                  url: image,
                  width: size * 2,
                  height: size * 2,
                })})`
              : "none",
          }}
        >
          <input {...getInputProps()} />

          <div className={classNames("icon", { spinner: uploading })}>
            {uploading ? <LuxSpinner /> : <ArrowUpIcon />}
          </div>
        </div>

        {image && (
          <div className="remove-button">
            <LuxButton
              label="Remove Image"
              icon={<XIcon />}
              iconPlacement="icon-only"
              rounded
              size="small"
              onClick={onRemoveImage}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .drop-zone {
          /* Since this component is used in InteractiveWell which already has a gray background. */
          background-color: var(--tertiary-bg-color);
        }
      `}</style>
    </div>
  );
};
