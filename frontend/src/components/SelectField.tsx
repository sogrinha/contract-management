import { Field, ErrorMessage } from 'formik';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';

interface SelectProps {
  label: string;
  name: string;
  type?: string;
  component?: any;
  options?: string[];
}

const SelectField: React.FC<SelectProps> = ({
  label,
  name,
  type = 'text',
  component,
  options,
}) => {
  return (
    <div className="relative">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor={name}
      >
        {label}
      </label>
      {options ? (
        <div className="relative">
          <Field
            as="select"
            name={name}
            className="w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:ring pink-focus-input pr-10 bg-white"
          >
            <option value="">Selecione...</option>
            {options.map((option) => (
              <option key={option} value={option} className="myCustomSelect">
                {option}
              </option>
            ))}
          </Field>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <FiChevronDown className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      ) : (
        <Field
          type={type}
          name={name}
          component={component}
          className="w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:ring pink-focus-input"
        />
      )}
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-sm mt-1"
      />
    </div>
  );
};

export default SelectField;
