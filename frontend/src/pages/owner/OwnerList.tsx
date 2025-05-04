import { useState, useEffect } from 'react';
import {
  fetchOwners,
  exportOwnersToExcel,
  deleteOwner,
} from '../../services/ownerServices';
import { Owner } from '../../models/Owner';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../../components/inputs/CunstomSelect';
import CustomModal from '../../components/CustomModal';
import RoutesName from '../../routes/Routes';

const OwnerList = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<
    'fullName' | 'cpf' | 'rg' | 'email' | 'cep'
  >('fullName');
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<string | null>(null);

  const pageSize = 15;

  const options = [
    { value: 'fullName', label: 'Nome Completo' },
    { value: 'cpf', label: 'CPF' },
    { value: 'rg', label: 'RG' },
    { value: 'email', label: 'Email' },
    { value: 'cep', label: 'CEP' },
  ];

  const loadOwners = async (reset = false) => {
    setLoading(true);
    let filters: {
      fullName?: string;
      cpf?: string;
      rg?: string;
      email?: string;
      cep?: string;
    } = {};

    if (searchTerm.length >= 3) {
      filters = { [searchField]: searchTerm };
    } else if (searchTerm.length === 0) {
      filters = {};
    } else {
      setLoading(false);
      return;
    }

    try {
      const { data, lastVisible: newLastVisible } = await fetchOwners(
        filters,
        pageSize,
        reset ? null : lastVisible
      );

      if (reset) {
        setOwners(data);
      } else {
        setOwners((prevOwners) => {
          const newOwners = data.filter(
            (newOwner) => !prevOwners.some((owner) => owner.id === newOwner.id)
          );
          return [...prevOwners, ...newOwners];
        });
      }
      setLastVisible(newLastVisible);
    } catch (error) {
      console.error('Erro ao buscar proprietários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLastVisible(null);
    loadOwners(true);
  }, [searchTerm, searchField]);

  const handleExport = async () => {
    await exportOwnersToExcel();
  };

  const handleOpenModal = (id: string) => {
    setOwnerToDelete(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOwnerToDelete(null);
  };

  const handleDeleteOwner = async () => {
    if (ownerToDelete) {
      try {
        await deleteOwner(ownerToDelete);
        setOwners(owners.filter((owner) => owner.id !== ownerToDelete));
        handleCloseModal();
      } catch (error) {
        console.error('Erro ao excluir proprietário:', error);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-9xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Lista de Proprietários</h1>
        <div className="items-center mb-4 grid grid-cols-12 gap-2">
          <input
            type="text"
            placeholder={`Buscar por ${searchField === 'fullName' ? 'Nome Completo' : searchField}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:ring pink-focus-input col-span-4"
          />
          <div className="col-span-4">
            {' '}
            <CustomSelect
              options={options}
              value={searchField}
              onChange={(value) =>
                setSearchField(
                  value as 'fullName' | 'cpf' | 'rg' | 'email' | 'cep'
                )
              }
              placeholder="Selecione um campo"
            />
          </div>
          <div className="col-span-4 flex justify-end">
            <button
              onClick={handleExport}
              className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white p-2 rounded transition-colors duration-200 ease-in-out"
            >
              Exportar para Excel
            </button>
          </div>
        </div>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Nome</th>
              <th className="border p-2">RG</th>
              <th className="border p-2">Órgão Emissor</th>
              <th className="border p-2">CPF</th>
              <th className="border p-2">Celular</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((owner) => (
              <tr key={owner.id} className="border">
                <td className="border p-2">{owner.fullName}</td>
                <td className="border p-2">{owner.rg}</td>
                <td className="border p-2">{owner.issuingBody}</td>
                <td className="border p-2">{owner.cpf}</td>
                <td className="border p-2">{owner.celphone}</td>
                <td className="border p-2">{owner.email}</td>
                <td className="border p-2 flex gap-2">
                  <button
                    onClick={() => navigate(`${RoutesName.OWNER}/${owner.id}`)}
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleOpenModal(owner.id ?? '')}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          {lastVisible && (
            <button
              onClick={() => loadOwners()}
              disabled={loading}
              className="bg-green-500 text-white p-2 rounded"
            >
              {loading ? 'Carregando...' : 'Carregar Mais'}
            </button>
          )}
        </div>
      </div>
      <CustomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDeleteOwner}
        title="Confirmação"
      >
        <p>Tem certeza que deseja confirmar esta ação?</p>
      </CustomModal>
    </div>
  );
};

export default OwnerList;
