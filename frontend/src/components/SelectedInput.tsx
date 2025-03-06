import React from "react";
import Select from "react-select";

export interface Option {
  value: string;
  label: string;
}

interface SelectInputProps {
  value: Option | null; // Agora aceita o objeto inteiro
  onChange: (option: Option | null) => void;
  options: Option[];
  placeholder?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  value,
  onChange,
  options,
  placeholder = "Selecione uma opção",
}) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      className="border rounded shadow appearance-none focus:outline-none focus:ring ring-myPrimary"
      styles={{
        control: (base, { isFocused }) => ({
          ...base,
          padding: "0.09rem 0.08rem",
          borderWidth: isFocused ? "3px" : "1px",
          borderColor: isFocused ? "#b9335b" : "#FFF",
          "&:hover": { borderColor: isFocused ? "#b9335b" : "fff" },
          outline: "none",
          boxShadow: "none",
        }),
        menu: (base) => ({ ...base, zIndex: 9999 }),
        option: (base, { isFocused }) => ({
          ...base,
          backgroundColor: isFocused ? "#b9335b" : "white",
          color: isFocused ? "white" : "black",
        }),
      }}
      menuPortalTarget={document.body}
    />
  );
};

export default SelectInput;
