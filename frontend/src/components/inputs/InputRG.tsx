import { useFormikContext, FieldInputProps } from 'formik'; // Importe FieldInputProps
import { IMaskInput } from 'react-imask';

export const MyRGInput = ({ field }: { field: FieldInputProps<string> }) => {
  // Use FieldInputProps
  const { setFieldValue } = useFormikContext();

  const handleAccept = (value: string) => {
    setFieldValue(field.name, value);
  };

  return (
    <IMaskInput
      mask="00.000.000"
      value={field.value}
      onAccept={handleAccept}
      className="w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:ring pink-focus-input"
    />
  );
};
