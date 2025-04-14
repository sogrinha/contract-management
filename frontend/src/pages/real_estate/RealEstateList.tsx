import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRealEstates } from "../../services/realEstateService";
import {
  RealEstate,
  ERealEstateKind,
  EStatusRealEstate,
} from "../../models/RealEstate";
import CustomSelect from "../../components/inputs/CunstomSelect"; // corrigido typo: "CunstomSelect" -> "CustomSelect"
import CustomModal from "../../components/CustomModal";
import RoutesName from "../../routes/Routes";

const RealEstateList = () => {
  const [realEstates, setRealEstates] = useState<RealEstate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<
    | "ownerName"
    | "lesseeName"
    | "municipalRegistration"
    | "realEstateKind"
    | "statusRealEstate"
  >("ownerName");
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [realEstateToDelete, setRealEstateToDelete] = useState<string | null>(
    null
  );
  const navigate = useNavigate();

  const pageSize = 50;

  const options = [
    { value: "ownerName", label: "Proprietário" },
    { value: "lesseeName", label: "Locatário" },
    { value: "municipalRegistration", label: "Registro" },
    { value: "realEstateKind", label: "Tipo" },
    { value: "statusRealEstate", label: "Status" },
  ];

  const enumToOptions = (enumObj: Record<string, string>) => {
    return Object.values(enumObj).map((value) => ({
      value,
      label: value,
    }));
  };

  const loadRealEstates = async (reset = false) => {
    if (reset) setLoading(true);
    else setIsLoadingMore(true);

    let filters: any = {};

    if (
      searchTerm.length >= 3 ||
      searchField === "realEstateKind" ||
      searchField === "statusRealEstate"
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
      const { data, lastVisible: newLastVisible } = await fetchRealEstates(
        filters,
        pageSize,
        reset ? null : lastVisible
      );

      if (reset) {
        setRealEstates(data);
      } else {
        setRealEstates((prev) => {
          const newItems = data.filter(
            (item) => !prev.some((i) => i.id === item.id)
          );
          return [...prev, ...newItems];
        });
      }
      setLastVisible(newLastVisible);
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setLastVisible(null);
    loadRealEstates(true);
  }, [searchTerm, searchField]);

  const handleOpenModal = (id: string) => {
    setRealEstateToDelete(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRealEstateToDelete(null);
  };

  const handleDeleteRealEstate = async () => {
    if (realEstateToDelete) {
      try {
        // await deleteRealEstate(realEstateToDelete);
        setRealEstates((prev) =>
          prev.filter((re) => re.id !== realEstateToDelete)
        );
        handleCloseModal();
      } catch (error) {
        console.error("Erro ao excluir imóvel:", error);
      }
    }
  };

  const handleFieldChange = (value: any) => {
    setSearchField(value);
    setSearchTerm("");
  };

  const isEnumField =
    searchField === "realEstateKind" || searchField === "statusRealEstate";

  const getEnumOptions = () => {
    if (searchField === "realEstateKind") return enumToOptions(ERealEstateKind);
    if (searchField === "statusRealEstate")
      return enumToOptions(EStatusRealEstate);
    return [];
  };

  return (
    <div className="bg-gray-100 p-4 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Lista de Imóveis</h1>

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
                type="text"
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
                <th className="p-3 text-left border">Registro</th>
                <th className="p-3 text-left border">Endereço</th>
                <th className="p-3 text-left border">Tipo</th>
                <th className="p-3 text-left border">Status</th>
                <th className="p-3 text-center border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {realEstates.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center p-6 text-gray-500">
                    Nenhum imóvel encontrado.
                  </td>
                </tr>
              )}
              {realEstates.map((re) => (
                <tr key={re.id} className="hover:bg-gray-100 transition">
                  <td className="p-3 border">{re.ownerName ?? "-"}</td>
                  <td className="p-3 border">{re.lesseeName ?? "-"}</td>
                  <td className="p-3 border">{re.municipalRegistration}</td>
                  <td className="p-3 border">
                    {`${re.street}, ${re.number} - ${re.neighborhood}, ${re.city}`}
                  </td>
                  <td className="p-3 border">{re.realEstateKind}</td>
                  <td className="p-3 border">{re.statusRealEstate}</td>
                  <td className="p-3 border text-center flex justify-center gap-2">
                    <button
                      onClick={() =>
                        navigate(`${RoutesName.REAL_ESTATE}/${re.id}`)
                      }
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleOpenModal(re.id ?? "")}
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
              onClick={() => loadRealEstates()}
              disabled={isLoadingMore}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded disabled:bg-green-300"
            >
              {isLoadingMore ? "Carregando..." : "Carregar mais"}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {/* <CustomModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h2 className="text-xl font-semibold mb-4">Confirmar Exclusão</h2>
        <p>Tem certeza que deseja excluir este imóvel?</p>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleDeleteRealEstate}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Excluir
          </button>
        </div>
      </CustomModal> */}
    </div>
  );
};

export default RealEstateList;
