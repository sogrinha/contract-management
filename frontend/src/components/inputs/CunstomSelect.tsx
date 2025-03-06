import { useState } from 'react';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';

type Option = {
  value: string;
  label: string;
};

type SelectProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        className="border rounded shadow appearance-none focus:outline-none focus:ring pink-focus-input w-full text-left p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value
          ? options.find((opt) => opt.value === value)?.label
          : placeholder || 'Selecione'}
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <FiChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </button>
      {isOpen && (
        <ul className="absolute w-full bg-white border rounded shadow mt-1 z-10">
          {options.map((option) => (
            <li
              key={option.value}
              className="p-2 cursor-pointer hover:bg-myPrimary hover:text-white"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
