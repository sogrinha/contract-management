import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchContracts, exportContractsToExcel } from "../../services/contractService"; // Crie esse service se ainda não existir
import { Contract, EContractKind, EStatus } from "../../models/Contract";
import CustomSelect from "../../components/inputs/CunstomSelect";
import CustomModal from "../../components/CustomModal";
import RoutesName from "../../routes/Routes";
import { Download, FileText, FilePlus } from "lucide-react";
import { documentService } from "../../services/documentService";
import { toast } from "react-toastify";
import { getDoc } from "firebase/firestore";

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

  const handleExport = async () => {
    await exportContractsToExcel();
  };

  const handleGenerateDocument = async (contract: Contract, format: 'docx' | 'pdf') => {
    try {
      // Buscar dados relacionados ao contrato
      const ownerDoc = await getDoc(contract.owner);
      const owner = ownerDoc.exists() ? ownerDoc.data() : undefined;

      let lessee = undefined;
      if (contract.lessee) {
        const lesseeDoc = await getDoc(contract.lessee);
        lessee = lesseeDoc.exists() ? lesseeDoc.data() : undefined;
      }

      let realEstate = undefined;
      if (contract.realEstate) {
        const realEstateDoc = await getDoc(contract.realEstate);
        realEstate = realEstateDoc.exists() ? realEstateDoc.data() : undefined;
      }

      if (!owner) {
        toast.error('Dados do proprietário não encontrados');
        return;
      }

      await documentService.generateContractDocument(
        {
          contract,
          owner,
          lessee,
          realEstate
        },
        format
      );

      toast.success(`Documento ${format.toUpperCase()} gerado com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      toast.error('Erro ao gerar documento. Tente novamente.');
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-9xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Lista de Contratos</h1>

        <div className="items-center mb-4 grid grid-cols-12 gap-2">
          <div className="col-span-12 md:col-span-4">
            <input
              type="text"
              placeholder={`Buscar por ${searchField === "ownerName" ? "Proprietário" : searchField}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded w-full shadow-sm focus:ring focus:border-blue-300"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <CustomSelect
              options={options}
              value={searchField}
              onChange={(value) =>
                setSearchField(
                  value as "ownerName" | "lesseeName" | "endDate" | "contractKind" | "status"
                )
              }
              placeholder="Selecione um campo"
            />
          </div>

          <div className="col-span-12 md:col-span-4 flex justify-end space-x-2">
            <button
              onClick={handleExport}
              className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white p-2 rounded transition-colors duration-200 ease-in-out flex items-center"
            >
              <Download className="mr-2" />
              Exportar Excel
            </button>
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
                      onClick={() => navigate(`${RoutesName.CONTRACT}/${contract.id}`)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleGenerateDocument(contract, 'docx')}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded flex items-center"
                      title="Gerar DOCX"
                    >
                      <FileText className="mr-1" />
                      DOCX
                    </button>
                    <button
                      onClick={() => handleGenerateDocument(contract, 'pdf')}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
                      title="Gerar PDF"
                    >
                      <FilePlus className="mr-1" />
                      PDF
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
