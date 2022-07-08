import Papa from "papaparse";
import { useDropzone } from "react-dropzone";
import { ACCEPT_TEXT_PROP, DropZone } from "../LuxDropZone";
import FileIcon from "../../icons/feather/FileIcon.svg";
import { NftokenTypes } from "../../utils/NftokenTypes";
import { useFormikContext } from "formik";
import * as z from "zod";
import { toastError } from "../../utils/toast";

export function CsvDropZone({ fieldName }: { fieldName: string }) {
  const { setFieldValue, setFieldError } = useFormikContext();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (files) => {
      if (!files || files.length === 0) {
        return;
      }

      Papa.parse(files[0], {
        header: true,
        complete: function ({ data }) {
          try {
            z.object({
              name: z.string(),
              image: z.string().url(),
            })
              .array()
              .parse(data);
          } catch (err: unknown) {
            if (err instanceof z.ZodError) {
              // TODO: Construct a better error message from ZodError.
              console.error(err);
            }

            setFieldError(fieldName, "Invalid CSV data");
            toastError("Invalid CSV data");

            return;
          }

          setFieldValue(fieldName, data as NftokenTypes.Metadata[]);
        },
        error(error: Error) {
          setFieldError(fieldName, error.message);
          toastError(error.message);
        },
      });
    },
    accept: ACCEPT_TEXT_PROP,
  });

  const label = "Import CSV File";

  let sublabel = "Drop file here or click here to choose file.";
  if (isDragActive) {
    sublabel = "Drop CSV file here to import.";
  }

  return (
    <DropZone
      icon={<FileIcon />}
      label={label}
      sublabel={sublabel}
      isDragActive={isDragActive}
      rootProps={getRootProps()}
      inputProps={getInputProps()}
    />
  );
}
