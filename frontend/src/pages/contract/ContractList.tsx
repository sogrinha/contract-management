import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchContracts } from "../../services/contractService"; // Crie esse service se ainda não existir
import { Contract, EContractKind, EStatus } from "../../models/Contract";
import CustomSelect from "../../components/inputs/CunstomSelect";
import CustomModal from "../../components/CustomModal";
import RoutesName from "../../routes/Routes";

const ContractList = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<
    "ownerName" | "lesseeName" | "endDate" | "contractKind" | "status"
  >("ownerName");
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const pageSize = 25;

  const options = [
    { value: "ownerName", label: "Proprietário" },
    { value: "lesseeName", label: "Locatário" },
    { value: "endDate", label: "Data de Vencimento" },
    { value: "contractKind", label: "Tipo de Contrato" },
    { value: "status", label: "Status" },
    { value: "realEstateAddress", label: "Imóvel" },
  ];

  const enumToOptions = (enumObj: Record<string, string>) =>
    Object.values(enumObj).map((value) => ({
      value,
      label: value,
    }));

  const loadContracts = async (reset = false) => {
    if (reset) setLoading(true);
    else setIsLoadingMore(true);

    let filters: any = {};

    if (
      searchTerm.length >= 3 ||
      searchField === "contractKind" ||
      searchField === "status"
    ) {
      filters = { [searchField]: searchTerm };
    } else if (searchTerm.length === 0) {
      filters = {};
    } else {
      setLoading(false);
      setIsLoadingMore(false);
      return;
    }

    try {
      const { data, lastVisible: newLastVisible } = await fetchContracts(
        filters,
        pageSize,
        reset ? null : lastVisible
      );

      if (reset) {
        setContracts(data);
      } else {
        setContracts((prev) => {
          const newItems = data.filter(
            (item) => !prev.some((i) => i.id === item.id)
          );
          return [...prev, ...newItems];
        });
      }

      setLastVisible(newLastVisible);
    } catch (error) {
      console.error("Erro ao buscar contratos:", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setLastVisible(null);
    loadContracts(true);
  }, [searchTerm, searchField]);

  const handleOpenModal = (id: string) => {
    setContractToDelete(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setContractToDelete(null);
  };

  const handleDeleteContract = async () => {
    if (contractToDelete) {
      try {
        // await deleteContract(contractToDelete);
        setContracts((prev) => prev.filter((c) => c.id !== contractToDelete));
        handleCloseModal();
      } catch (error) {
        console.error("Erro ao excluir contrato:", error);
      }
    }
  };
  const formatDate = (date: any): string => {
    if (!date) return "—";
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  const handleFieldChange = (value: any) => {
    setSearchField(value);
    setSearchTerm("");
  };

  const isEnumField =
    searchField === "contractKind" || searchField === "status";

  const getEnumOptions = () => {
    if (searchField === "contractKind") return enumToOptions(EContractKind);
    if (searchField === "status") return enumToOptions(EStatus);
    return [];
  };

  return (
    <div className="p-4">
      <div className="max-w-9xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Lista de Contratos</h1>

        <div className="grid grid-cols-12 gap-4 mb-6">
          <div className="col-span-12 md:col-span-5">
            {isEnumField ? (
              <CustomSelect
                options={getEnumOptions()}
                value={searchTerm}
                onChange={(value) => setSearchTerm(value)}
                placeholder="Selecione uma opção"
              />
            ) : (
              <input
                type={searchField === "endDate" ? "date" : "text"}
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border rounded w-full shadow-sm focus:ring focus:border-blue-300"
              />
            )}
          </div>

          <div className="col-span-12 md:col-span-4">
            <CustomSelect
              options={options}
              value={searchField}
              onChange={handleFieldChange}
              placeholder="Selecione um campo"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-3 text-left border">Proprietário</th>
                <th className="p-3 text-left border">Locatário</th>
                <th className="p-3 text-left border">Imóvel</th>
                <th className="p-3 text-left border">Tipo</th>
                <th className="p-3 text-left border">Status</th>
                <th className="p-3 text-left border">Início</th>
                <th className="p-3 text-left border">Vencimento</th>
                <th className="p-3 text-center border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-500">
                    Nenhum contrato encontrado.
                  </td>
                </tr>
              )}
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-100 transition">
                  <td className="p-3 border">{contract.ownerName ?? "-"}</td>
                  <td className="p-3 border">{contract.lesseeName ?? "-"}</td>
                  <td className="p-3 border">{contract.realEstateAddress ?? "-"}</td>
                  <td className="p-3 border">{contract.contractKind}</td>
                  <td className="p-3 border">{contract.status}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatDate(contract.startDate)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatDate(contract.endDate)}
                  </td>
                  <td className="p-3 border text-center flex justify-center gap-2">
                    <button
                      onClick={() =>
                        navigate(`${RoutesName.CONTRACT}/${contract.id}`)
                      }
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleOpenModal(contract.id ?? "")}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <p className="text-center my-6 text-blue-500">Carregando...</p>
        )}

        {!loading && lastVisible && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => loadContracts()}
              disabled={isLoadingMore}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded disabled:bg-green-300"
            >
              {isLoadingMore ? "Carregando..." : "Carregar mais"}
            </button>
          </div>
        )}
      </div>

      <CustomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDeleteContract}
        title="Confirmar Exclusão"
      >
        <p>Tem certeza que deseja excluir este contrato?</p>
      </CustomModal>
    </div>
  );
};

export default ContractList;
