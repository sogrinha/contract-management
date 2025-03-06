import { Field, ErrorMessage } from "formik";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  component?: any;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  component,
}) => (
  <div>
    <label
      className="block text-gray-700 text-sm font-bold mb-2"
      htmlFor={name}
    >
      {label}
    </label>
    <Field
      type={type}
      name={name}
      component={component}
      className="w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:ring ring-myPrimary"
    />
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 text-sm mt-1"
    />
  </div>
);
