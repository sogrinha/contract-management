import { useState, useEffect } from "react";
import {
  fetchLessees,
  exportLesseesToExcel,
  deleteLessee,
} from "../../services/lesseeService";
import { Lessee } from "../../models/Lessee";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../components/inputs/CunstomSelect";
import CustomModal from "../../components/CustomModal";
import RoutesName from "../../routes/Routes";

const LesseeList = () => {
  const [lessees, setLessees] = useState<Lessee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<
    "fullName" | "cpf" | "rg" | "email" | "cep"
  >("fullName");
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lesseeToDelete, setLesseToDelete] = useState<string | null>(null);

  const pageSize = 15;

  const options = [
    { value: "fullName", label: "Nome Completo" },
    { value: "cpf", label: "CPF" },
    { value: "rg", label: "RG" },
    { value: "email", label: "Email" },
    { value: "cep", label: "CEP" },
  ];

  const loadLessees = async (reset = false) => {
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
      const { data, lastVisible: newLastVisible } = await fetchLessees(
        filters,
        pageSize,
        reset ? null : lastVisible
      );

      if (reset) {
        setLessees(data);
      } else {
        setLessees((prevLessees) => {
          const newLessees = data.filter(
            (newLessee) =>
              !prevLessees.some((lessee) => lessee.id === newLessee.id)
          );
          return [...prevLessees, ...newLessees];
        });
      }
      setLastVisible(newLastVisible);
    } catch (error) {
      console.error("Erro ao buscar Locatários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLastVisible(null);
    loadLessees(true);
  }, [searchTerm, searchField]);

  const handleExport = async () => {
    await exportLesseesToExcel();
  };

  const handleOpenModal = (id: string) => {
    setLesseToDelete(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setLesseToDelete(null);
  };

  const handleDeleteLessee = async () => {
    if (lesseeToDelete) {
      try {
        await deleteLessee(lesseeToDelete);
        setLessees(lessees.filter((lessee) => lessee.id !== lesseeToDelete));
        handleCloseModal();
      } catch (error) {
        console.error("Erro ao excluir locatário:", error);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-9xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Lista de Locatários</h1>
        <div className="items-center mb-4 grid grid-cols-12 gap-2">
          <input
            type="text"
            placeholder={`Buscar por ${searchField === "fullName" ? "Nome Completo" : searchField}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:ring pink-focus-input col-span-4"
          />
          <div className="col-span-4">
            {" "}
            <CustomSelect
              options={options}
              value={searchField}
              onChange={(value) =>
                setSearchField(
                  value as "fullName" | "cpf" | "rg" | "email" | "cep"
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
            {lessees.map((lessee) => (
              <tr key={lessee.id} className="border">
                <td className="border p-2">{lessee.fullName}</td>
                <td className="border p-2">{lessee.rg}</td>
                <td className="border p-2">{lessee.issuingBody}</td>
                <td className="border p-2">{lessee.cpf}</td>
                <td className="border p-2">{lessee.celphone}</td>
                <td className="border p-2">{lessee.email}</td>
                <td className="border p-2 flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`${RoutesName.LESSEE}/${lessee.id}`)
                    }
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleOpenModal(lessee.id ?? "")}
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
              onClick={() => loadLessees()}
              disabled={loading}
              className="bg-green-500 text-white p-2 rounded"
            >
              {loading ? "Carregando..." : "Carregar Mais"}
            </button>
          )}
        </div>
      </div>
      <CustomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDeleteLessee}
        title="Confirmação"
      >
        <p>Tem certeza que deseja confirmar esta ação?</p>
      </CustomModal>
    </div>
  );
};

export default LesseeList;
