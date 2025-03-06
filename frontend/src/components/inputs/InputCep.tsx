import { useFormikContext, FieldInputProps } from 'formik';
import { IMaskInput } from 'react-imask';
import { FaSearch } from '@react-icons/all-files/fa/FaSearch';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface MyCEPInputProps {
  field: FieldInputProps<string>;
  streetField: string;
  neighborhoodField: string;
  cityField: string;
  stateField: string;
}

export const MyCEPInput = ({
  field,
  streetField = 'street',
  neighborhoodField = 'neighborhood',
  cityField = 'city',
  stateField = 'state',
}: MyCEPInputProps) => {
  const { setFieldValue } = useFormikContext();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const pinkBorderColor = 'border-pink-300';
  const pinkFocusColor = 'ring-pink-600';

  // Função para buscar o endereço pelo CEP
  const fetchAddressByCEP = async (cep: string) => {
    try {
      const formattedCEP = cep.replace(/\D/g, ''); // Remove caracteres não numéricos
      if (formattedCEP.length !== 8) {
        toast.error('CEP inválido.');
        return;
      }

      const response = await fetch(
        `https://viacep.com.br/ws/${formattedCEP}/json/`
      );
      const data = await response.json();

      if (!data.erro) {
        setFieldValue(streetField, data.logradouro || '');
        setFieldValue(neighborhoodField, data.bairro || '');
        setFieldValue(cityField, data.localidade || '');
        setFieldValue(stateField, data.uf || '');
      } else {
        toast.error('CEP não encontrado.');
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP.');
    }
  };

  const handleAccept = (value: string) => {
    setFieldValue(field.name, value);
  };

  const handleSearchClick = () => {
    fetchAddressByCEP(field.value);
  };

  return (
    <div className="flex rounded-md shadow-sm">
      <IMaskInput
        mask="00.000-000"
        value={field.value}
        onAccept={handleAccept}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        className={`w-full px-3 py-2 border ${pinkBorderColor} rounded-l-md focus:outline-none focus:ring ${pinkFocusColor}`}
      />
      <button
        title="Clique para preencher o endereço de acordo com o cep"
        type="button"
        className={`-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border text-sm font-medium rounded-r-md text-pink-700 bg-myPrimary hover:bg-pink-600 focus:outline-none ${
          isInputFocused
            ? `ring ${pinkFocusColor} border ${pinkBorderColor}`
            : `border-transparent`
        }`}
        onClick={handleSearchClick}
      >
        <FaSearch className="text-white" />
      </button>
    </div>
  );
};
