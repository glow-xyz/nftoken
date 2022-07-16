import { useFormikContext, getIn } from "formik";
import { LuxSimpleDropZone } from "../atoms/LuxSimpleDropZone";

export function SimpleDropZone<Values extends Record<string, unknown>>({
  label,
  fieldName,
  size = 200,
}: {
  label?: string;
  fieldName: keyof Values;
  size?: number;
}) {
  const { values, setFieldValue } = useFormikContext<Values>();

  const value = getIn(values, fieldName as string);

  return (
    <LuxSimpleDropZone
      label={label}
      size={size}
      image={value}
      setImage={(image) => setFieldValue(fieldName as string, image)}
    />
  );
}
