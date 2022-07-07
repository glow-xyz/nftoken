import { useState } from "react";
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
  label: string;
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
    <>
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

      {/* TODO: temporary backfill for lux-sass. To be removed later. */}
      <style jsx>{`
        .simple-drop-zone-container {
          position: relative;
          width: max-content;
        }

        .drop-zone {
          height: var(--size);
          width: var(--size);
          /* TODO: had to modify this to tertiary but this'll get overwritten when we use lux-sass. */
          background-color: var(--tertiary-bg-color);
          cursor: pointer;
          transition: var(--transition);
          background-size: cover;
        }

        .drop-zone.square {
          border-radius: var(--border-radius);
        }

        .drop-zone.circle {
          border-radius: 999px;
        }

        .drop-zone.active {
          background-color: var(--success-color);
        }

        .icon {
          position: absolute;
          bottom: calc(15% - 1rem);
          right: calc(15% - 1rem);
          height: 2rem;
          width: 2rem;
          border-radius: 100px;
          background-color: var(--primary-color);
          border: 2px solid var(--primary-bg-color);
          display: flex;
          place-items: center;
          transition: var(--transition);
        }

        .icon :global(svg) {
          color: white;
          margin: 0 auto;
          stroke-width: 3;
        }

        .drop-zone:hover .icon,
        .drop-zone.active .icon {
          transform: scale(1.2);
        }

        .drop-zone.active.has-image .icon {
          background-color: var(--success-color);
        }

        /* While we’re uploading an image, making this bigger on hover feels weird. */
        .icon.spinner {
          transform: scale(1) !important;
        }

        .remove-button {
          position: absolute;
          top: -0.5rem;
          right: -0.5rem;
        }

        .remove-button :global(.luma-button) {
          --padding: 0.1rem;
          --height: 1.2rem;
        }

        .remove-button :global(svg) {
          stroke-width: 3;
        }
      `}</style>
    </>
  );
};
