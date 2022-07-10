import Papa from "papaparse";
import { useDropzone } from "react-dropzone";
import FileIcon from "../../icons/feather/FileIcon.svg";
import { toastError } from "../../utils/toast";
import { ACCEPT_TEXT_PROP, DropZone } from "../LuxDropZone";

export function CsvDropZone({ onDrop }: { onDrop: (rows: any[]) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (files) => {
      if (!files || files.length === 0) {
        return;
      }

      Papa.parse(files[0], {
        header: true,
        complete: function ({ data }) {
          onDrop(data);
        },
        error(error: Error) {
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
