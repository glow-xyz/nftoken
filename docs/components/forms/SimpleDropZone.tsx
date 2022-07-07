import { useFormikContext } from "formik";
import { LuxSimpleDropZone } from "../LuxSimpleDropZone";

export function SimpleDropZone<Values extends Record<string, unknown>>({
  label,
  fieldName,
}: {
  label: string;
  fieldName: keyof Values;
}) {
  const { setFieldValue } = useFormikContext<Values>();

  return (
    <LuxSimpleDropZone
      label={label}
      size={200}
      onImageChange={({ image }) => setFieldValue(fieldName as string, image)}
    />
  );
}
