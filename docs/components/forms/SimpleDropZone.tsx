import { useFormikContext } from "formik";
import { LuxSimpleDropZone } from "../LuxSimpleDropZone";

export function SimpleDropZone<Values extends Record<string, unknown>>({
  label,
  fieldName,
  size = 200,
}: {
  label: string;
  fieldName: keyof Values;
  size?: number;
}) {
  const { setFieldValue } = useFormikContext<Values>();

  return (
    <LuxSimpleDropZone
      label={label}
      size={size}
      onImageChange={({ image }) => setFieldValue(fieldName as string, image)}
    />
  );
}
