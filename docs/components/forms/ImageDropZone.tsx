import { useFormikContext, getIn } from "formik";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import classNames from "classnames";
import { ACCEPT_IMAGE_PROP, DropZone } from "../LuxDropZone";
import { uploadImageToS3 } from "../../utils/upload-file";
import { getImageUrl } from "../../utils/cdn";

export function ImageDropZone<Values extends Record<string, unknown>>({
  label,
  fieldName,
}: {
  label: string;
  fieldName: keyof Values;
}) {
  const { values, setFieldValue } = useFormikContext<Values>();

  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT_IMAGE_PROP,
    multiple: false,
    onDrop: async (files) => {
      const [file] = files;

      setUploading(true);

      try {
        const { file_url } = await uploadImageToS3({ file });
        setFieldValue(fieldName as string, file_url);
      } finally {
        setUploading(false);
      }
    },
    noKeyboard: true,
  });

  // Using `get` here because `fieldName` can be a `.`-delimited nested path, e.g. `nfts.0.image`.
  const value = getIn(values, fieldName as string) as string;

  return (
    <div className={classNames("container", { "with-image": value })}>
      <DropZone
        label={label}
        isDragActive={isDragActive}
        isLoading={uploading}
        rootProps={getRootProps()}
        inputProps={getInputProps()}
      />

      {value && (
        <img src={getImageUrl({ url: value, width: 1000, height: 1000 })} />
      )}

      <style jsx>{`
        .container.with-image {
          display: grid;
          grid-template-columns: 1fr 8rem;
          grid-column-gap: 1rem;
        }

        /* Make sure height doesn't jump when image is added on the right. */
        .container :global(.dropzone-wrapper) {
          height: 8rem;
        }

        img {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
